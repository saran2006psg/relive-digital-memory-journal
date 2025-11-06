"use client"

import { useState, useEffect } from "react"
import { BookOpen, Calendar, MapPin, Tag, Clock, Heart, Sparkles } from "lucide-react"
import Link from "next/link"
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
  }>
  tags: string[]
}

interface GroupedMemory extends Memory {
  year: number
  month: string
  day: number
  color: string
  image?: string
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

export default function TimelinePage() {
  const { user, loading: authLoading } = useSupabaseAuth()
  const [memories, setMemories] = useState<GroupedMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMemory, setSelectedMemory] = useState<GroupedMemory | null>(null)
  const [groupedMemories, setGroupedMemories] = useState<Record<number, GroupedMemory[]>>({})
  const [years, setYears] = useState<number[]>([])

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
        setError("Please log in to view your timeline")
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
      
      // Transform and group memories
      const transformedMemories: GroupedMemory[] = (data.memories || []).map((memory: Memory) => {
        const memoryDate = new Date(memory.date)
        return {
          ...memory,
          year: memoryDate.getFullYear(),
          month: memoryDate.toLocaleDateString('en-US', { month: 'long' }),
          day: memoryDate.getDate(),
          color: memory.mood ? moodColors[memory.mood] || '#B5D99C' : '#B5D99C',
          image: memory.media && memory.media.length > 0 ? memory.media[0].url : undefined
        }
      })

      // Sort by date (newest first)
      transformedMemories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Group by year
      const grouped = transformedMemories.reduce((acc, memory) => {
        if (!acc[memory.year]) {
          acc[memory.year] = []
        }
        acc[memory.year].push(memory)
        return acc
      }, {} as Record<number, GroupedMemory[]>)

      const yearsList = Object.keys(grouped).map(Number).sort((a, b) => b - a)

      setMemories(transformedMemories)
      setGroupedMemories(grouped)
      setYears(yearsList)
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
              <Link href="/timeline" className="text-sm handwritten font-semibold text-[#8b6f47]">
                Timeline
              </Link>
              <Link href="/gallery" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Gallery
              </Link>
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-4">
            <Clock className="w-8 h-8 text-[#8b6f47]" />
            <Sparkles className="w-6 h-6 text-[#d4a574]" />
          </div>
          <h1 className="text-6xl handwritten font-bold text-[#2c3e50] mb-3">
            Your Journey
          </h1>
          {loading ? (
            <p className="text-xl handwritten text-[#7f8c8d]">Loading your timeline...</p>
          ) : (
            <p className="text-xl handwritten text-[#7f8c8d]">
              {memories.length} precious moments captured in time
            </p>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 max-w-4xl mb-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-sm handwritten text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 pb-20 max-w-4xl">
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && memories.length === 0 && (
        <div className="container mx-auto px-4 pb-20 max-w-4xl text-center">
          <Clock className="w-24 h-24 text-[#d4b896] mx-auto mb-4" />
          <h2 className="text-3xl handwritten font-bold text-[#8b6f47] mb-2">No Memories Yet</h2>
          <p className="text-lg handwritten text-[#7f8c8d] mb-6">
            Start your journey by creating your first memory!
          </p>
          <Link href="/add-memory">
            <button className="px-6 py-3 bg-[#8b6f47] text-white rounded-lg handwritten text-lg hover:bg-[#6d5638] transition-colors">
              Create Your First Memory
            </button>
          </Link>
        </div>
      )}

      {/* Timeline */}
      <div className="container mx-auto px-4 pb-20 max-w-4xl">
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d4a574] via-[#8b6f47] to-[#d4a574]" />

          {years.map((year, yearIndex) => (
            <div key={year} className="mb-16">
              {/* Year Badge */}
              <div className="relative flex justify-center mb-12">
                <div className="bg-gradient-to-r from-[#8b6f47] to-[#d4a574] text-white px-8 py-3 rounded-full shadow-xl z-10 transform hover:scale-110 transition-transform duration-300">
                  <h2 className="text-3xl handwritten font-bold">{year}</h2>
                </div>
              </div>

              {/* Memories */}
              {groupedMemories[year].map((memory, index) => {
                const isLeft = index % 2 === 0

                return (
                  <div key={memory.id} className="relative mb-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-lg z-10 ring-4 ring-white"
                      style={{ backgroundColor: memory.color }}
                    />

                    {/* Memory Card */}
                    <div className={`relative md:w-[calc(50%-3rem)] ${isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'} ml-16 md:ml-0`}>
                      <div
                        className="bg-[#faf5ed] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-[#d4b896]/30"
                        onClick={() => setSelectedMemory(memory)}
                      >
                        {/* Image Section - Smaller */}
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={
                              memory.image && isCloudinaryUrl(memory.image)
                                ? getOptimizedImageUrl(memory.image, {
                                    width: 600,
                                    height: 300,
                                    quality: 'auto:good',
                                    format: 'auto',
                                    crop: 'fill',
                                    gravity: 'auto'
                                  })
                                : memory.image
                            }
                            alt={memory.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          {/* Mood Badge Overlay */}
                          <div
                            className="absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white"
                            style={{ backgroundColor: memory.color }}
                          >
                            {memory.mood}
                          </div>
                        </div>

                        {/* Content Section - Compact */}
                        <div className="p-4">
                          {/* Date Badge */}
                          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full mb-3 shadow-sm">
                            <Calendar className="w-3 h-3 text-[#8b6f47]" />
                            <span className="text-xs handwritten font-semibold text-[#8b6f47]">
                              {memory.month} {memory.day}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-xl handwritten font-bold text-[#2c3e50] mb-2 line-clamp-1">
                            {memory.title}
                          </h3>

                          {/* Content Preview */}
                          <p className="text-sm handwritten text-[#7f8c8d] mb-3 line-clamp-2">
                            {memory.content}
                          </p>

                          {/* Location */}
                          {memory.location && (
                            <div className="flex items-center gap-1 text-xs handwritten text-[#7f8c8d] mb-3">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{memory.location}</span>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {memory.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 rounded-full text-xs handwritten font-medium border"
                                style={{
                                  borderColor: memory.color,
                                  color: memory.color,
                                  backgroundColor: memory.color + '15'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                            {memory.tags.length > 2 && (
                              <span className="px-2 py-1 text-xs handwritten text-[#7f8c8d]">
                                +{memory.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Click indicator */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/95 p-2 rounded-full shadow-lg">
                            <Sparkles className="w-4 h-4 text-[#8b6f47]" />
                          </div>
                        </div>
                      </div>

                      {/* Arrow pointing to timeline */}
                      <div className={`hidden md:block absolute top-16 ${isLeft ? 'right-0' : 'left-0'} w-12 h-0.5`}
                        style={{ backgroundColor: memory.color + '60' }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        ))}

          {/* Timeline End Marker */}
          <div className="relative flex justify-center">
            <div className="bg-[#faf5ed] border-4 border-[#d4a574] text-[#8b6f47] w-16 h-16 rounded-full shadow-xl z-10 flex items-center justify-center">
              <Heart className="w-8 h-8 fill-[#d4a574]" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View Dialog */}
      <Dialog open={selectedMemory !== null} onOpenChange={() => setSelectedMemory(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#faf5ed]">
          {selectedMemory && (
            <div className="relative">
              {/* Large Image */}
              <div className="w-full h-96 overflow-hidden rounded-lg mb-6">
                <img
                  src={
                    selectedMemory.image && isCloudinaryUrl(selectedMemory.image)
                      ? getOptimizedImageUrl(selectedMemory.image, {
                          width: 1200,
                          quality: 'auto:good',
                          format: 'auto',
                          crop: 'limit'
                        })
                      : selectedMemory.image
                  }
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Title and Mood */}
                <div className="flex items-start justify-between">
                  <h2 className="text-4xl handwritten font-bold text-[#2c3e50]">
                    {selectedMemory.title}
                  </h2>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white"
                      style={{ backgroundColor: selectedMemory.color }}
                    >
                      {selectedMemory.mood}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[#7f8c8d]">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xl handwritten">
                    {selectedMemory.month} {selectedMemory.day}, {selectedMemory.year}
                  </span>
                </div>

                {/* Location */}
                {selectedMemory.location && (
                  <div className="flex items-center gap-2 text-[#7f8c8d]">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg handwritten">{selectedMemory.location}</span>
                  </div>
                )}

                {/* Content */}
                <div className="bg-white/60 rounded-lg p-6 border-l-4" style={{ borderColor: selectedMemory.color }}>
                  <p className="text-lg handwritten text-[#34495e] leading-relaxed">
                    {selectedMemory.content}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-5 h-5 text-[#8b6f47]" />
                  {selectedMemory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-full text-sm handwritten font-semibold border-2"
                      style={{
                        borderColor: selectedMemory.color,
                        color: selectedMemory.color,
                        backgroundColor: selectedMemory.color + '20'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}