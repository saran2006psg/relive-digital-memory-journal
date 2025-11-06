import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const memoryId = formData.get('memoryId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4' },
        { status: 400 }
      )
    }

    console.log(`[Upload] Starting upload for user ${user.id}, memory ${memoryId}, file: ${file.name}`)

    // Convert File to Buffer for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine resource type
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
    
    // Generate unique public_id
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const publicId = `relive/${user.id}/${memoryId || 'temp'}/${timestamp}_${randomStr}`

    console.log(`[Upload] Uploading to Cloudinary with public_id: ${publicId}`)

    // Upload to Cloudinary with optimization
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions: any = {
        public_id: publicId,
        resource_type: resourceType,
        folder: `relive/${user.id}`,
        context: `user_id=${user.id}|memory_id=${memoryId || 'temp'}`,
        tags: ['relive', user.id, memoryId || 'temp']
      }

      // Add image-specific optimizations
      if (resourceType === 'image') {
        uploadOptions.transformation = [
          { quality: 'auto:good', fetch_format: 'auto' },
          { width: 2000, height: 2000, crop: 'limit' }
        ]
        uploadOptions.eager = [
          { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }, // Thumbnail
          { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }  // Medium
        ]
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('[Upload] Cloudinary error:', error)
            reject(error)
          } else {
            console.log('[Upload] Cloudinary success:', result?.public_id)
            resolve(result)
          }
        }
      )
      uploadStream.end(buffer)
    })

    const cloudinaryResult = uploadResult as any

    // Generate optimized URLs
    const secureUrl = cloudinaryResult.secure_url
    const thumbnailUrl = cloudinaryResult.eager?.[0]?.secure_url || secureUrl

    console.log(`[Upload] Generated URLs - Main: ${secureUrl}, Thumbnail: ${thumbnailUrl}`)

    // Save to database
    if (memoryId) {
      const { data: media, error: mediaError } = await supabase
        .from('media')
        .insert({
          memory_id: memoryId,
          url: secureUrl,
          type: resourceType,
          thumbnail_url: thumbnailUrl,
          cloudinary_id: cloudinaryResult.public_id,
          cloudinary_url: secureUrl,
          width: cloudinaryResult.width || null,
          height: cloudinaryResult.height || null,
          format: cloudinaryResult.format || file.type.split('/')[1],
          size_bytes: cloudinaryResult.bytes || file.size,
        })
        .select()
        .single()

      if (mediaError) {
        console.error('[Upload] Database insert error:', mediaError)
        
        // Clean up Cloudinary upload if database fails
        try {
          await cloudinary.uploader.destroy(cloudinaryResult.public_id, { 
            resource_type: resourceType 
          })
          console.log('[Upload] Cleaned up Cloudinary file after DB error')
        } catch (cleanupError) {
          console.error('[Upload] Failed to cleanup Cloudinary:', cleanupError)
        }

        return NextResponse.json(
          { error: mediaError.message },
          { status: 500 }
        )
      }

      console.log(`[Upload] Successfully saved media record: ${media.id}`)

      return NextResponse.json({ 
        success: true,
        media: {
          id: media.id,
          url: secureUrl,
          thumbnail_url: thumbnailUrl,
          type: resourceType,
          cloudinary_id: cloudinaryResult.public_id,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          size: cloudinaryResult.bytes
        }
      })
    }

    // Return just the URL if no memoryId
    return NextResponse.json({ 
      success: true,
      url: secureUrl,
      thumbnail_url: thumbnailUrl,
      cloudinary_id: cloudinaryResult.public_id,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height
    })
  } catch (error: any) {
    console.error('[Upload] Upload failed:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
