"use client"

import { useState, useEffect } from "react"
import { BookOpen, X, Calendar, MapPin, Maximize2, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { UserMenu } from "@/components/UserMenu"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { createBrowserClient } from "@supabase/ssr"

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
      setMemories(data.memories || [])
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
            <p className="text-lg handwritten text-[#7f8c8d]">
              Showing {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories.map((item, index) => {
              const firstMedia = item.media && item.media.length > 0 ? item.media[0] : null
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
                          src={firstMedia.url}
                          alt={item.title}
                          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-72 flex items-center justify-center bg-[#fef9f3]">
                          <BookOpen className="w-16 h-16 text-[#d4b896]" />
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
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs handwritten">
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
        )}
      </div>

      {/* Detailed View Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#faf5ed]">
          {selectedItem && (
            <div className="relative">
              {/* Images Gallery */}
              {selectedItem.media && selectedItem.media.length > 0 && (
                <div className="w-full h-80 overflow-hidden rounded-t-lg">
                  {selectedItem.media.length === 1 ? (
                    <img
                      src={selectedItem.media[0].url}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2 h-full">
                      {selectedItem.media.slice(0, 4).map((media, idx) => (
                        <img
                          key={media.id}
                          src={media.url}
                          alt={`${selectedItem.title} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                {/* Title and Mood */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-4xl handwritten font-bold text-[#2c3e50]">{selectedItem.title}</h2>
                  {selectedItem.mood && (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-1">{selectedItem.mood}</span>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[#7f8c8d] mb-3">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg handwritten">
                    {new Date(selectedItem.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Location */}
                {selectedItem.location && (
                  <div className="flex items-center gap-2 text-[#7f8c8d] mb-6">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg handwritten">{selectedItem.location}</span>
                  </div>
                )}

                {/* Content */}
                <div className="mb-6">
                  <p className="text-lg handwritten text-[#34495e] leading-relaxed whitespace-pre-wrap">
                    {selectedItem.content}
                  </p>
                </div>

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-5 h-5 text-[#8b6f47]" />
                    {selectedItem.tags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="px-4 py-2 bg-[#d4a574]/30 text-[#8b6f47] rounded-full text-sm handwritten font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
