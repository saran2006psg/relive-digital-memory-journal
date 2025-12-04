"use client"

import { useState, useEffect } from "react"
import { BookOpen, X, Calendar, MapPin, Maximize2, Tag, Mic, ChevronLeft, ChevronRight, Trash2, Edit2, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { UserMenu } from "@/components/UserMenu"
import { MobileNav } from "@/components/MobileNav"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { createBrowserClient } from "@supabase/ssr"
import { getThumbnailUrl, getOptimizedImageUrl, isCloudinaryUrl } from "@/lib/cloudinary"

interface Memory {
  id: string
  title: string
  content: string
  date: string
  location: string | null
  mood: string | null
  created_at: string
  media: Array<{
    id: string
    url: string
    type: string
    media_type?: string
  }>
  tags: string[]
}

const moodColors: Record<string, string> = {
  "😊": "#B5D99C",
  "😌": "#8dd3c7",
  "😍": "#ff9a8b",
  "😔": "#A8B5E8",
  "😢": "#9BB5E8",
  "😡": "#E07A5F",
  "😴": "#C8B8DB",
  "🤔": "#3498db",
  "😎": "#FFD56F",
  "🥳": "#FFB5E8",
  "😰": "#D4A5A5",
  "🤗": "#B8E8D4",
}

export default function GalleryPage() {
  const { user, loading: authLoading } = useSupabaseAuth()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedItem, setSelectedItem] = useState<Memory | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    date: "",
    location: "",
    mood: ""
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const memoriesPerPage = 9

  // Helper function to check if media is audio (case-insensitive)
  const isAudioMedia = (media: { media_type?: string; type?: string }) => {
    const mediaType = media.media_type || media.type || ''
    return mediaType.toLowerCase() === 'audio'
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      fetchMemories()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchMemories = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError("Please log in to view your memories")
        setLoading(false)
        return
      }

      const response = await fetch('/api/memories', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch memories')
      }

      const data = await response.json()
      
      // Normalize media data - prioritize 'media_type' over 'type' and ensure lowercase
      const normalizedMemories = (data.memories || []).map((memory: Memory) => ({
        ...memory,
        media: memory.media?.map(m => ({
          ...m,
          media_type: (m.media_type || m.type || '').toLowerCase() // Prioritize media_type, then type, normalize to lowercase
        }))
      }))
      
      setMemories(normalizedMemories)
      setLoading(false)
    } catch (error: any) {
      console.error('Error fetching memories:', error)
      setError(error.message || 'Failed to load memories')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return

    setIsDeleting(true)
    setError("")
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError("Please log in to delete memories")
        setIsDeleting(false)
        return
      }

      console.log('Deleting memory:', selectedItem.id)

      const response = await fetch(`/api/memories/${selectedItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Delete failed:', result)
        throw new Error(result.error || 'Failed to delete memory')
      }

      console.log('Delete successful:', result)

      // Remove from local state
      setMemories(prev => prev.filter(m => m.id !== selectedItem.id))
      
      // Close modal and reset states
      setSelectedItem(null)
      setShowDeleteConfirm(false)
      setIsDeleting(false)

      // Adjust current page if needed
      const remainingMemories = memories.length - 1
      const totalPages = Math.ceil(remainingMemories / memoriesPerPage)
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages)
      }

    } catch (error: any) {
      console.error('Error deleting memory:', error)
      setError(error.message || 'Failed to delete memory')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleEdit = () => {
    if (!selectedItem) return
    
    setEditForm({
      title: selectedItem.title,
      content: selectedItem.content,
      date: selectedItem.date,
      location: selectedItem.location || "",
      mood: selectedItem.mood || ""
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      title: "",
      content: "",
      date: "",
      location: "",
      mood: ""
    })
  }

  const handleSaveEdit = async () => {
    if (!selectedItem) return

    setIsSaving(true)
    setError("")
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError("Please log in to edit memories")
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/memories/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update memory')
      }

      // Update local state
      setMemories(prev => prev.map(m => 
        m.id === selectedItem.id 
          ? { ...m, ...editForm }
          : m
      ))
      
      // Update selected item
      setSelectedItem(prev => prev ? { ...prev, ...editForm } : null)
      
      // Close edit mode
      setIsEditing(false)
      setIsSaving(false)

    } catch (error: any) {
      console.error('Error updating memory:', error)
      setError(error.message || 'Failed to update memory')
      setIsSaving(false)
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
              <Link href="/add-memory" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Add Memory
              </Link>
              <Link href="/timeline" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Timeline
              </Link>
              <Link href="/gallery" className="text-sm handwritten font-semibold text-[#8b6f47]">
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl handwritten font-bold text-[#8b6f47] mb-2">Memory Gallery</h1>
          {loading ? (
            <p className="text-base sm:text-lg handwritten text-[#7f8c8d]">Loading your memories...</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-base sm:text-lg handwritten text-[#7f8c8d]">
                Showing {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
              </p>
              {memories.length > memoriesPerPage && (
                <p className="text-sm handwritten text-[#8b6f47]">
                  Page {currentPage} of {Math.ceil(memories.length / memoriesPerPage)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
            <p className="text-sm handwritten text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 pb-16 shadow-2xl animate-pulse">
                <div className="bg-gray-200 h-72 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && memories.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-24 h-24 text-[#d4b896] mx-auto mb-4" />
            <h2 className="text-3xl handwritten font-bold text-[#8b6f47] mb-2">No Memories Yet</h2>
            <p className="text-lg handwritten text-[#7f8c8d] mb-6">
              Start capturing your precious moments today!
            </p>
            <Link href="/add-memory">
              <Button size="lg" className="handwritten text-lg">
                Create Your First Memory
              </Button>
            </Link>
          </div>
        )}

        {/* Polaroid Gallery Grid */}
        {!loading && !error && memories.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {memories
                .slice((currentPage - 1) * memoriesPerPage, currentPage * memoriesPerPage)
                .map((item, index) => {
                const firstMedia = item.media && item.media.length > 0 ? item.media[0] : null
                const hasAudio = item.media && item.media.some(m => isAudioMedia(m))
                const moodColor = item.mood ? moodColors[item.mood] : '#B5D99C'
                const formattedDate = new Date(item.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })

                return (
                  <div
                    key={item.id}
                    className={`transition-all duration-500 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ 
                      transitionDelay: `${index * 50}ms`,
                      transform: `rotate(${(index % 3 - 1) * 2}deg)`
                    }}
                  >
                    {/* Polaroid Card */}
                    <div
                      className="bg-[#f5f0e8] p-4 pb-20 shadow-2xl cursor-pointer group hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:rotate-0 relative"
                      onClick={() => setSelectedItem(item)}
                    >
                      {/* Photo Container */}
                      <div className="relative overflow-hidden bg-gray-100">
                        {firstMedia ? (
                          <img
                            src={
                              isCloudinaryUrl(firstMedia.url)
                                ? getThumbnailUrl(firstMedia.url, 400)
                                : firstMedia.url
                            }
                            alt={item.title}
                            className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-72 flex items-center justify-center bg-[#fef9f3]">
                            <BookOpen className="w-16 h-16 text-[#d4b896]" />
                          </div>
                        )}
                        
                        {/* Audio Icon - Minimal at bottom of image */}
                        {hasAudio && (
                          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md group-hover:scale-110 transition-transform duration-300">
                            <Mic className="w-4 h-4 text-[#3498db]" />
                          </div>
                        )}
                      
                        {/* Corner Mood Badge */}
                        {item.mood && (
                          <div 
                            className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl border-4 border-white group-hover:scale-125 transition-transform duration-300 rotate-12"
                            style={{ backgroundColor: moodColor }}
                          >
                            {item.mood}
                          </div>
                        )}

                        {/* Expand Icon - appears on hover */}
                        <button
                          className="absolute top-3 left-3 z-10 w-10 h-10 bg-white/95 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedItem(item)
                          }}
                        >
                          <Maximize2 className="w-5 h-5 text-[#8b6f47]" />
                        </button>

                        {/* Media count badge */}
                        {item.media && item.media.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs handwritten">
                            +{item.media.length - 1} more
                          </div>
                        )}
                      </div>

                      {/* Polaroid Caption Area */}
                      <div className="mt-4 space-y-2">
                        <h3 className="text-2xl handwritten font-bold text-[#2c3e50] text-center">
                          {item.title}
                        </h3>
                        <p className="text-sm handwritten text-[#7f8c8d] text-center">
                          {formattedDate}
                        </p>
                        
                        {/* Location */}
                        {item.location && (
                          <div className="flex items-center justify-center gap-1 text-xs handwritten text-[#7f8c8d]">
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </div>
                        )}

                        {/* Content Preview */}
                        <div className="mt-3 px-2">
                          <div className="bg-white/60 rounded-lg p-3 border border-[#d4b896]/30">
                            <p className="text-sm handwritten text-[#34495e] leading-relaxed line-clamp-3 text-center" style={{ fontFamily: 'Dancing Script, cursive' }}>
                              {item.content.replace(/<[^>]*>/g, '').substring(0, 120)}{item.content.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Tags with colored borders */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-center pt-2">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={`${tag}-${idx}`}
                                className="px-3 py-1 text-xs handwritten font-semibold border-2 border-dashed"
                                style={{ 
                                  borderColor: moodColor,
                                  color: moodColor
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tape Effect at Top */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white opacity-80 shadow-md rotate-2 border border-gray-200" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {memories.length > memoriesPerPage && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#d4b896] text-[#8b6f47] rounded-lg handwritten font-medium hover:bg-[#8b6f47] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(memories.length / memoriesPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg handwritten font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-[#8b6f47] text-white shadow-lg scale-110'
                          : 'bg-white border border-[#d4b896] text-[#8b6f47] hover:border-[#8b6f47]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(memories.length / memoriesPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(memories.length / memoriesPerPage)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#d4b896] text-[#8b6f47] rounded-lg handwritten font-medium hover:bg-[#8b6f47] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full-Page Modal Overlay - Add Memory Style */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Notebook Background */}
          <div className="fixed inset-0 bg-white" style={{
            backgroundImage: `
              linear-gradient(
                90deg,
                #ffffff 80px,
                #ffffff 82px,
                transparent 82px
              ),
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 34px,
                rgba(99, 179, 237, 0.25) 34px,
                rgba(99, 179, 237, 0.25) 35px
              )
            `,
            backgroundSize: '100% 100%, 100% 35px',
            backgroundRepeat: 'no-repeat, repeat',
            backgroundAttachment: 'scroll'
          }} />
          
          {/* Content Overlay */}
          <div className="relative z-10 h-full overflow-y-auto">
            {/* Header Bar */}
            <header className="border-b border-[#d4b896]/60 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#8b6f47]" />
                    <span className="text-2xl handwritten font-bold text-[#8b6f47]">ReLive</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit memory"
                      >
                        <Edit2 className="w-5 h-5 text-[#3498db]" />
                      </button>
                    )}
                    {/* Delete Button */}
                    {!isEditing && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    )}
                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setSelectedItem(null)
                        setIsEditing(false)
                      }}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-[#8b6f47]" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-65px)] py-4 px-4 md:px-6">
              <div className="max-w-5xl mx-auto">
                {/* Diary Container */}
                <div className="bg-white rounded-2xl border-2 border-[#d4b896] shadow-xl overflow-hidden">
                  
                  {/* Compact Header Section */}
                  <div className="bg-linear-to-b from-[#fef9f3] to-white border-b-2 border-[#d4b896]/40 shadow-sm px-6 py-3">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Title & Meta Info */}
                      <div className="flex-1 space-y-2">
                        {/* Title with Icon */}
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📖</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="flex-1 text-xl handwritten font-bold text-[#2c3e50] bg-transparent border-b-2 border-[#3498db] outline-none"
                              placeholder="Memory title..."
                            />
                          ) : (
                            <h1 className="text-xl handwritten font-bold text-[#2c3e50]">
                              {selectedItem.title}
                            </h1>
                          )}
                        </div>
                        
                        {/* Date & Meta Row */}
                        <div className="flex items-center gap-3 text-xs handwritten text-[#7f8c8d]">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                              className="text-xs handwritten bg-transparent border-b border-[#d4b896] focus:border-[#3498db] outline-none"
                            />
                          ) : (
                            <span className="font-medium">
                              {new Date(selectedItem.date).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          {(selectedItem.location || isEditing) && (
                            <>
                              <span className="text-[#d4b896]">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#7f8c8d]" />
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                    className="text-xs handwritten bg-transparent border-b border-[#d4b896] focus:border-[#3498db] outline-none w-32"
                                    placeholder="Add location"
                                  />
                                ) : (
                                  <span>{selectedItem.location}</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Tags Display */}
                        {selectedItem.tags && selectedItem.tags.length > 0 && !isEditing && (
                          <div className="flex flex-wrap gap-1">
                            {selectedItem.tags.map((tag, idx) => (
                              <span 
                                key={`${tag}-${idx}`}
                                className="inline-flex items-center gap-1 bg-[#3498db]/10 text-[#3498db] text-xs px-2 py-0.5 rounded-full handwritten border border-[#3498db]/20"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Mood */}
                      {(selectedItem.mood || isEditing) && (
                        <div className="flex flex-col items-end gap-1">
                          <label className="text-xs handwritten font-medium text-[#7f8c8d]">
                            Mood
                          </label>
                          {isEditing ? (
                            <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                              {Object.keys(moodColors).slice(0, 6).map((mood) => (
                                <button
                                  key={mood}
                                  type="button"
                                  onClick={() => setEditForm(prev => ({ ...prev, mood }))}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                                    editForm.mood === mood 
                                      ? 'ring-2 ring-[#8b6f47] scale-110' 
                                      : 'hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: moodColors[mood] }}
                                >
                                  {mood}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div 
                              className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg border border-[#d4b896]/30"
                              style={{ backgroundColor: (moodColors[selectedItem.mood!] || '#B5D99C') + '20' }}
                            >
                              {selectedItem.mood}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="px-6 py-6 bg-white min-h-[400px]">
                    {/* Audio Section */}
                    {selectedItem.media && selectedItem.media.filter(m => isAudioMedia(m)).length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Mic className="w-4 h-4 text-[#8b6f47]" />
                          <span className="text-sm handwritten font-semibold text-[#8b6f47]">Audio Recordings</span>
                        </div>
                        <div className="space-y-3">
                          {selectedItem.media.filter(m => isAudioMedia(m)).map((audio) => (
                            <audio 
                              key={audio.id}
                              src={audio.url} 
                              controls 
                              preload="metadata"
                              className="w-full max-w-md" 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Story Content */}
                    {isEditing ? (
                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={15}
                        className="w-full px-4 py-3 border-2 border-[#d4b896] rounded-lg handwritten text-lg focus:border-[#8b6f47] focus:outline-none transition-colors resize-none"
                        placeholder="Tell your story..."
                      />
                    ) : (
                      <div 
                        className="tiptap-content prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                      />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-[#fef9f3]/80 backdrop-blur-sm border-t border-[#d4b896]/40 px-6 py-3">
                    <div className="flex items-center justify-between">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="text-sm handwritten text-[#7f8c8d] hover:text-[#2c3e50] transition-colors flex items-center gap-1.5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={isSaving || !editForm.title || !editForm.content}
                            className="px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg handwritten font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isSaving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedItem(null)}
                            className="text-sm handwritten text-[#7f8c8d] hover:text-[#2c3e50] transition-colors flex items-center gap-1.5"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Gallery
                          </button>
                          <div className="text-xs handwritten text-[#7f8c8d]">
                            Created {new Date(selectedItem.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-4 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl handwritten font-bold text-[#2c3e50]">
                Delete Memory?
              </h3>
            </div>
            
            <p className="text-base handwritten text-[#7f8c8d] mb-6">
              Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone and all associated media will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg handwritten font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg handwritten font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-4 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl handwritten font-bold text-[#2c3e50]">
                Delete Memory?
              </h3>
            </div>

            <p className="text-base handwritten text-[#7f8c8d] mb-6">
              Are you sure you want to delete this memory? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg handwritten font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 bg-red-500 text-white rounded-lg handwritten font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
