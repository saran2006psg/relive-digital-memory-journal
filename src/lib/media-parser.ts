/**
 * Media Parser Utility
 * Extracts media URLs from HTML content and prepares them for storage
 */

export interface MediaItem {
  memory_id: string
  url: string
  type: 'image' | 'video' | 'audio'
  media_type: 'image' | 'video' | 'audio'
  cloudinary_url: string
  cloudinary_id: string | null
}

/**
 * Extract Cloudinary public ID from URL
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export function extractCloudinaryId(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

/**
 * Parse HTML content and extract all media URLs
 * @param htmlContent - HTML string from Tiptap editor
 * @returns Array of media items found in content
 */
export function parseMediaFromHTML(htmlContent: string): Omit<MediaItem, 'memory_id'>[] {
  const mediaItems: Omit<MediaItem, 'memory_id'>[] = []

  // Regular expressions to extract media URLs from HTML
  const patterns = [
    { regex: /<img[^>]+src="([^">]+)"/g, type: 'image' as const },
    { regex: /<video[^>]+src="([^">]+)"/g, type: 'video' as const },
    { regex: /<audio[^>]+src="([^">]+)"/g, type: 'audio' as const },
  ]

  patterns.forEach(({ regex, type }) => {
    let match
    while ((match = regex.exec(htmlContent)) !== null) {
      const url = match[1]
      // Skip base64 placeholders and data URIs
      if (url && !url.startsWith('data:')) {
        mediaItems.push({
          url: url,
          type: type,
          media_type: type,
          cloudinary_url: url,
          cloudinary_id: extractCloudinaryId(url),
        })
      }
    }
  })

  return mediaItems
}

/**
 * Extract and store media from HTML content
 * @param supabase - Supabase client instance
 * @param memoryId - Memory ID to associate media with
 * @param htmlContent - HTML content containing media
 * @param updateMode - If true, deletes existing media before inserting
 */
export async function extractAndStoreMedia(
  supabase: any,
  memoryId: string,
  htmlContent: string,
  updateMode: boolean = false
): Promise<{ success: boolean; count: number; error?: any }> {
  try {
    // In update mode, delete existing media first
    if (updateMode) {
      await supabase.from('media').delete().eq('memory_id', memoryId)
    }

    // Parse HTML and extract media
    const parsedMedia = parseMediaFromHTML(htmlContent)

    if (parsedMedia.length === 0) {
      return { success: true, count: 0 }
    }

    // Add memory_id to each item
    const mediaItems = parsedMedia.map(item => ({
      ...item,
      memory_id: memoryId,
    }))

    // Insert into database
    const { error } = await supabase.from('media').insert(mediaItems)

    if (error) {
      console.error('Error storing media metadata:', error)
      return { success: false, count: 0, error }
    }

    return { success: true, count: mediaItems.length }
  } catch (error) {
    console.error('Error in extractAndStoreMedia:', error)
    return { success: false, count: 0, error }
  }
}

/**
 * Get media statistics from HTML content
 * @param htmlContent - HTML string
 * @returns Count of each media type
 */
export function getMediaStats(htmlContent: string): {
  images: number
  videos: number
  audio: number
  total: number
} {
  const media = parseMediaFromHTML(htmlContent)
  
  return {
    images: media.filter(m => m.type === 'image').length,
    videos: media.filter(m => m.type === 'video').length,
    audio: media.filter(m => m.type === 'audio').length,
    total: media.length,
  }
}

/**
 * Strip HTML tags and get plain text content
 * @param htmlContent - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(htmlContent: string): string {
  // Remove HTML tags
  let text = htmlContent.replace(/<[^>]*>/g, ' ')
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}
