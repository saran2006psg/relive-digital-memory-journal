import Image from '@tiptap/extension-image'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageResize'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const { doc, selection } = state
            const { from } = selection

            doc.descendants((node, pos) => {
              if (node.type.name === 'image') {
                if (pos === from - 1 || (pos < from && pos + node.nodeSize > from)) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: 'selected-image',
                    })
                  )
                }
              }
            })

            return DecorationSet.create(doc, decorations)
          },
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target as HTMLElement
              if (target.tagName === 'IMG') {
                const pos = view.posAtDOM(target, 0)
                const node = view.state.doc.nodeAt(pos)
                
                if (node && node.type.name === 'image') {
                  let isResizing = false
                  const startWidth = target.offsetWidth
                  const startX = event.clientX

                  const onMouseMove = (e: MouseEvent) => {
                    if (!isResizing && Math.abs(e.clientX - startX) > 5) {
                      isResizing = true
                    }
                    
                    if (isResizing) {
                      const diffX = e.clientX - startX
                      const newWidth = Math.max(100, startWidth + diffX)
                      
                      target.style.width = `${newWidth}px`
                      target.style.height = 'auto'
                    }
                  }

                  const onMouseUp = (e: MouseEvent) => {
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    
                    if (isResizing) {
                      const newWidth = parseInt(target.style.width)
                      
                      const { tr } = view.state
                      tr.setNodeMarkup(pos, null, {
                        ...node.attrs,
                        width: newWidth,
                      })
                      view.dispatch(tr)
                      
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  }

                  document.addEventListener('mousemove', onMouseMove)
                  document.addEventListener('mouseup', onMouseUp)
                }
              }
              return false
            },
          },
        },
      }),
    ]
  },
})
