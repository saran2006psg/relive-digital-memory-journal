import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const memoryId = formData.get('memoryId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const { path, url } = await uploadImage(file, userId)

    // If memoryId provided, save to media table
    if (memoryId) {
      const { data, error } = await supabase
        .from('media')
        .insert([
          {
            memory_id: memoryId,
            url: url,
            type: file.type.startsWith('video') ? 'video' : 'image',
          },
        ])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ media: data })
    }

    // Return just the URL if no memoryId
    return NextResponse.json({ url, path })
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
