import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${memoryId || 'temp'}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('memory-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('memory-media')
      .getPublicUrl(filePath)

    // If memoryId provided, save to media table
    if (memoryId) {
      const { data: media, error: mediaError } = await supabase
        .from('media')
        .insert({
          memory_id: memoryId,
          url: publicUrl,
          type: file.type.startsWith('video/') ? 'video' : 'image',
        })
        .select()
        .single()

      if (mediaError) {
        console.error('Media insert error:', mediaError)
        return NextResponse.json(
          { error: mediaError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true,
        media,
        url: publicUrl 
      })
    }

    // Return just the URL if no memoryId
    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      path: filePath 
    })
  } catch (error: any) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
