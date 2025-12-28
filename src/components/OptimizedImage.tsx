"use client"

import { memo, useState, useEffect, useRef } from "react"
import { getThumbnailUrl, getOptimizedImageUrl, isCloudinaryUrl } from "@/lib/cloudinary"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low'
  priority?: boolean
  onLoad?: () => void
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  quality = 'auto:good',
  priority = false,
  onLoad
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)

  // Use Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Generate optimized URL if it's a Cloudinary image
  const optimizedSrc = isCloudinaryUrl(src)
    ? getOptimizedImageUrl(src, {
        width,
        height,
        quality,
        format: 'auto',
        crop: 'fill',
        gravity: 'auto'
      })
    : src

  // Generate blur placeholder
  const placeholderSrc = isCloudinaryUrl(src)
    ? getThumbnailUrl(src, 20)
    : undefined

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : (placeholderSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
      />

      {/* Loading skeleton */}
      {!isLoaded && !placeholderSrc && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
})
