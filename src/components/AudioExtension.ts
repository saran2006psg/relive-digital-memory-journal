import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string }) => ReturnType
    }
  }
}

export const AudioExtension = Node.create({
  name: 'audio',

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
        tag: 'audio',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'audio-wrapper', style: 'margin: 1rem 0;' },
      [
        'audio',
        {
          ...HTMLAttributes,
          controls: 'true',
          style: 'width: 100%; max-width: 640px; border-radius: 0.5rem; border: 4px solid white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: block;',
        },
      ],
    ]
  },

  addCommands() {
    return {
      setAudio:
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
