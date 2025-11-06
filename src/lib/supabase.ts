import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export type Memory = {
  id: string
  user_id: string
  title: string
  content: string
  date: string
  location?: string
  mood?: string
  created_at: string
  updated_at: string
}

export type Media = {
  id: string
  memory_id: string
  url: string
  type: 'image' | 'video'
  thumbnail_url?: string
  uploaded_at: string
}

export type Tag = {
  id: string
  name: string
}

// Upload image to Supabase Storage
export async function uploadImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('memory-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('memory-photos')
    .getPublicUrl(fileName)

  return {
    path: data.path,
    url: publicUrl
  }
}

// Delete image from Supabase Storage
export async function deleteImage(path: string) {
  const { error } = await supabase.storage
    .from('memory-photos')
    .remove([path])

  if (error) {
    throw error
  }
}
