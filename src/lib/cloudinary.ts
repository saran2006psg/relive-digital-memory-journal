/**
 * Cloudinary Helper Utilities
 * Provides functions for generating optimized image URLs with transformations
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlt5ersuq'

/**
 * Extract public ID from Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Generate optimized image URL with transformations
 * @param url - Original Cloudinary URL or public_id
 * @param options - Transformation options
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number
    format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif'
    crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'pad'
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  } = {}
): string {
  // If URL is from Cloudinary, extract public_id
  const publicId = url.includes('cloudinary.com') ? getPublicIdFromUrl(url) : url

  if (!publicId) {
    return url // Return original if can't parse
  }

  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    crop = 'limit',
    gravity = 'auto'
  } = options

  // Build transformation string
  const transformations: string[] = []

  if (width || height) {
    const dimensions = [
      width && `w_${width}`,
      height && `h_${height}`,
      crop && `c_${crop}`,
      gravity !== 'auto' && `g_${gravity}`
    ].filter(Boolean).join(',')
    
    transformations.push(dimensions)
  }

  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  const transformStr = transformations.join('/')

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}/${publicId}`
}

/**
 * Generate thumbnail URL
 * @param url - Original Cloudinary URL or public_id
 * @param size - Thumbnail size (default: 400x400)
 */
export function getThumbnailUrl(
  url: string,
  size: number = 400
): string {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto'
  })
}

/**
 * Generate responsive srcSet for different screen sizes
 * @param url - Original Cloudinary URL or public_id
 * @param sizes - Array of widths to generate (default: [400, 800, 1200, 1600])
 */
export function getResponsiveImageSrcSet(
  url: string,
  sizes: number[] = [400, 800, 1200, 1600]
): string {
  return sizes
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(url, {
        width,
        crop: 'limit',
        quality: 'auto:good',
        format: 'auto'
      })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Generate blur placeholder URL (tiny low-quality version for loading)
 * @param url - Original Cloudinary URL or public_id
 */
export function getBlurPlaceholderUrl(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 20,
    quality: 'auto:low',
    format: 'auto',
    crop: 'fill'
  })
}

/**
 * Generate video thumbnail URL
 * @param url - Original Cloudinary video URL or public_id
 */
export function getVideoThumbnailUrl(url: string): string {
  const publicId = url.includes('cloudinary.com') ? getPublicIdFromUrl(url) : url

  if (!publicId) {
    return url
  }

  // Generate thumbnail from first frame
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/w_800,h_800,c_fill,q_auto,f_auto,so_0/${publicId}.jpg`
}

/**
 * Check if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary')
}

/**
 * Get optimized video URL with transformations
 * @param url - Original Cloudinary video URL or public_id
 * @param options - Video transformation options
 */
export function getOptimizedVideoUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'mp4' | 'webm'
  } = {}
): string {
  const publicId = url.includes('cloudinary.com') ? getPublicIdFromUrl(url) : url

  if (!publicId) {
    return url
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto'
  } = options

  const transformations: string[] = []

  if (width || height) {
    const dimensions = [
      width && `w_${width}`,
      height && `h_${height}`,
      'c_limit'
    ].filter(Boolean).join(',')
    
    transformations.push(dimensions)
  }

  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  const transformStr = transformations.join('/')

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformStr}/${publicId}`
}
