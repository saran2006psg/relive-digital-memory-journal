"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, MapPin, Image as ImageIcon, Video, X, Save, BookOpen, ArrowLeft, Maximize2, Mic, MicOff, ChevronDown, Type } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { UserMenu } from "@/components/UserMenu"
import { MobileNav } from "@/components/MobileNav"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { createBrowserClient } from "@supabase/ssr"
import { TiptapEditor } from "@/components/TiptapEditor"

const moodEmojis = [
  { emoji: "😊", label: "Happy", color: "#B5D99C" },
  { emoji: "😌", label: "Calm", color: "#8dd3c7" },
  { emoji: "😍", label: "Loved", color: "#ff9a8b" },
  { emoji: "😔", label: "Sad", color: "#A8B5E8" },
  { emoji: "😢", label: "Crying", color: "#9BB5E8" },
  { emoji: "😡", label: "Angry", color: "#E07A5F" },
  { emoji: "😴", label: "Tired", color: "#C8B8DB" },
  { emoji: "🤔", label: "Thoughtful", color: "#3498db" },
  { emoji: "😎", label: "Cool", color: "#FFD56F" },
  { emoji: "🥳", label: "Excited", color: "#FFB5E8" },
  { emoji: "😰", label: "Anxious", color: "#D4A5A5" },
  { emoji: "🤗", label: "Grateful", color: "#B8E8D4" },
]

const tagSuggestions = ["Family", "Friends", "Travel", "Work", "Love", "Adventure", "Food", "Nature"]

export default function AddMemoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabaseAuth()
  
  // Mode state
  const [mode, setMode] = useState<'quick' | 'diary'>('quick')
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [savingStep, setSavingStep] = useState("")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showAllMoods, setShowAllMoods] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const recognitionRef = useRef<any>(null)
  
  // Diary mode - content blocks (Notion-like)
  type ContentBlock = {
    id: string
    type: 'text' | 'image' | 'video' | 'audio'
    content: string
    file?: File
    preview?: string
    width?: number // for resizable images
  }
  const [diaryBlocks, setDiaryBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'text', content: '' }
  ])
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [resizingImage, setResizingImage] = useState<{ id: string; startWidth: number; startX: number } | null>(null)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [currentSlashBlockId, setCurrentSlashBlockId] = useState<string | null>(null)
  
  // Handle image resize on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingImage) {
        const deltaX = e.clientX - resizingImage.startX
        const newWidth = resizingImage.startWidth + deltaX
        resizeImage(resizingImage.id, newWidth)
      }
    }

    const handleMouseUp = () => {
      setResizingImage(null)
    }

    if (resizingImage) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizingImage])
  
  // Audio recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Diary mode block functions
  const addBlock = (afterBlockId: string, type: 'text' | 'image' | 'video' | 'audio', file?: File, preview?: string) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      file,
      preview,
      width: type === 'image' ? 600 : undefined
    }
    
    const index = diaryBlocks.findIndex(b => b.id === afterBlockId)
    const newBlocks = [...diaryBlocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setDiaryBlocks(newBlocks)
    
    // Focus on new text block if applicable
    if (type === 'text') {
      setTimeout(() => setFocusedBlockId(newBlock.id), 0)
    }
  }

  const updateBlock = (blockId: string, content: string) => {
    setDiaryBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? { ...block, content } : block
      )
    )
  }

  const deleteBlock = (blockId: string) => {
    if (diaryBlocks.length === 1) return // Keep at least one block
    setDiaryBlocks(blocks => blocks.filter(block => block.id !== blockId))
  }

  const handleDiaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>, afterBlockId?: string) => {
    const files = e.target.files
    if (!files) return
    
    const targetBlockId = afterBlockId || diaryBlocks[diaryBlocks.length - 1].id
    
    Array.from(files).forEach(file => {
      const preview = URL.createObjectURL(file)
      const type = file.type.startsWith('video/') ? 'video' : 'image'
      addBlock(targetBlockId, type, file, preview)
    })
  }

  const resizeImage = (blockId: string, newWidth: number) => {
    setDiaryBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? { ...block, width: Math.max(200, Math.min(newWidth, 800)) } : block
      )
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const block = diaryBlocks.find(b => b.id === blockId)
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showSlashMenu) {
        setShowSlashMenu(false)
        return
      }
      addBlock(blockId, 'text')
    }
    
    if (e.key === 'Backspace') {
      if (block && block.content === '' && diaryBlocks.length > 1) {
        e.preventDefault()
        deleteBlock(blockId)
        const index = diaryBlocks.findIndex(b => b.id === blockId)
        if (index > 0) {
          setFocusedBlockId(diaryBlocks[index - 1].id)
        }
      }
    }
    
    if (e.key === 'Escape' && showSlashMenu) {
      setShowSlashMenu(false)
    }
  }
  
  const handleTextChange = (blockId: string, value: string) => {
    // Check for slash command
    if (value.endsWith('/')) {
      setShowSlashMenu(true)
      setCurrentSlashBlockId(blockId)
      // Get cursor position for menu placement
      const textarea = document.getElementById(`block-${blockId}`) as HTMLTextAreaElement
      if (textarea) {
        const rect = textarea.getBoundingClientRect()
        setSlashMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        })
      }
    } else if (showSlashMenu && !value.includes('/')) {
      setShowSlashMenu(false)
    }
    
    updateBlock(blockId, value)
  }
  
  const handleSlashCommand = (command: 'image' | 'video' | 'audio') => {
    if (!currentSlashBlockId) return
    
    // Remove the / from the text
    const block = diaryBlocks.find(b => b.id === currentSlashBlockId)
    if (block) {
      updateBlock(currentSlashBlockId, block.content.slice(0, -1))
    }
    
    // Trigger file upload based on command
    if (command === 'image') {
      document.getElementById('diary-image-upload')?.click()
    } else if (command === 'video') {
      document.getElementById('diary-video-upload')?.click()
    } else if (command === 'audio') {
      if (isRecordingAudio) {
        stopAudioRecording()
      } else {
        startAudioRecording()
      }
    }
    
    setShowSlashMenu(false)
    setCurrentSlashBlockId(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setUploadedFiles([...uploadedFiles, ...newFiles])
      
      const fileUrls = newFiles.map(file => URL.createObjectURL(file))
      setUploadPreviews([...uploadPreviews, ...fileUrls])
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(uploadPreviews[index])
    setUploadPreviews(uploadPreviews.filter((_, i) => i !== index))
  }

  // Check screen size on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close slash menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSlashMenu) {
        const menu = document.getElementById('slash-menu')
        if (menu && !menu.contains(e.target as Node)) {
          setShowSlashMenu(false)
        }
      }
    }
    
    if (showSlashMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSlashMenu])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setContent((prev) => prev + finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  // Audio recording functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecordingAudio(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop()
      setIsRecordingAudio(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const deleteAudioRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioBlob(null)
    setAudioURL(null)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = async () => {
    if (!user) {
      setError("You must be logged in to save a memory")
      return
    }

    if (!title.trim() && !content.trim()) {
      setError("Please add a title or content for your memory")
      return
    }

    setIsSaving(true)
    setError("")
    setUploadProgress(0)
    setSavingStep("")
    setCompletedSteps([])

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Get session for API calls
      setSavingStep("Verifying session...")
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("No active session")
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
      setCompletedSteps(prev => [...prev, "Session verified ✓"])
      setUploadProgress(10)

      // 1. Create the memory
      setSavingStep("Creating memory in database...")
      
      // Content is already HTML from Tiptap editor
      const finalContent = content.trim() || '<p></p>'
      
      const memoryResponse = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: title.trim() || 'Untitled Entry',
          content: finalContent,
          date,
          location: location.trim() || null,
          mood: selectedMood || null,
          tags: tags
        })
      })

      if (!memoryResponse.ok) {
        const errorData = await memoryResponse.json()
        throw new Error(errorData.error || 'Failed to create memory')
      }

      const { memory } = await memoryResponse.json()
      await new Promise(resolve => setTimeout(resolve, 300))
      setCompletedSteps(prev => [...prev, "Memory created ✓"])
      setUploadProgress(100)

      // Success!
      setSavingStep("Memory saved successfully! ✨")
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard
      router.push('/dashboard')

    } catch (error: any) {
      console.error('Error saving memory:', error)
      setError(error.message || 'Failed to save memory')
      setIsSaving(false)
      setUploadProgress(0)
      setSavingStep("")
      setCompletedSteps([])
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf7f2] via-[#f5f0e8] to-[#ede5d8]">
      {/* Header */}
      <header className="border-b border-[#d4b896]/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileNav />
            </div>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#8b6f47]" />
              <span className="text-2xl handwritten font-bold text-[#8b6f47]">ReLive</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Dashboard
              </Link>
              <Link href="/add-memory" className="text-sm handwritten font-semibold text-[#8b6f47]">
                Add Memory
              </Link>
              <Link href="/timeline" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Timeline
              </Link>
              <Link href="/gallery" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Gallery
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width Diary */}
      <main className="h-[calc(100vh-65px)]">
        <div className="h-full max-w-7xl mx-auto px-6 py-4">
          {/* Diary Container */}
          <div className="h-full flex flex-col bg-white rounded-2xl border-2 border-[#d4b896] shadow-xl overflow-hidden">
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-4 bg-white">
              {/* Working Editor with Toolbar */}
              <div className="working-editor-container">
                <TiptapEditor
                  content={content}
                  onChange={(html) => setContent(html)}
                  placeholder="Start writing your thoughts..."
                />
                
                {/* Overlay content for proper positioning */}
                <div className="absolute top-20 left-4 right-4 z-20 bg-white border border-[#d4b896]/30 rounded-lg p-4 shadow-sm">
                  {/* Header Section */}
                  <div className="mb-3 pb-3 border-b border-[#d4b896]/40">
                    {/* Date and Mood */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <h2 className="text-xl handwritten font-bold text-[#2c3e50] flex items-center gap-2 mb-1">
                          📖 My Diary
                        </h2>
                        <p className="text-sm handwritten text-[#7f8c8d] font-medium">
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <label className="text-sm handwritten font-medium text-[#7f8c8d] mb-1">
                          How are you feeling?
                        </label>
                        <select 
                          value={selectedMood || ''}
                          onChange={(e) => setSelectedMood(e.target.value)}
                          className="handwritten font-medium text-lg bg-white border-2 border-[#d4b896]/50 rounded-lg px-3 py-1 focus:outline-none focus:border-[#3498db] transition-colors"
                        >
                          <option value="">😊</option>
                          {moodEmojis.map((mood) => (
                            <option key={mood.emoji} value={mood.emoji}>
                              {mood.emoji}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Location and Tags */}
                    <div className="flex gap-2 mb-2">
                      <div className="relative w-auto">
                        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7f8c8d]" />
                        <input 
                          type="text"
                          placeholder="Location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="handwritten text-xs border border-[#d4b896] bg-[#fef9f3] rounded-md px-2 py-1 pl-6 focus:border-[#3498db] focus:outline-none transition-all w-48"
                        />
                      </div>
                      <div className="w-auto">
                        <input 
                          type="text"
                          placeholder="Add tags... (press Enter)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTag(tagInput)
                            }
                          }}
                          className="handwritten text-xs border border-[#d4b896] bg-[#fef9f3] rounded-md px-2 py-1 focus:border-[#3498db] focus:outline-none transition-all w-56"
                        />
                      </div>
                    </div>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 bg-[#3498db] text-white text-xs px-2 py-0.5 rounded-full handwritten">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="hover:scale-110 transition-transform">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    placeholder="Give your day a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xl handwritten font-bold text-[#2c3e50] bg-transparent border-none outline-none mb-3 placeholder:text-[#7f8c8d]/50"
                  />
                </div>
              </div>
            </div>

          {/* Footer with Save Button and Character Count */}
          <div className="bg-[#fef9f3] border-t-2 border-[#d4b896] p-4 shrink-0">
            {/* Error Message */}
            {error && (
              <div className="mb-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                <p className="text-sm handwritten text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm handwritten text-[#7f8c8d] hover:text-[#2c3e50] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </Link>
                <div className="text-sm handwritten text-[#7f8c8d]">
                  {content.replace(/<[^>]*>/g, '').length} characters
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !content.trim()}
                className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded-lg handwritten font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Memory
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Simplified Terminal-Style Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-[#faf5ed] z-50 flex items-center justify-center font-mono">
          <div className="max-w-3xl w-full mx-4 space-y-3">
            
            {/* Progress percentage */}
            <div className="text-right mb-12">
              <span className="text-[#3d2f1f] text-6xl font-bold handwritten">
                ( {uploadProgress}% )
              </span>
            </div>

            {/* Completed steps - scrolling text effect */}
            <div className="space-y-3">
              {completedSteps.map((step, index) => (
                <div 
                  key={index}
                  className="text-[#2d3748] text-2xl handwritten animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  // {step}
                </div>
              ))}
            </div>

            {/* Current step - no background, just text */}
            {savingStep && (
              <div className="text-[#3d2f1f] text-3xl handwritten py-4 animate-pulse border-l-4 border-[#3d2f1f] pl-5">
                // {savingStep}
              </div>
            )}

            {/* Waiting message at the bottom right */}
            {uploadProgress < 100 && (
              <div className="text-right mt-16 text-[#3d2f1f] text-base handwritten animate-pulse">
                // HANG TIGHT, EXPLORER. THE DATA TRANSFER IS IN PROGRESS. 
                IT MIGHT TAKE A MOMENT, BUT THE JOURNEY AHEAD IS WORTH THE WAIT...📸
              </div>
            )}

          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      <Dialog open={expandedImageIndex !== null} onOpenChange={() => setExpandedImageIndex(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-6 bg-white">
          {expandedImageIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Expand Icon - Top Left */}
              <button
                onClick={() => setExpandedImageIndex(null)}
                className="absolute top-2 left-2 p-2 bg-[#8b6f47] hover:bg-[#6d5638] text-white rounded-full transition-all shadow-md z-10"
                title="Collapse"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Image */}
              <div className="w-full h-full flex items-center justify-center bg-[#fef9f3] rounded-lg p-4">
                <img
                  src={uploadPreviews[expandedImageIndex]}
                  alt={`Expanded preview ${expandedImageIndex + 1}`}
                  className="max-w-full max-h-[75vh] object-contain"
                />
              </div>

              {/* Navigation Buttons - Bottom Center */}
              {uploadPreviews.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white shadow-lg rounded-full px-4 py-2 border border-[#d4b896]">
                  <button
                    onClick={() => setExpandedImageIndex((expandedImageIndex - 1 + uploadPreviews.length) % uploadPreviews.length)}
                    className="p-2 bg-[#fef9f3] hover:bg-[#d4b896] rounded-full transition-all"
                    title="Previous image"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#8b6f47]" />
                  </button>
                  <span className="text-[#8b6f47] text-sm handwritten font-semibold min-w-12 text-center">
                    {expandedImageIndex + 1} / {uploadPreviews.length}
                  </span>
                  <button
                    onClick={() => setExpandedImageIndex((expandedImageIndex + 1) % uploadPreviews.length)}
                    className="p-2 bg-[#fef9f3] hover:bg-[#d4b896] rounded-full transition-all rotate-180"
                    title="Next image"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#8b6f47]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSS for properly organized layout */}
      <style jsx global>{`
        .working-editor-container {
          position: relative;
          height: 100%;
        }
        
        /* Position toolbar at the very top */
        .working-editor-container .tiptap-editor > div:first-child {
          position: sticky;
          top: 0;
          z-index: 50;
          background: white;
          border-bottom: 2px solid #d4b896;
          padding: 12px 20px;
          margin: -16px -20px 0 -20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        /* Position editor content properly */
        .working-editor-container .tiptap-content {
          padding: 240px 0 16px 0;
        }
        
        .working-editor-container .ProseMirror {
          min-height: 400px;
          outline: none;
          font-family: 'handwritten', cursive;
        }
      `}</style>

    </div>
  )
}
