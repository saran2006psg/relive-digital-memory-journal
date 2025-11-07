"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, MapPin, Image as ImageIcon, Video, X, Save, BookOpen, ArrowLeft, Maximize2, Mic, MicOff, ChevronDown } from "lucide-react"
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

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
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
      const memoryResponse = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
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
      setUploadProgress(30)

      // 2. Upload files if any (photos/videos)
      let totalUploads = uploadedFiles.length
      if (audioBlob) totalUploads += 1

      let uploadedCount = 0

      if (uploadedFiles.length > 0) {
        setSavingStep(`Uploading media files (0/${uploadedFiles.length})...`)
        
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i]
          const formData = new FormData()
          formData.append('file', file)
          formData.append('memoryId', memory.id)

          setSavingStep(`Uploading media files (${i + 1}/${uploadedFiles.length})...`)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
          })

          if (!uploadResponse.ok) {
            console.error(`Failed to upload file ${i + 1}`)
          }

          uploadedCount++
          setUploadProgress(30 + (uploadedCount / totalUploads) * 50)
        }
        
        setCompletedSteps(prev => [...prev, `${uploadedFiles.length} media file(s) uploaded ✓`])
      }

      // 3. Upload audio if any
      if (audioBlob) {
        setSavingStep("Uploading audio recording...")
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('file', audioFile)
        formData.append('memoryId', memory.id)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData
        })

        if (!uploadResponse.ok) {
          console.error('Failed to upload audio')
        }

        uploadedCount++
        setUploadProgress(30 + (uploadedCount / totalUploads) * 50)
        setCompletedSteps(prev => [...prev, "Audio recording uploaded ✓"])
      }

      // Final step
      setSavingStep("Finalizing...")
      await new Promise(resolve => setTimeout(resolve, 300))
      setUploadProgress(100)
      setCompletedSteps(prev => [...prev, "Memory saved successfully! ✓"])

      // Success! Clean up and redirect
      uploadPreviews.forEach(url => URL.revokeObjectURL(url))
      
      setTimeout(() => {
        router.push('/gallery')
      }, 1500)

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#d4b896]/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
        {/* Back Button & Title */}
        <div className="mb-4">
          <div className="bg-gradient-to-br from-white to-[#fef9f3] shadow-sm rounded-lg border border-[#d4b896]/30 p-3 sm:p-4">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 handwritten text-sm text-[#7f8c8d] hover:text-[#2c3e50] transition-colors mb-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl handwritten font-bold text-[#2c3e50] mb-0.5">
              Capture a Moment
            </h1>
            <p className="text-sm handwritten text-[#7f8c8d]">
              Write down your thoughts and preserve this memory forever
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* Left Column - Mood, Tags, Media (Smaller - 2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            {/* Mood Selector */}
            <div className="bg-white shadow-sm rounded-xl border border-[#ff9a8b]/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg handwritten font-bold text-[#2c3e50]">How are you feeling?</h3>
                {/* Toggle button - visible on all screen sizes */}
                <button
                  onClick={() => setShowAllMoods(!showAllMoods)}
                  className="text-xs handwritten font-medium text-[#3498db] hover:text-[#2980b9] transition-colors flex items-center gap-1"
                >
                  {showAllMoods ? 'Show Less' : 'Show More'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllMoods ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className={`grid gap-2 transition-all duration-300 ${
                showAllMoods 
                  ? 'grid-cols-4 sm:grid-cols-6' 
                  : 'grid-cols-4 sm:grid-cols-6'
              }`}>
                {moodEmojis
                  .slice(0, showAllMoods ? moodEmojis.length : (isMobile ? 4 : 6))
                  .map((mood) => (
                    <button
                      key={mood.label}
                      onClick={() => setSelectedMood(mood.emoji)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-2xl sm:text-3xl transition-all duration-200 hover:scale-105 ${
                        selectedMood === mood.emoji
                          ? 'ring-2 ring-[#3498db] shadow-md scale-105'
                          : 'hover:bg-[#fef9f3] border border-transparent hover:border-[#d4b896]/50'
                      }`}
                      style={{
                        backgroundColor: selectedMood === mood.emoji ? mood.color + '40' : 'transparent'
                      }}
                      title={mood.label}
                    >
                      {mood.emoji}
                    </button>
                  ))}
              </div>
              {selectedMood && (
                <p className="text-sm handwritten text-center mt-2 text-[#7f8c8d]">
                  Feeling {moodEmojis.find(m => m.emoji === selectedMood)?.label} ✨
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white shadow-sm rounded-xl border border-[#8dd3c7]/30 p-4">
              <h3 className="text-base sm:text-lg handwritten font-bold mb-3 text-[#2c3e50]">Tags</h3>
              
              {/* Tag Input */}
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag(tagInput)
                    }
                  }}
                  className="handwritten text-sm bg-[#fef9f3] border-[#d4b896] rounded-lg py-2 px-3"
                />
                <Button
                  onClick={() => handleAddTag(tagInput)}
                  size="sm"
                  className="handwritten text-sm bg-[#8dd3c7] hover:bg-[#7bc4ba] text-white px-4 rounded-lg whitespace-nowrap"
                >
                  Add
                </Button>
              </div>

              {/* Tag Suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-2.5 py-1 text-xs handwritten font-medium rounded-full border border-dashed border-[#d4b896] hover:bg-[#fef9f3] hover:border-[#3498db] transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, index) => {
                    const colors = ['#B5D99C', '#8dd3c7', '#ff9a8b', '#3498db', '#C8B8DB', '#FFD56F']
                    return (
                      <div
                        key={tag}
                        className="px-2 py-1 shadow-sm rounded-md text-xs flex items-center gap-1"
                        style={{ 
                          backgroundColor: colors[index % colors.length]
                        }}
                      >
                        <span className="handwritten font-bold text-white">
                          #{tag}
                        </span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:scale-110 transition-transform"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Media Upload */}
            <div className="bg-white shadow-sm rounded-xl border border-[#b5d99c]/30 p-4">
              <h3 className="text-base sm:text-lg handwritten font-bold mb-3 text-[#2c3e50]">Photos & Videos</h3>
              
              {/* Upload Button - Only show if no files uploaded */}
              {uploadPreviews.length === 0 ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#d4b896] rounded-xl p-6 cursor-pointer hover:border-[#3498db] hover:bg-[#fef9f3] transition-all duration-200">
                  <div className="flex gap-2 mb-2">
                    <ImageIcon className="w-6 h-6 text-[#7f8c8d]" />
                    <Video className="w-6 h-6 text-[#7f8c8d]" />
                  </div>
                  <p className="text-sm handwritten text-[#7f8c8d] text-center font-medium">
                    Click to upload photos or videos
                  </p>
                  <p className="text-xs handwritten text-[#7f8c8d]/70 text-center mt-1">
                    Max 10MB per file
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml,image/heic,image/heif,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/x-ms-wmv,video/x-flv,video/x-m4v"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <>
                  {/* Uploaded Files Preview with Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {uploadPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <div className="relative rounded-lg overflow-hidden shadow-sm group border border-[#d4b896]/30 bg-[#fef9f3]">
                          <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                            <img
                              src={preview}
                              alt={`Upload ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-contain p-1"
                            />
                          </div>
                          {/* Expand Button */}
                          <button
                            onClick={() => setExpandedImageIndex(index)}
                            className="absolute bottom-1.5 left-1.5 p-1 bg-[#3498db] text-white rounded-full opacity-90 hover:opacity-100 transition-all hover:scale-110 shadow-md z-10"
                            title="Expand image"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-[#e74c3c] text-white rounded-full opacity-90 hover:opacity-100 transition-all hover:scale-110 shadow-md z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add More Button */}
                  <label className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-[#d4b896] rounded-lg cursor-pointer hover:border-[#3498db] hover:bg-[#fef9f3] transition-all">
                    <ImageIcon className="w-4 h-4 text-[#7f8c8d]" />
                    <span className="text-xs handwritten text-[#7f8c8d] font-medium">Add more</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml,image/heic,image/heif,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/x-ms-wmv,video/x-flv,video/x-m4v"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>

            {/* Audio Recording */}
            <div className="bg-white shadow-sm rounded-xl border border-[#b5d99c]/30 p-4">
              <h3 className="text-base sm:text-lg handwritten font-bold mb-3 text-[#2c3e50]">Audio Recording</h3>
              
              {!audioURL ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                    className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                      isRecordingAudio 
                        ? 'border-red-500 bg-red-50 animate-pulse' 
                        : 'border-[#d4b896] hover:border-[#3498db] hover:bg-[#fef9f3] cursor-pointer'
                    }`}
                  >
                    {isRecordingAudio ? (
                      <>
                        <div className="relative">
                          <Mic className="w-8 h-8 text-red-500 animate-pulse" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        </div>
                        <p className="text-sm handwritten text-red-600 font-bold mt-2">
                          Recording... {formatTime(recordingTime)}
                        </p>
                        <p className="text-xs handwritten text-red-500/70 mt-1">
                          Click to stop
                        </p>
                      </>
                    ) : (
                      <>
                        <Mic className="w-8 h-8 text-[#7f8c8d] mb-2" />
                        <p className="text-sm handwritten text-[#7f8c8d] text-center font-medium">
                          Click to record audio
                        </p>
                        <p className="text-xs handwritten text-[#7f8c8d]/70 text-center mt-1">
                          Share your voice with your memory
                        </p>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-[#fef9f3] border border-[#d4b896]/30 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-[#3498db]/10 rounded-full flex items-center justify-center">
                        <Mic className="w-5 h-5 text-[#3498db]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm handwritten font-semibold text-[#2c3e50]">Audio Recording</p>
                        <p className="text-xs handwritten text-[#7f8c8d]">{formatTime(recordingTime)}</p>
                      </div>
                      <button
                        onClick={deleteAudioRecording}
                        className="shrink-0 p-1.5 bg-[#e74c3c] text-white rounded-full hover:bg-[#c0392b] transition-all hover:scale-110 shadow-sm"
                        title="Delete recording"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <audio src={audioURL} controls className="w-full mt-3 h-8" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Text Editor (Larger - 3 cols on desktop) */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-md rounded-2xl border border-[#3498db]/30 p-4 sm:p-6">
              <div className="space-y-4">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base sm:text-lg handwritten font-semibold text-[#2c3e50]">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Give your memory a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg sm:text-xl handwritten font-bold bg-[#fef9f3] border-2 border-[#d4b896] rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 text-[#2c3e50]"
                  />
                </div>

                {/* Date and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm sm:text-base handwritten font-semibold flex items-center gap-2 text-[#2c3e50]">
                      <Calendar className="w-4 h-4" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="handwritten text-sm bg-[#fef9f3] border-2 border-[#d4b896] rounded-xl px-3 py-2 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm sm:text-base handwritten font-semibold flex items-center gap-2 text-[#2c3e50]">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="Where were you?"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="handwritten text-sm bg-[#fef9f3] border-2 border-[#d4b896] rounded-xl px-3 py-2 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20"
                    />
                  </div>
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label htmlFor="content" className="text-base sm:text-lg handwritten font-semibold text-[#2c3e50]">
                      Your Story
                    </Label>
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all w-full sm:w-auto ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : 'bg-[#3498db] hover:bg-[#2980b9] text-white'
                      }`}
                      title={isRecording ? 'Stop recording' : 'Start voice recording'}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span className="text-xs sm:text-sm handwritten">Recording...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span className="text-xs sm:text-sm handwritten">Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Textarea
                      id="content"
                      placeholder="Pour your heart out... What happened? How did you feel? (Or click the mic button to speak)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[250px] sm:min-h-[350px] resize-none bg-[#fef9f3] border-2 border-[#d4b896] text-base handwritten leading-relaxed text-[#2c3e50] rounded-xl px-3 py-3 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20"
                    />
                    {isRecording && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs handwritten">Listening...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm handwritten text-[#7f8c8d]">
                    {content.length} characters
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-xl shadow-sm">
                <p className="text-xs sm:text-sm handwritten text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || !title || !content || authLoading}
              className="w-full h-12 sm:h-14 text-base sm:text-lg handwritten font-bold relative overflow-hidden rounded-xl bg-linear-to-r from-[#8b6f47] to-[#d4a574] hover:from-[#6d5638] hover:to-[#b8895d] shadow-lg hover:shadow-xl transition-all mt-4 sm:mt-6"
              size="lg"
            >
              {isSaving ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Memory...
                  </div>
                  {uploadProgress > 0 && (
                    <div className="text-xs opacity-90">
                      {uploadProgress < 30 ? 'Creating memory...' : 
                       uploadProgress < 90 ? 'Uploading files...' : 
                       'Almost done!'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-6 h-6" />
                  Save Memory
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

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
                  <span className="text-[#8b6f47] text-sm handwritten font-semibold min-w-[3rem] text-center">
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
    </div>
  )
}