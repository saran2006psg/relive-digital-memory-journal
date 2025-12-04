import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

// Helper function to get MIME type from URL
function getVideoMimeType(url: string): string {
  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary')) {
    // Cloudinary videos are typically served as mp4
    return 'video/mp4'
  }
  
  const extension = url.split('.').pop()?.toLowerCase().split('?')[0] || ''
  const mimeTypes: Record<string, string> = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'ogv': 'video/ogg',
    'mov': 'video/mp4',
    'avi': 'video/x-msvideo',
    'm4v': 'video/mp4',
  }
  return mimeTypes[extension] || 'video/mp4'
}

// Transform Cloudinary URL to ensure mp4 format
function transformVideoUrl(url: string): string {
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary')) {
    // Add f_mp4 transformation to ensure mp4 format delivery
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/video/upload/[transformations]/public_id
    if (url.includes('/upload/')) {
      // Check if there are already transformations
      const parts = url.split('/upload/')
      if (parts.length === 2) {
        // Add format transformation
        return `${parts[0]}/upload/f_mp4,q_auto/${parts[1]}`
      }
    }
  }
  return url
}

// Check if URL is a placeholder/loading state
function isPlaceholder(url: string): boolean {
  return !url || 
         url.includes('data:video') || 
         url.includes('uploading') || 
         url === 'null' || 
         url === 'undefined'
}

export const VideoExtension = Node.create({
  name: 'video',

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const originalSrc = HTMLAttributes.src || ''
    
    // If it's a placeholder, show loading state with vintage theme
    if (isPlaceholder(originalSrc)) {
      return [
        'div',
        { 
          class: 'video-wrapper video-loading', 
          style: `
            margin: 1rem 0;
            max-width: 640px;
            width: 100%;
            min-height: 200px;
            background: linear-gradient(135deg, #fef9f3 0%, #f5f0e8 50%, #ede5d8 100%);
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px dashed #d4b896;
            box-shadow: 0 4px 12px rgba(139, 111, 71, 0.15);
          `.replace(/\s+/g, ' ').trim()
        },
        [
          'div',
          { style: 'text-align: center; padding: 2rem;' },
          [
            'div',
            { 
              style: `
                width: 60px;
                height: 60px;
                margin: 0 auto 1rem;
                border: 4px solid #d4b896;
                border-top-color: #8b6f47;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              `.replace(/\s+/g, ' ').trim()
            },
          ],
          [
            'div',
            { 
              style: `
                font-size: 1.1rem;
                color: #8b6f47;
                font-family: var(--font-architects-daughter), cursive;
                font-weight: 600;
              `.replace(/\s+/g, ' ').trim()
            },
            '📽️ Uploading your video...'
          ],
          [
            'div',
            { 
              style: `
                font-size: 0.85rem;
                color: #a08060;
                font-family: var(--font-architects-daughter), cursive;
                margin-top: 0.5rem;
              `.replace(/\s+/g, ' ').trim()
            },
            'Please wait a moment'
          ],
        ]
      ]
    }
    
    const src = transformVideoUrl(originalSrc)
    const mimeType = getVideoMimeType(src)
    
    return [
      'div',
      { class: 'video-wrapper', style: 'margin: 1rem 0;' },
      [
        'video',
        {
          src: src,
          controls: 'true',
          preload: 'metadata',
          playsinline: 'true',
          style: 'max-width: 640px; width: 100%; border-radius: 0.5rem; border: 4px solid white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: block;',
        },
        [
          'source',
          {
            src: src,
            type: mimeType,
          },
        ],
      ],
    ]
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
