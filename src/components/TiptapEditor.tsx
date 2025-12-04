"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import SuperscriptExt from '@tiptap/extension-superscript'
import SubscriptExt from '@tiptap/extension-subscript'
import Highlight from '@tiptap/extension-highlight'
import Youtube from '@tiptap/extension-youtube'
import { ResizableImageExtension } from './ResizableImageExtension'
import { VideoExtension } from './VideoExtension'
import { AudioExtension } from './AudioExtension'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Strikethrough,
  Code,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Superscript,
  Subscript,
  Undo,
  Redo,
  Plus,
  ChevronDown,
  Highlighter,
  Video,
  Music
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  toolbarOnly?: boolean
  editorOnly?: boolean
}

export function TiptapEditor({ content, onChange, placeholder, toolbarOnly = false, editorOnly = false }: TiptapEditorProps) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false)
  const [, setForceUpdate] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your thoughts...',
      }),
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'resizable-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#3498db] underline hover:text-[#2980b9] transition-colors',
        },
      }),
      Underline,
      SuperscriptExt,
      SubscriptExt,
      Highlight.configure({
        multicolor: false,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      VideoExtension,
      AudioExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none text-lg text-[#2c3e50] px-0 py-0 handwritten',
        style: 'white-space: pre-wrap; word-wrap: break-word; min-height: 300px;'
      },
      handleDOMEvents: {
        drop: (view, event) => {
          event.preventDefault()
          return false
        },
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: () => {
      setForceUpdate(prev => prev + 1)
    },
    onTransaction: () => {
      setForceUpdate(prev => prev + 1)
    },
  })

  if (!editor) {
    return null
  }

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        for (const file of Array.from(files)) {
          // Show loading placeholder
          const loadingPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EUploading...%3C/text%3E%3C/svg%3E'
          editor.chain().focus().setImage({ src: loadingPlaceholder }).run()
          
          try {
            // Get auth token
            const { createBrowserClient } = await import('@supabase/ssr')
            const supabase = createBrowserClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session) {
              throw new Error('Not authenticated')
            }
            
            // Upload to Cloudinary via API
            const formData = new FormData()
            formData.append('file', file)
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              },
              body: formData
            })
            
            if (!response.ok) {
              throw new Error('Upload failed')
            }
            
            const data = await response.json()
            
            // Replace loading placeholder with actual image
            // Find and replace the loading image
            const { state } = editor
            const { doc } = state
            let imagePos = -1
            
            doc.descendants((node, pos) => {
              if (node.type.name === 'image' && node.attrs.src === loadingPlaceholder) {
                imagePos = pos
                return false
              }
            })
            
            if (imagePos !== -1) {
              editor.chain()
                .focus()
                .setNodeSelection(imagePos)
                .deleteSelection()
                .setImage({ src: data.url })
                .run()
            }
          } catch (error) {
            console.error('Failed to upload image:', error)
            // Remove loading placeholder on error
            const { state } = editor
            const { doc } = state
            
            doc.descendants((node, pos) => {
              if (node.type.name === 'image' && node.attrs.src === loadingPlaceholder) {
                editor.chain()
                  .focus()
                  .setNodeSelection(pos)
                  .deleteSelection()
                  .run()
                return false
              }
            })
            alert('Failed to upload image. Please try again.')
          }
        }
      }
    }
    input.click()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // If no text is selected, use the URL as the text
    const { from, to } = editor.state.selection
    if (from === to) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}">${url}</a>`)
        .run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const addVideo = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Insert placeholder
        editor.commands.setVideo({ src: 'data:video/mp4;base64,uploading' })
        
        try {
          // Get auth token
          const { createBrowserClient } = await import('@supabase/ssr')
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          const { data: { session } } = await supabase.auth.getSession()
          
          if (!session) {
            throw new Error('Not authenticated')
          }
          
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
          })
          
          if (!response.ok) throw new Error('Upload failed')
          
          const data = await response.json()
          
          // Replace placeholder with actual video URL
          const { state } = editor
          const { doc } = state
          
          doc.descendants((node, pos) => {
            if (node.type.name === 'video') {
              editor.chain()
                .focus()
                .setNodeSelection(pos)
                .deleteSelection()
                .setVideo({ src: data.url })
                .run()
              return false
            }
          })
        } catch (error) {
          console.error('Failed to upload video:', error)
          alert('Failed to upload video. Please try again.')
        }
      }
    }
    input.click()
  }

  const addAudio = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Insert placeholder
        editor.commands.setAudio({ src: 'data:audio/mp3;base64,uploading' })
        
        try {
          // Get auth token
          const { createBrowserClient } = await import('@supabase/ssr')
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          const { data: { session } } = await supabase.auth.getSession()
          
          if (!session) {
            throw new Error('Not authenticated')
          }
          
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
          })
          
          if (!response.ok) throw new Error('Upload failed')
          
          const data = await response.json()
          
          // Replace placeholder with actual audio URL
          const { state } = editor
          const { doc } = state
          
          doc.descendants((node, pos) => {
            if (node.type.name === 'audio') {
              editor.chain()
                .focus()
                .setNodeSelection(pos)
                .deleteSelection()
                .setAudio({ src: data.url })
                .run()
              return false
            }
          })
        } catch (error) {
          console.error('Failed to upload audio:', error)
          alert('Failed to upload audio. Please try again.')
        }
      }
    }
    input.click()
  }

  return (
    <div className="tiptap-editor">
      {/* Toolbar */}
      {!editorOnly && (
        <div className={`${toolbarOnly ? '' : 'sticky top-0 z-50 mb-4'} ${toolbarOnly ? 'bg-transparent border-0' : 'bg-[#fef9f3] border-2 border-[#d4b896] rounded-lg shadow-lg'} px-2 py-1 flex flex-wrap gap-1`}>
        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 text-[#8b6f47] hover:text-[#5c4a2a] disabled:opacity-30 disabled:text-gray-400 disabled:hover:scale-100"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 text-[#8b6f47] hover:text-[#5c4a2a] disabled:opacity-30 disabled:text-gray-400 disabled:hover:scale-100"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#d4b896] mx-1 self-center" />

        {/* Heading Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            className="p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 text-[#8b6f47] hover:text-[#5c4a2a] flex items-center gap-1"
            title="Heading"
          >
            {editor.isActive('heading', { level: 1 }) ? (
              <Heading1 className="w-4 h-4" />
            ) : editor.isActive('heading', { level: 2 }) ? (
              <Heading2 className="w-4 h-4" />
            ) : editor.isActive('heading', { level: 3 }) ? (
              <Heading3 className="w-4 h-4" />
            ) : (
              <>H</>
            )}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {showHeadingMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border-2 border-[#d4b896] rounded-lg shadow-lg p-1 z-30 min-w-[120px]">
              <button
                onClick={() => {
                  editor.chain().focus().setParagraph().run()
                  setShowHeadingMenu(false)
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-[#d4b896]/40 transition-all duration-200 ${
                  editor.isActive('paragraph') ? 'bg-[#8b6f47] text-white' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                  setShowHeadingMenu(false)
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-[#d4b896]/40 transition-all duration-200 text-xl font-bold ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-[#8b6f47] text-white' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
                }`}
              >
                Heading 1
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                  setShowHeadingMenu(false)
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-[#d4b896]/40 transition-all duration-200 text-lg font-bold ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-[#8b6f47] text-white' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
                }`}
              >
                Heading 2
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                  setShowHeadingMenu(false)
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-[#d4b896]/40 transition-all duration-200 font-bold ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-[#8b6f47] text-white' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
                }`}
              >
                Heading 3
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[#d4b896] mx-1 self-center" />

        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('bold') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          } disabled:opacity-30`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('italic') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          } disabled:opacity-30`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('underline') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('strike') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('code') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (editor.isActive('highlight')) {
              editor.chain().focus().unsetHighlight().run()
            } else {
              editor.chain().focus().toggleHighlight().run()
            }
          }}
          disabled={!editor.can().chain().focus().toggleHighlight().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('highlight') ? 'bg-[#d4b896] text-[#5c4a2a] shadow-md border-2 border-[#b89b6a]' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          } disabled:opacity-30`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#d4b896] mx-1 self-center" />

        {/* Superscript and Subscript */}
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('superscript') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Superscript"
        >
          <span className="text-xs font-bold">x²</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('subscript') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Subscript"
        >
          <span className="text-xs font-bold">x₂</span>
        </button>

        <div className="w-px h-6 bg-[#d4b896] mx-1 self-center" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('bulletList') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          } disabled:opacity-30`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('orderedList') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          } disabled:opacity-30`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#d4b896] mx-1 self-center" />

        {/* Text Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#d4b896] mx-1 self-center" />

        {/* Link */}
        <button
          onClick={setLink}
          className={`p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 ${
            editor.isActive('link') ? 'bg-[#8b6f47] text-white shadow-md' : 'text-[#8b6f47] hover:text-[#5c4a2a]'
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#d4b896] mx-1 self-center" />

        {/* Image */}
        <button
          onClick={addImage}
          className="p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 text-[#8b6f47] hover:text-[#5c4a2a]"
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Video */}
        <button
          onClick={addVideo}
          className="p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 text-[#8b6f47] hover:text-[#5c4a2a]"
          title="Add Video"
        >
          <Video className="w-4 h-4" />
        </button>

        {/* Audio */}
        <button
          onClick={addAudio}
          className="p-2 rounded-lg hover:bg-[#d4b896]/40 hover:scale-105 transition-all duration-200 text-[#8b6f47] hover:text-[#5c4a2a]"
          title="Add Audio"
        >
          <Music className="w-4 h-4" />
        </button>
      </div>
      )}

      {/* Editor Content */}
      {!toolbarOnly && <EditorContent editor={editor} className="tiptap-content" />}

      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          outline: none;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          font-family: var(--font-architects-daughter), 'Dancing Script', cursive !important;
          caret-color: #8b7355;
        }

        .tiptap-editor .ProseMirror strong,
        .tiptap-editor .ProseMirror em,
        .tiptap-editor .ProseMirror u,
        .tiptap-editor .ProseMirror s,
        .tiptap-editor .ProseMirror code,
        .tiptap-editor .ProseMirror mark {
          caret-color: #8b7355;
        }

        .tiptap-editor .ProseMirror * {
          word-break: normal;
          white-space: normal;
        }

        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #7f8c8d;
          opacity: 0.5;
          pointer-events: none;
          height: 0;
        }

        .tiptap-editor .ProseMirror p {
          line-height: 24px;
          margin: 0;
          word-spacing: normal;
          letter-spacing: normal;
          min-height: 24px;
        }

        .tiptap-editor .ProseMirror * {
          word-break: normal;
          overflow-wrap: normal;
        }

        .tiptap-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 48px;
        }

        .tiptap-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          line-height: 36px;
        }

        .tiptap-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          line-height: 30px;
        }

        .tiptap-editor .ProseMirror ul,
        .tiptap-editor .ProseMirror ol {
          padding-left: 2rem;
          margin: 0.5rem 0;
          list-style-position: outside;
        }

        .tiptap-editor .ProseMirror ul {
          list-style-type: disc;
        }

        .tiptap-editor .ProseMirror ol {
          list-style-type: decimal;
        }

        .tiptap-editor .ProseMirror li {
          line-height: 24px;
          display: list-item;
        }

        .tiptap-editor .ProseMirror li p {
          margin: 0;
          display: inline;
        }

        .tiptap-editor .ProseMirror blockquote {
          border-left: 4px solid #3498db;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #555;
          font-style: italic;
        }

        .tiptap-editor .ProseMirror img {
          max-width: 400px;
          width: auto;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 4px solid white;
          margin: 1rem 0;
          display: block;
          cursor: grab;
          transition: all 0.2s ease;
          position: relative;
        }

        .tiptap-editor .ProseMirror img:hover {
          box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
          border-color: #3498db;
        }

        .tiptap-editor .ProseMirror img:active {
          cursor: grabbing;
        }

        .tiptap-editor .ProseMirror img.ProseMirror-selectednode,
        .tiptap-editor .ProseMirror img.selected-image {
          outline: 3px solid #3498db;
          outline-offset: 2px;
          border-color: #3498db;
          box-shadow: 0 8px 16px rgba(52, 152, 219, 0.4);
        }

        /* Resize handle indicator */
        .tiptap-editor .ProseMirror img.ProseMirror-selectednode::after {
          content: '⇲';
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: #3498db;
          color: white;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 14px;
          cursor: nwse-resize;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .tiptap-editor .ProseMirror strong {
          font-weight: bold;
        }

        .tiptap-editor .ProseMirror em {
          font-style: italic;
        }

        .tiptap-editor .ProseMirror u {
          text-decoration: underline;
        }

        .tiptap-editor .ProseMirror s {
          text-decoration: line-through;
        }

        .tiptap-editor .ProseMirror code {
          background-color: #f5f5f5;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
          color: #e83e8c;
        }

        .tiptap-editor .ProseMirror a {
          color: #3498db;
          text-decoration: underline;
          cursor: pointer;
        }

        .tiptap-editor .ProseMirror a:hover {
          color: #2980b9;
        }

        .tiptap-editor .ProseMirror sup {
          vertical-align: super;
          font-size: smaller;
        }

        .tiptap-editor .ProseMirror sub {
          vertical-align: sub;
          font-size: smaller;
        }

        .tiptap-editor .ProseMirror mark {
          background-color: #ffeb3b;
          color: inherit;
          padding: 0.125rem 0.25rem;
          border-radius: 0.125rem;
        }

        .tiptap-editor .ProseMirror iframe {
          max-width: 100%;
          border-radius: 0.5rem;
          border: 4px solid white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
        }

        .tiptap-editor .ProseMirror video {
          max-width: 500px;
          width: 100%;
          height: auto;
          border-radius: 0.5rem;
          border: 4px solid white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
          display: block;
        }

        .tiptap-editor .ProseMirror audio {
          width: 100%;
          max-width: 400px;
          margin: 1rem 0;
          display: block;
        }
      `}</style>
    </div>
  )
}
