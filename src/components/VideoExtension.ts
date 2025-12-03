import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
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
    return [
      'div',
      { class: 'video-wrapper', style: 'margin: 1rem 0;' },
      [
        'video',
        {
          ...HTMLAttributes,
          controls: 'true',
          style: 'max-width: 640px; width: 100%; border-radius: 0.5rem; border: 4px solid white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: block;',
        },
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
