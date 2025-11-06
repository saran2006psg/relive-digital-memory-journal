"use client"

import { useState, useEffect } from "react"
import { BookOpen, Calendar, MapPin, Tag, Clock, Heart, Sparkles, X, Mic, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
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
    media_type: string
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
  const [groupedMemories, setGroupedMemories] = useState<Record<number, Record<string, GroupedMemory[]>>>({})
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  
  // Pagination for timeline items
  const [currentPage, setCurrentPage] = useState(1)
  const memoriesPerPage = 10

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
      
      // Normalize media data - convert 'type' from DB to 'media_type' for consistency
      const normalizedMemories = (data.memories || []).map((memory: any) => ({
        ...memory,
        media: memory.media?.map((m: any) => ({
          id: m.id,
          url: m.url,
          media_type: m.type || m.media_type, // Use 'type' from DB, fallback to media_type
          thumbnail_url: m.thumbnail_url
        })) || []
      }))
      
      // Transform and group memories
      const transformedMemories: GroupedMemory[] = normalizedMemories.map((memory: Memory) => {
        const memoryDate = new Date(memory.date)
        // Find first non-audio media for thumbnail
        const firstVisualMedia = memory.media?.find(m => m.media_type !== 'audio')
        return {
          ...memory,
          year: memoryDate.getFullYear(),
          month: memoryDate.toLocaleDateString('en-US', { month: 'long' }),
          day: memoryDate.getDate(),
          color: memory.mood ? moodColors[memory.mood] || '#B5D99C' : '#B5D99C',
          image: firstVisualMedia ? firstVisualMedia.url : undefined
        }
      })

      // Sort by date (newest first - timeline grows from top)
      transformedMemories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Group by year and month
      const grouped = transformedMemories.reduce((acc, memory) => {
        if (!acc[memory.year]) {
          acc[memory.year] = {}
        }
        if (!acc[memory.year][memory.month]) {
          acc[memory.year][memory.month] = []
        }
        acc[memory.year][memory.month].push(memory)
        return acc
      }, {} as Record<number, Record<string, GroupedMemory[]>>)

      // Sort memories within each month (newest first - top to bottom)
      Object.keys(grouped).forEach(year => {
        Object.keys(grouped[Number(year)]).forEach(month => {
          grouped[Number(year)][month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })
      })

      // Sort years newest first
      const yearsList = Object.keys(grouped).map(Number).sort((a, b) => b - a)
      
      // Debug: log the order and media types
      console.log('Timeline order:', transformedMemories.map(m => ({ 
        title: m.title, 
        date: m.date,
        mediaCount: m.media?.length || 0,
        mediaTypes: m.media?.map(med => med.media_type).join(', ') || 'none'
      })))

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

  const handleYearClick = (year: number) => {
    if (selectedYear === year) {
      // If clicking the same year, clear all filters
      setSelectedYear(null)
      setSelectedMonth(null)
    } else {
      // Select new year and clear month filter
      setSelectedYear(year)
      setSelectedMonth(null)
    }
  }

  const handleMonthClick = (month: string) => {
    if (selectedMonth === month) {
      // If clicking the same month, clear month filter
      setSelectedMonth(null)
    } else {
      // Select new month
      setSelectedMonth(month)
    }
  }

  const clearFilters = () => {
    setSelectedYear(null)
    setSelectedMonth(null)
  }

  // Filter years based on selection
  const filteredYears = selectedYear ? years.filter(y => y === selectedYear) : years

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

      {/* Minimal Horizontal Filter Bar */}
      {!loading && memories.length > 0 && (
        <div className="border-b border-[#d4b896]/40 bg-white/90 backdrop-blur-sm sticky top-[73px] z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Filter Label */}
              <div className="flex items-center gap-3">
                <span className="text-sm handwritten font-semibold text-[#8b6f47]">Filter:</span>
                
                {/* Year Buttons */}
                <div className="flex items-center gap-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearClick(year)}
                      className={`px-3 py-1 rounded-full handwritten font-medium text-xs transition-all duration-300 ${
                        selectedYear === year
                          ? 'bg-[#8b6f47] text-white shadow-md'
                          : 'bg-white border border-[#d4b896] text-[#8b6f47] hover:border-[#8b6f47]'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                {/* Month Buttons - Show when year selected */}
                {selectedYear && (
                  <>
                    <div className="w-px h-6 bg-[#d4b896]"></div>
                    <div className="flex items-center gap-2">
                      {Object.keys(groupedMemories[selectedYear]).map((month) => (
                        <button
                          key={month}
                          onClick={() => handleMonthClick(month)}
                          className={`px-3 py-1 rounded-full handwritten font-medium text-xs transition-all duration-300 ${
                            selectedMonth === month
                              ? 'bg-[#d4a574] text-white shadow-md'
                              : 'bg-white border border-[#d4b896] text-[#8b6f47] hover:border-[#d4a574]'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right: Clear Button & Active Filter */}
              <div className="flex items-center gap-3">
                {(selectedYear || selectedMonth) && (
                  <>
                    <span className="text-xs handwritten text-[#7f8c8d]">
                      {selectedMonth && `${selectedMonth} `}
                      {selectedYear}
                    </span>
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1 text-xs handwritten font-medium text-[#8b6f47] hover:text-white hover:bg-[#8b6f47] border border-[#8b6f47] rounded-full transition-all duration-300"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
          {/* Timeline Start Indicator - Newest memories start here */}
          {!loading && memories.length > 0 && (
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#3498db] shadow-lg ring-4 ring-white animate-pulse" />
              <div className="ml-16 md:ml-0 bg-[#3498db]/10 border border-[#3498db]/30 rounded-full px-4 py-2">
                <p className="text-xs handwritten text-[#3498db] font-semibold text-center">
                  ✨ Newest memories appear here
                </p>
              </div>
            </div>
          )}
          
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d4a574] via-[#8b6f47] to-[#d4a574]" />

          {filteredYears.map((year, yearIndex) => {
            // Get months for this year and sort them (newest first)
            const monthsInYear = Object.keys(groupedMemories[year])
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            monthsInYear.sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a))

            // Filter months if a month is selected
            const filteredMonths = selectedMonth ? monthsInYear.filter(m => m === selectedMonth) : monthsInYear

            return (
              <div key={year} className="mb-16">
                {/* Year Badge */}
                <div className="relative flex justify-center mb-12">
                  <button
                    onClick={() => handleYearClick(year)}
                    className="bg-gradient-to-r from-[#8b6f47] to-[#d4a574] text-white px-8 py-3 rounded-full shadow-xl z-10 transform hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    <h2 className="text-3xl handwritten font-bold">{year}</h2>
                  </button>
                </div>

                {/* Months */}
                {filteredMonths.map((month) => {
                  let memoryIndex = 0
                  
                  return (
                    <div key={`${year}-${month}`} className="mb-12">
                      {/* Month Badge */}
                      <div className="relative flex justify-center mb-8">
                        <button
                          onClick={() => {
                            setSelectedYear(year)
                            handleMonthClick(month)
                          }}
                          className="bg-gradient-to-r from-[#d4a574]/80 to-[#b8956a]/80 text-white px-6 py-2 rounded-full shadow-lg z-10 transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                          <h3 className="text-xl handwritten font-semibold">{month}</h3>
                        </button>
                      </div>

                      {/* Memories - Newest appears at top */}
                      {groupedMemories[year][month].map((memory, index) => {
                        const isLeft = memoryIndex % 2 === 0
                        const hasAudio = memory.media && memory.media.some(m => m.media_type === 'audio')
                        memoryIndex++
                        
                        // Debug in DOM
                        console.log(`Rendering ${memory.title} at index ${index} for ${month} ${year}`, memory.date)

                        return (
                  <div key={memory.id} className="relative mb-12" data-memory-title={memory.title} data-memory-date={memory.date}>
                    {/* Timeline Dot with Date */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full shadow-lg z-10 ring-4 ring-white flex items-center justify-center"
                      style={{ backgroundColor: memory.color }}
                    >
                      <span className="text-white text-xs font-bold handwritten">{memory.day}</span>
                    </div>

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
                          
                          {/* Audio Icon - Minimal at bottom of image */}
                          {hasAudio && (
                            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md group-hover:scale-110 transition-transform duration-300">
                              <Mic className="w-3 h-3 text-[#3498db]" />
                            </div>
                          )}
                          
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
                  )
                })}
              </div>
            )
          })}

          {/* Timeline End Marker */}
          <div className="relative flex justify-center">
            <div className="bg-[#faf5ed] border-4 border-[#d4a574] text-[#8b6f47] w-16 h-16 rounded-full shadow-xl z-10 flex items-center justify-center">
              <Heart className="w-8 h-8 fill-[#d4a574]" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View Dialog */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-[#faf5ed] overflow-y-auto">
          <div className="relative w-full min-h-screen">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMemory(null)}
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
                    {selectedMemory.media && selectedMemory.media.filter(m => m.media_type !== 'audio').length > 0 ? (
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-4 border-white" style={{ height: '450px' }}>
                        {/* Images/Videos Container */}
                        <div className="w-full h-full">
                          {selectedMemory.media.filter(m => m.media_type !== 'audio').length === 1 ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                              {selectedMemory.media.find(m => m.media_type !== 'audio')!.media_type === 'video' ? (
                                <video
                                  src={selectedMemory.media.find(m => m.media_type !== 'audio')!.url}
                                  controls
                                  className="w-full h-full object-contain rounded-lg"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={
                                    isCloudinaryUrl(selectedMemory.media.find(m => m.media_type !== 'audio')!.url)
                                      ? getOptimizedImageUrl(selectedMemory.media.find(m => m.media_type !== 'audio')!.url, {
                                          width: 1200,
                                          quality: 'auto:good',
                                          format: 'auto',
                                          crop: 'limit'
                                        })
                                      : selectedMemory.media.find(m => m.media_type !== 'audio')!.url
                                  }
                                  alt={selectedMemory.title}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 p-3 h-full">
                              {selectedMemory.media.filter(m => m.media_type !== 'audio').map((media, idx) => (
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
                                      alt={`${selectedMemory.title} - ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (!selectedMemory.media || selectedMemory.media.length === 0) ? (
                      <div className="bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center h-[450px]">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 text-[#d4b896] mx-auto mb-3" />
                          <p className="text-base handwritten text-[#7f8c8d]">No media attached</p>
                        </div>
                      </div>
                    ) : null}
                    
                    {/* Audio Section - Separate, compact design */}
                    {selectedMemory.media && selectedMemory.media.filter(m => m.media_type === 'audio').length > 0 && (
                      <div className="bg-white rounded-xl shadow-md border border-[#d4b896]/20 overflow-hidden">
                        {selectedMemory.media.filter(m => m.media_type === 'audio').map((audio) => (
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
                          {selectedMemory.title}
                        </h2>
                      </div>
                      {selectedMemory.mood && (
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-white shrink-0"
                          style={{ 
                            backgroundColor: selectedMemory.color
                          }}
                        >
                          {selectedMemory.mood}
                        </div>
                      )}
                    </div>

                    {/* Date & Location */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                        <Calendar className="w-5 h-5 text-[#8b6f47]" />
                        <span className="text-base handwritten font-medium text-[#2c3e50]">
                          {selectedMemory.month} {selectedMemory.day}, {selectedMemory.year}
                        </span>
                      </div>

                      {selectedMemory.location && (
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                          <MapPin className="w-5 h-5 text-[#8b6f47]" />
                          <span className="text-base handwritten font-medium text-[#2c3e50]">
                            {selectedMemory.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#d4b896]/30">
                          <Tag className="w-5 h-5 text-[#8b6f47]" />
                          <h3 className="text-xl handwritten font-bold text-[#8b6f47]">
                            Memory Tags
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedMemory.tags.map((tag, idx) => (
                            <span
                              key={`${tag}-${idx}`}
                              className="px-4 py-2 rounded-full text-sm handwritten font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                              style={{
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: selectedMemory.color,
                                color: selectedMemory.color,
                                backgroundColor: selectedMemory.color + '15'
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
                      {selectedMemory.content}
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