"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { BookOpen, Calendar, MapPin, Tag, Clock, Heart, Sparkles, X, Mic, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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

function TimelineContent() {
  const { user, loading: authLoading } = useSupabaseAuth()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const memoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  
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

  // Helper function to check if media is audio (case-insensitive)
  const isAudioMedia = (media: { media_type: string }) => {
    return media.media_type?.toLowerCase() === 'audio'
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchMemories()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  // Handle highlighting memory from URL parameter
  useEffect(() => {
    if (highlightId && memories.length > 0 && !loading) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const memory = memories.find(m => m.id === highlightId)
        if (memory) {
          // Open the memory modal
          setSelectedMemory(memory)
          
          // Scroll to the memory card
          const element = memoryRefs.current[highlightId]
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Add a highlight effect
            element.style.animation = 'pulse 2s ease-in-out'
          }
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [highlightId, memories, loading])

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
      
      // Normalize media data - prioritize 'media_type' over 'type' and ensure lowercase
      const normalizedMemories = (data.memories || []).map((memory: any) => ({
        ...memory,
        media: memory.media?.map((m: any) => ({
          id: m.id,
          url: m.url,
          media_type: (m.media_type || m.type || '').toLowerCase(), // Prioritize media_type, then type, normalize to lowercase
          thumbnail_url: m.thumbnail_url
        })) || []
      }))
      
      // Transform and group memories
      const transformedMemories: GroupedMemory[] = normalizedMemories.map((memory: Memory) => {
        const memoryDate = new Date(memory.date)
        // Find first non-audio media for thumbnail
        const firstVisualMedia = memory.media?.find(m => m.media_type?.toLowerCase() !== 'audio')
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
              <Link href="/timeline" className="text-sm handwritten font-semibold text-[#8b6f47]">
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 mb-3">
            <Clock className="w-8 h-8 text-[#8b6f47]" />
            <Sparkles className="w-6 h-6 text-[#d4a574]" />
          </div>
          <h1 className="text-6xl handwritten font-bold text-[#2c3e50] mb-2">
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
      <div className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="relative">
          {/* Timeline Start Indicator - Classical Design */}
          {!loading && memories.length > 0 && (
            <div className="relative flex items-center justify-center mb-12">
              {/* Decorative star */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-4">
                <svg width="40" height="40" viewBox="0 0 40 40" className="animate-pulse">
                  <path d="M20 5 L22 15 L30 12 L24 20 L32 25 L22 24 L20 35 L18 24 L8 25 L16 20 L10 12 L18 15 Z" 
                    fill="#3498db" stroke="#2c7db8" strokeWidth="1.5" opacity="0.8"/>
                </svg>
              </div>
              <div className="bg-white border-2 border-dashed border-[#3498db] rounded-lg px-6 py-3 shadow-md relative">
                <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-[#3498db]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3498db]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[#3498db]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#3498db]" />
                <p className="text-sm handwritten text-[#3498db] font-bold text-center">
                  ✨ Your Journey Begins Here ✨
                </p>
              </div>
            </div>
          )}
          
          {/* Vertical Timeline Line - Dashed Classical Style */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#8b6f47]" 
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #8b6f47, #8b6f47 10px, transparent 10px, transparent 20px)'
            }}
          />

          {filteredYears.map((year, yearIndex) => {
            // Get months for this year and sort them (newest first)
            const monthsInYear = Object.keys(groupedMemories[year])
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            monthsInYear.sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a))

            // Filter months if a month is selected
            const filteredMonths = selectedMonth ? monthsInYear.filter(m => m === selectedMonth) : monthsInYear

            return (
              <div key={year} className="mb-16">
                {/* Year Badge - Simple & Elegant */}
                <div className="relative flex justify-center mb-10">
                  <button
                    onClick={() => handleYearClick(year)}
                    className="bg-white border-2 border-[#8b6f47] px-8 py-2 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer relative"
                  >
                    <h2 className="text-2xl handwritten font-bold text-[#8b6f47]">{year}</h2>
                  </button>
                </div>

                {/* Months */}
                {filteredMonths.map((month) => {
                  let memoryIndex = 0
                  
                  return (
                    <div key={`${year}-${month}`} className="mb-12">
                      {/* Month Badge - Simple & Clean */}
                      <div className="relative flex justify-center mb-8">
                        <button
                          onClick={() => {
                            if (selectedYear !== year) {
                              setSelectedYear(year)
                            }
                            handleMonthClick(month)
                          }}
                          className="bg-[#d4a574] text-white px-6 py-1.5 rounded-full shadow-md z-10 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          <h3 className="text-base handwritten font-semibold">{month}</h3>
                        </button>
                      </div>

                      {/* Memories - Newest appears at top */}
                      {groupedMemories[year][month].map((memory, index) => {
                        const isLeft = memoryIndex % 2 === 0
                        const hasAudio = memory.media && memory.media.some(m => isAudioMedia(m))
                        memoryIndex++

                        return (
                  <div key={memory.id} className="relative mb-14" data-memory-title={memory.title} data-memory-date={memory.date}>
                    {/* Timeline Dot with Date - Vintage Style */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-20">
                      <div className="relative">
                        {/* Outer decorative ring */}
                        <div className="absolute inset-0 w-16 h-16 -translate-x-2 -translate-y-2 border-2 border-dashed rounded-full animate-spin-slow"
                          style={{ borderColor: memory.color, animationDuration: '20s' }} />
                        
                        {/* Main date badge */}
                        <div className="relative w-12 h-12 rounded-full shadow-xl ring-4 ring-white flex items-center justify-center"
                          style={{ backgroundColor: memory.color }}
                        >
                          <span className="text-white text-sm font-bold handwritten">{memory.day}</span>
                        </div>
                        
                        {/* Small decorative dots */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white shadow-md" />
                      </div>
                    </div>

                    {/* Connecting Line to Card */}
                    <div className={`absolute top-8 ${isLeft ? 'left-14 md:left-auto md:right-[calc(50%+1.5rem)]' : 'left-14 md:left-[calc(50%+1.5rem)]'} w-8 md:w-12 h-0.5 border-t-2 border-dashed z-10`}
                      style={{ borderColor: memory.color }} 
                    />

                    {/* Memory Card - Classical Postcard Design */}
                    <div className={`relative md:w-[calc(50%-3.5rem)] ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'} ml-24 md:ml-0`}>
                      <div
                        ref={(el) => { memoryRefs.current[memory.id] = el }}
                        className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group relative border-4 border-[#fef9f3] transform hover:-translate-y-1 hover:rotate-1"
                        onClick={() => setSelectedMemory(memory)}
                        style={{
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(212, 184, 150, 0.2)'
                        }}
                      >
                        {/* Decorative corner stamps */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-2 border-[#d4b896] rotate-45 z-10 opacity-30" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-2 border-[#d4b896] rotate-45 z-10 opacity-30" />
                        
                        {/* Image Section - Polaroid Style */}
                        <div className="relative h-56 overflow-hidden bg-[#fef9f3] p-2">
                          <div className="relative h-full rounded-sm overflow-hidden shadow-inner">
                            <img
                              src={
                                memory.image && isCloudinaryUrl(memory.image)
                                  ? getOptimizedImageUrl(memory.image, {
                                      width: 800,
                                      height: 500,
                                      quality: 'auto:good',
                                      format: 'auto',
                                      crop: 'fill',
                                      gravity: 'auto'
                                    })
                                  : memory.image
                              }
                              alt={memory.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                            />
                            
                            {/* Vintage overlay */}
                            <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/5 pointer-events-none" />
                          </div>
                          
                          {/* Audio Icon - Vintage Stamp Style */}
                          {hasAudio && (
                            <div className="absolute bottom-3 left-3 bg-[#3498db] rounded-sm p-2 shadow-lg group-hover:scale-110 transition-transform duration-300 rotate-6 border-2 border-white">
                              <Mic className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          {/* Mood Badge - Wax Seal Style */}
                          <div
                            className="absolute -top-1 -right-1 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl border-3 border-white transform rotate-12 group-hover:rotate-0 transition-transform duration-500"
                            style={{ 
                              backgroundColor: memory.color,
                              boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)'
                            }}
                          >
                            {memory.mood}
                          </div>
                        </div>

                        {/* Content Section - Journal Entry Style */}
                        <div className="p-5 bg-linear-to-b from-white to-[#fef9f3]/30">
                          {/* Date Badge - Vintage Ticket Style */}
                          <div className="inline-flex items-center gap-2 bg-[#d4a574]/10 border border-[#d4a574] px-3 py-1.5 mb-3 shadow-sm"
                            style={{
                              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                            }}
                          >
                            <Calendar className="w-3.5 h-3.5 text-[#8b6f47]" />
                            <span className="text-xs handwritten font-bold text-[#8b6f47]">
                              {memory.month} {memory.day}, {memory.year}
                            </span>
                          </div>

                          {/* Title - Handwritten Style */}
                          <h3 className="text-xl handwritten font-bold text-[#2c3e50] mb-2 line-clamp-2 leading-tight">
                            {memory.title}
                          </h3>

                          {/* Content Preview - Faded Ink */}
                          <p className="text-sm handwritten text-[#7f8c8d] mb-3 line-clamp-3 leading-relaxed italic">
                            "{memory.content.replace(/<[^>]*>/g, '').substring(0, 150)}{memory.content.replace(/<[^>]*>/g, '').length > 150 ? '...' : ''}"
                          </p>

                          {/* Location - Map Pin Style */}
                          {memory.location && (
                            <div className="flex items-center gap-2 text-xs handwritten text-[#8b6f47] mb-3 bg-[#d4b896]/10 px-2 py-1 rounded-full w-fit">
                              <MapPin className="w-3 h-3 fill-[#8b6f47]" />
                              <span className="truncate font-semibold">{memory.location}</span>
                            </div>
                          )}

                          {/* Tags - Vintage Labels */}
                          <div className="flex flex-wrap gap-2">
                            {memory.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 text-xs handwritten font-semibold border-2 shadow-sm transform hover:scale-105 transition-transform"
                                style={{
                                  borderColor: memory.color,
                                  color: memory.color,
                                  backgroundColor: 'white',
                                  clipPath: 'polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)'
                                }}
                              >
                                #{tag}
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

          {/* Timeline End Marker - Vintage Frame */}
          <div className="relative flex justify-center pt-8">
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -inset-4 border-2 border-dashed border-[#d4a574] rounded-full" />
              <div className="absolute -inset-2 border border-[#8b6f47] rounded-full" />
              
              {/* Main heart badge */}
              <div className="bg-white border-4 border-[#d4a574] text-[#8b6f47] w-20 h-20 rounded-full shadow-2xl z-10 flex items-center justify-center relative">
                <Heart className="w-10 h-10 fill-[#d4a574] animate-pulse" />
                
                {/* Corner decorations */}
                <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-[#8b6f47]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#8b6f47]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[#8b6f47]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#8b6f47]" />
              </div>
            </div>
            
            {/* End message */}
            <div className="absolute -bottom-8 bg-white border-2 border-[#d4b896] px-6 py-2 rounded-full shadow-md">
              <p className="text-xs handwritten text-[#8b6f47] font-bold">The Beginning of Forever ✨</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>

      {/* Detailed View Dialog - Add Memory Style */}
      {selectedMemory && (
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
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-[#8b6f47]" />
                  </button>
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
                          <h1 className="text-xl handwritten font-bold text-[#2c3e50]">
                            {selectedMemory.title}
                          </h1>
                        </div>
                        
                        {/* Date & Meta Row */}
                        <div className="flex items-center gap-3 text-xs handwritten text-[#7f8c8d]">
                          <span className="font-medium">
                            {selectedMemory.month} {selectedMemory.day}, {selectedMemory.year}
                          </span>
                          {selectedMemory.location && (
                            <>
                              <span className="text-[#d4b896]">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#7f8c8d]" />
                                <span>{selectedMemory.location}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Tags Display */}
                        {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedMemory.tags.map((tag, idx) => (
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
                      {selectedMemory.mood && (
                        <div className="flex flex-col items-end gap-1">
                          <label className="text-xs handwritten font-medium text-[#7f8c8d]">
                            Mood
                          </label>
                          <div 
                            className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg border border-[#d4b896]/30"
                            style={{ backgroundColor: selectedMemory.color + '20' }}
                          >
                            {selectedMemory.mood}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="px-6 py-6 bg-white min-h-[400px]">
                    {/* Audio Section */}
                    {selectedMemory.media && selectedMemory.media.filter(m => isAudioMedia(m)).length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Mic className="w-4 h-4 text-[#8b6f47]" />
                          <span className="text-sm handwritten font-semibold text-[#8b6f47]">Audio Recordings</span>
                        </div>
                        <div className="space-y-3">
                          {selectedMemory.media.filter(m => isAudioMedia(m)).map((audio) => (
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

                    {/* Story Content - Same styling as TiptapEditor */}
                    <div 
                      className="tiptap-content prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedMemory.content }}
                    />
                  </div>

                  {/* Footer */}
                  <div className="bg-[#fef9f3]/80 backdrop-blur-sm border-t border-[#d4b896]/40 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedMemory(null)}
                        className="text-sm handwritten text-[#7f8c8d] hover:text-[#2c3e50] transition-colors flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Timeline
                      </button>
                      <div className="text-xs handwritten text-[#7f8c8d]">
                        Created {new Date(selectedMemory.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TimelinePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b6f47]"></div>
      </div>
    }>
      <TimelineContent />
    </Suspense>
  )
}