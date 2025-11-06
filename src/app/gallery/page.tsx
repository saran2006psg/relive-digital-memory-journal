"use client"

import { useState, useEffect } from "react"
import { BookOpen, X, Calendar, MapPin, Maximize2, Tag, Mic, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { UserMenu } from "@/components/UserMenu"
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const memoriesPerPage = 9

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
      
      // Normalize media data - convert 'type' to 'media_type' for consistency
      const normalizedMemories = (data.memories || []).map((memory: Memory) => ({
        ...memory,
        media: memory.media?.map(m => ({
          ...m,
          media_type: m.type || m.media_type // Use 'type' from DB, fallback to media_type if already set
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#d4b896]/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#8b6f47]" />
              <span className="text-2xl handwritten font-bold text-[#8b6f47]">ReLive</span>
            </Link>
            <nav className="flex items-center gap-6">
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
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-5xl handwritten font-bold text-[#8b6f47] mb-2">Memory Gallery</h1>
          {loading ? (
            <p className="text-lg handwritten text-[#7f8c8d]">Loading your memories...</p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-lg handwritten text-[#7f8c8d]">
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
                const hasAudio = item.media && item.media.some(m => m.media_type === 'audio')
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
                      className="bg-white p-4 pb-16 shadow-2xl cursor-pointer group hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:rotate-0 relative"
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
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#fef9f3] opacity-50 shadow-sm rotate-2" />
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

      {/* Full-Page Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-[#faf5ed] overflow-y-auto">
          <div className="relative w-full min-h-screen">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="fixed top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-red-50 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-red-300"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>

            {/* Content Container */}
            <div className="w-full min-h-screen px-8 py-10">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Top Section - Image Left, Title & Tags Right */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left - Media */}
                  <div className="flex flex-col gap-4">
                    {/* Main Image/Video Section */}
                    {selectedItem.media && selectedItem.media.filter(m => m.media_type !== 'audio').length > 0 ? (
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-4 border-white" style={{ height: '450px' }}>
                        {/* Images/Videos Container */}
                        <div className="w-full h-full">
                          {selectedItem.media.filter(m => m.media_type !== 'audio').length === 1 ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                              {selectedItem.media.find(m => m.media_type !== 'audio')!.media_type === 'video' ? (
                                <video
                                  src={selectedItem.media.find(m => m.media_type !== 'audio')!.url}
                                  controls
                                  className="w-full h-full object-contain rounded-lg"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={
                                    isCloudinaryUrl(selectedItem.media.find(m => m.media_type !== 'audio')!.url)
                                      ? getOptimizedImageUrl(selectedItem.media.find(m => m.media_type !== 'audio')!.url, {
                                          width: 1200,
                                          quality: 'auto:good',
                                          format: 'auto',
                                          crop: 'limit'
                                        })
                                      : selectedItem.media.find(m => m.media_type !== 'audio')!.url
                                  }
                                  alt={selectedItem.title}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 p-3 h-full">
                              {selectedItem.media.filter(m => m.media_type !== 'audio').map((media, idx) => (
                                <div key={media.id} className="relative overflow-hidden rounded-lg bg-gray-50">
                                  {media.media_type === 'video' ? (
                                    <video
                                      src={media.url}
                                      controls
                                      className="w-full h-full object-cover"
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : (
                                    <img
                                      src={
                                        isCloudinaryUrl(media.url)
                                          ? getOptimizedImageUrl(media.url, {
                                              width: 600,
                                              height: 400,
                                              quality: 'auto:good',
                                              format: 'auto',
                                              crop: 'fill',
                                              gravity: 'auto'
                                            })
                                          : media.url
                                      }
                                      alt={`${selectedItem.title} - ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (!selectedItem.media || selectedItem.media.length === 0) ? (
                      <div className="bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center h-[450px]">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 text-[#d4b896] mx-auto mb-3" />
                          <p className="text-base handwritten text-[#7f8c8d]">No media attached</p>
                        </div>
                      </div>
                    ) : null}
                    
                    {/* Audio Section - Separate, compact design */}
                    {selectedItem.media && selectedItem.media.filter(m => m.media_type === 'audio').length > 0 && (
                      <div className="bg-white rounded-xl shadow-md border border-[#d4b896]/20 overflow-hidden">
                        {selectedItem.media.filter(m => m.media_type === 'audio').map((audio) => (
                          <div key={audio.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#3498db]/5 to-transparent">
                            <div className="w-10 h-10 bg-[#3498db] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                              <Mic className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs handwritten text-[#7f8c8d] mb-1">Audio Memory</p>
                              <audio 
                                src={audio.url} 
                                controls 
                                preload="metadata"
                                className="w-full" 
                                style={{ height: '32px', maxHeight: '32px' }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right - Title, Date, Location & Tags */}
                  <div className="bg-white rounded-xl shadow-lg p-8 border border-[#d4b896]/30 flex flex-col gap-6">
                    {/* Title & Mood */}
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h2 className="text-4xl handwritten font-bold text-[#2c3e50] leading-tight">
                          {selectedItem.title}
                        </h2>
                      </div>
                      {selectedItem.mood && (
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-white shrink-0"
                          style={{ 
                            backgroundColor: selectedItem.mood 
                              ? moodColors[selectedItem.mood] || '#B5D99C' 
                              : '#B5D99C' 
                          }}
                        >
                          {selectedItem.mood}
                        </div>
                      )}
                    </div>

                    {/* Date & Location */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                        <Calendar className="w-5 h-5 text-[#8b6f47]" />
                        <span className="text-base handwritten font-medium text-[#2c3e50]">
                          {new Date(selectedItem.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                      {selectedItem.location && (
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                          <MapPin className="w-5 h-5 text-[#8b6f47]" />
                          <span className="text-base handwritten font-medium text-[#2c3e50]">
                            {selectedItem.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {selectedItem.tags && selectedItem.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#d4b896]/30">
                          <Tag className="w-5 h-5 text-[#8b6f47]" />
                          <h3 className="text-xl handwritten font-bold text-[#8b6f47]">
                            Memory Tags
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.tags.map((tag, idx) => (
                            <span
                              key={`${tag}-${idx}`}
                              className="px-4 py-2 rounded-full text-sm handwritten font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                              style={{
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: selectedItem.mood 
                                  ? moodColors[selectedItem.mood] || '#d4a574'
                                  : '#d4a574',
                                color: selectedItem.mood 
                                  ? moodColors[selectedItem.mood] || '#8b6f47'
                                  : '#8b6f47',
                                backgroundColor: selectedItem.mood 
                                  ? (moodColors[selectedItem.mood] || '#d4a574') + '15'
                                  : '#d4a574' + '15'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section - Story (Full Width) */}
                <div className="bg-white rounded-xl shadow-lg p-10 border border-[#d4b896]/30">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#d4b896]/30">
                    <BookOpen className="w-6 h-6 text-[#8b6f47]" />
                    <h3 className="text-2xl handwritten font-bold text-[#8b6f47]">
                      Your Story
                    </h3>
                  </div>
                  <div className="max-w-4xl">
                    <p className="text-lg handwritten text-[#34495e] leading-relaxed whitespace-pre-wrap">
                      {selectedItem.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
