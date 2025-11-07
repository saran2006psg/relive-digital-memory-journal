"use client"

import { useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Calendar, Clock, Heart, BookOpen, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/UserMenu"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"

const dashboardSections: {
  id: string
  label: string
  description: string
  color: string
  icon: LucideIcon
}[] = [
  {
    id: "on-this-day",
    label: "On This Day",
    description: "Hop back to memories captured on this very date.",
    color: "#3498db",
    icon: Calendar,
  },
  {
    id: "mood-journey",
    label: "Mood Journey",
    description: "Trace the emotions woven through your month.",
    color: "#ff9a8b",
    icon: Heart,
  },
]

const adjustColor = (hex: string, percent: number) => {
  const normalized = hex.replace("#", "")
  if (normalized.length !== 6) return hex

  const num = parseInt(normalized, 16)
  const amt = Math.round(2.55 * percent)
  const r = Math.min(255, Math.max(0, (num >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))

  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useSupabaseAuth()
  const [mounted, setMounted] = useState(false)
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [activeSection, setActiveSection] = useState<string>(dashboardSections[0].id)
  const [userName, setUserName] = useState<string>("")
  const [onThisDayMemories, setOnThisDayMemories] = useState<any[]>([])
  const [onThisDayContext, setOnThisDayContext] = useState<string>("")
  const [loadingMemories, setLoadingMemories] = useState(true)
  const [moodPeriod, setMoodPeriod] = useState<'month' | 'year'>('month')
  const [moodData, setMoodData] = useState<any[]>([])
  const [loadingMoods, setLoadingMoods] = useState(true)
  
  useEffect(() => {
    setMounted(true)
    setCurrentHour(new Date().getHours())
  }, [])

  // Fetch user name from database
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return

      try {
        const { createBrowserClient } = await import("@supabase/ssr")
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Try to get name from account table
        const { data: accountData, error } = await supabase
          .from('account')
          .select('name')
          .eq('userId', user.id)
          .single()

        if (accountData?.name) {
          setUserName(accountData.name)
        } else {
          // Fallback to user metadata or email
          const name = user.user_metadata?.name || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'Traveler'
          setUserName(name)
        }
      } catch (error) {
        console.error('Error fetching user name:', error)
        // Fallback to email username or metadata
        const name = user.user_metadata?.name || 
                    user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 
                    'Traveler'
        setUserName(name)
      }
    }

    fetchUserName()
  }, [user])

  // Fetch "On This Day" memories with priority logic
  useEffect(() => {
    const fetchOnThisDayMemories = async () => {
      if (!user) {
        setLoadingMemories(false)
        return
      }

      try {
        const { createBrowserClient } = await import("@supabase/ssr")
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const today = new Date()
        const currentMonth = today.getMonth() + 1 // 1-12
        const currentDay = today.getDate()
        const currentYear = today.getFullYear()

        // Helper function to fetch memories
        const fetchMemories = async (query: any) => {
          const response = await fetch('/api/memories', {
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            }
          })

          if (!response.ok) return []

          const data = await response.json()
          return data.memories || []
        }

        const allMemories = await fetchMemories({})

        // Priority 1: Check for memories from past years on this exact day
        const pastYearMemories = allMemories.filter((memory: any) => {
          const memoryDate = new Date(memory.date)
          return (
            memoryDate.getMonth() + 1 === currentMonth &&
            memoryDate.getDate() === currentDay &&
            memoryDate.getFullYear() < currentYear
          )
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (pastYearMemories.length > 0) {
          const yearsAgo = currentYear - new Date(pastYearMemories[0].date).getFullYear()
          setOnThisDayMemories(pastYearMemories.slice(0, 3))
          setOnThisDayContext(yearsAgo === 1 ? "A year ago today" : `${yearsAgo} years ago today`)
          setLoadingMemories(false)
          return
        }

        // Priority 2: Check for memories from past month on this day
        const pastMonthDate = new Date(today)
        pastMonthDate.setMonth(pastMonthDate.getMonth() - 1)
        const pastMonth = pastMonthDate.getMonth() + 1

        const pastMonthMemories = allMemories.filter((memory: any) => {
          const memoryDate = new Date(memory.date)
          return (
            memoryDate.getMonth() + 1 === pastMonth &&
            memoryDate.getDate() === currentDay &&
            memoryDate.getFullYear() === (pastMonth > currentMonth ? currentYear - 1 : currentYear)
          )
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (pastMonthMemories.length > 0) {
          setOnThisDayMemories(pastMonthMemories.slice(0, 3))
          setOnThisDayContext("A month ago today")
          setLoadingMemories(false)
          return
        }

        // Priority 3: Check for yesterday's memories
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayMonth = yesterday.getMonth() + 1
        const yesterdayDay = yesterday.getDate()
        const yesterdayYear = yesterday.getFullYear()

        const yesterdayMemories = allMemories.filter((memory: any) => {
          const memoryDate = new Date(memory.date)
          return (
            memoryDate.getMonth() + 1 === yesterdayMonth &&
            memoryDate.getDate() === yesterdayDay &&
            memoryDate.getFullYear() === yesterdayYear
          )
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (yesterdayMemories.length > 0) {
          setOnThisDayMemories(yesterdayMemories.slice(0, 3))
          setOnThisDayContext("Yesterday")
          setLoadingMemories(false)
          return
        }

        // Priority 4: Show latest/recent memories
        if (allMemories.length > 0) {
          const recentMemories = allMemories
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
          
          setOnThisDayMemories(recentMemories)
          setOnThisDayContext("Recent memories")
          setLoadingMemories(false)
          return
        }

        // No memories found
        setOnThisDayMemories([])
        setOnThisDayContext("")
        setLoadingMemories(false)

      } catch (error) {
        console.error('Error fetching on this day memories:', error)
        setOnThisDayMemories([])
        setOnThisDayContext("")
        setLoadingMemories(false)
      }
    }

    fetchOnThisDayMemories()
  }, [user])

  // Fetch mood data based on selected period
  useEffect(() => {
    const fetchMoodData = async () => {
      if (!user) {
        setLoadingMoods(false)
        return
      }

      try {
        const { createBrowserClient } = await import("@supabase/ssr")
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const today = new Date()
        let startDate: Date

        if (moodPeriod === 'month') {
          // Get first day of current month
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        } else {
          // Get first day of current year
          startDate = new Date(today.getFullYear(), 0, 1)
        }

        // Fetch memories with moods from the selected period
        const response = await fetch('/api/memories', {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        })

        if (!response.ok) {
          setMoodData([])
          setLoadingMoods(false)
          return
        }

        const data = await response.json()
        const allMemories = data.memories || []

        // Filter memories by date range and count moods
        const filteredMemories = allMemories.filter((memory: any) => {
          const memoryDate = new Date(memory.date)
          return memoryDate >= startDate && memoryDate <= today && memory.mood
        })

        // Count mood occurrences
        const moodCounts: { [key: string]: number } = {}
        filteredMemories.forEach((memory: any) => {
          if (memory.mood) {
            moodCounts[memory.mood] = (moodCounts[memory.mood] || 0) + 1
          }
        })

        // Map to mood data with colors
        const moodColors: { [key: string]: string } = {
          '😊': '#B5D99C',
          '😌': '#8dd3c7',
          '😔': '#A8B5E8',
          '😡': '#E07A5F',
          '❤️': '#ff9a8b',
          '😢': '#A8B5E8',
          '😍': '#ff9a8b',
          '😂': '#B5D99C',
          '🤗': '#B5D99C',
          '😴': '#8dd3c7',
        }

        const moodLabels: { [key: string]: string } = {
          '😊': 'Happy',
          '😌': 'Calm',
          '😔': 'Sad',
          '😡': 'Angry',
          '❤️': 'Loved',
          '😢': 'Sad',
          '😍': 'Loved',
          '😂': 'Happy',
          '🤗': 'Happy',
          '😴': 'Calm',
        }

        const processedMoods = Object.entries(moodCounts).map(([emoji, count]) => ({
          emoji,
          label: moodLabels[emoji] || 'Other',
          color: moodColors[emoji] || '#cbd5e0',
          count
        }))

        setMoodData(processedMoods)
        setLoadingMoods(false)

      } catch (error) {
        console.error('Error fetching mood data:', error)
        setMoodData([])
        setLoadingMoods(false)
      }
    }

    fetchMoodData()
  }, [user, moodPeriod])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry) => {
            setActiveSection(entry.target.id)
          })
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0.25,
      }
    )

    dashboardSections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const getGreeting = () => {
    if (currentHour < 12) return "Good Morning"
    if (currentHour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId)
    if (!sectionElement) return
    sectionElement.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const renderBinderRing = (section: (typeof dashboardSections)[number]) => {
    const isActive = activeSection === section.id
    const SectionIcon = section.icon
    const gradientStart = adjustColor(section.color, 30)
    const gradientEnd = adjustColor(section.color, -20)
    const bezelColor = adjustColor(section.color, -18)

    return (
      <Tooltip key={section.id}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => scrollToSection(section.id)}
            aria-label={`Jump to ${section.label}`}
            className={cn(
              "relative h-16 w-16 rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              isActive ? "scale-105" : "scale-95 hover:scale-105"
            )}
            style={{
              background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
              boxShadow:
                "inset 6px 6px 12px rgba(0,0,0,0.16), inset -4px -4px 10px rgba(255,255,255,0.7), 0 18px 28px rgba(15,23,42,0.18)",
              borderColor: `${bezelColor}`,
            }}
          >
            <span
              className="absolute inset-1.5 rounded-full border border-white/40"
              style={{
                boxShadow: "0 8px 12px rgba(15,23,42,0.12) inset, 0 -8px 12px rgba(255,255,255,0.15) inset",
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), transparent 60%)`,
              }}
            />
            <SectionIcon className="relative z-10 h-6 w-6 text-white drop-shadow-md" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[#2c3e50]/95 text-white shadow-xl"
        >
          <p className="text-sm font-semibold handwritten">{section.label}</p>
          <p className="text-xs opacity-80 max-w-48">{section.description}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#d4b896]/60 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#8b6f47]" />
              <span className="text-2xl handwritten font-bold text-[#8b6f47]">ReLive</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm handwritten font-semibold text-[#8b6f47]">
                Dashboard
              </Link>
              <Link href="/add-memory" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Add Memory
              </Link>
              <Link href="/timeline" className="text-sm handwritten font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Greeting - Notebook Style */}
        <div 
          className={`mb-8 relative transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-[#faf5ed] shadow-xl rounded-r-lg border-l-4 border-[#d4a574] p-8 relative overflow-hidden">
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-[#d4a574]/20" />
            <div className="absolute inset-0 pointer-events-none opacity-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 border-b border-[#a8d5e2]" />
              ))}
            </div>
            
            <div className="relative pl-12">
              <h1 className="text-5xl md:text-6xl handwritten font-bold text-[#2c3e50] mb-2">
                {getGreeting()}, {userName || 'Traveler'}
              </h1>
              <p className="text-2xl handwritten text-[#7f8c8d] flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Let's revisit some beautiful moments
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* On This Day */}
            <div
              id="on-this-day"
              className={`scroll-mt-36 transition-all duration-700 delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-3xl handwritten font-bold text-[#8b6f47]">
                  On This Day
                </h2>
                {onThisDayContext && (
                  <span className="text-lg handwritten text-[#7f8c8d]">
                    · {onThisDayContext}
                  </span>
                )}
              </div>
              
              {loadingMemories ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b6f47]"></div>
                </div>
              ) : onThisDayMemories.length > 0 ? (
                <div className="space-y-4">
                  {onThisDayMemories.map((memory) => {
                    const firstImage = memory.media?.find((m: any) => 
                      m.media_type?.toLowerCase() === 'image' || m.type?.toLowerCase() === 'image'
                    )
                    const memoryDate = new Date(memory.date)
                    const formattedDate = memoryDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                    
                    return (
                      <div key={memory.id} className="relative">
                        <div className="bg-[#faf5ed] shadow-lg rounded-r-lg border-l-4 border-[#d4a574] overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                          <div className="flex flex-col md:flex-row">
                            {firstImage && (
                              <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                                <img
                                  src={firstImage.url}
                                  alt={memory.title}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            )}
                            <div className={`${firstImage ? 'md:w-2/3' : 'w-full'} p-6 relative`}>
                              <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-[#d4a574]/20" />
                              <div className="absolute inset-0 pointer-events-none opacity-10">
                                {[...Array(8)].map((_, i) => (
                                  <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                                ))}
                              </div>
                              
                              <div className="relative pl-12">
                                <div className="text-base handwritten text-[#7f8c8d] mb-2">{formattedDate}</div>
                                <h3 className="text-2xl handwritten font-bold mb-3 text-[#2c3e50]">{memory.title}</h3>
                                {memory.story && (
                                  <p className="text-lg handwritten text-[#34495e] leading-relaxed line-clamp-3">
                                    {memory.story}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-[#faf5ed] shadow-lg rounded-r-lg border-l-4 border-[#d4a574] p-8 text-center">
                  <div className="relative">
                    <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-[#d4a574]/20" />
                    <div className="relative pl-12">
                      <div className="flex flex-col items-center gap-4">
                        <Sparkles className="w-12 h-12 text-[#8b6f47] opacity-50" />
                        <h3 className="text-2xl handwritten font-bold text-[#2c3e50]">
                          No memories found
                        </h3>
                        <p className="text-lg handwritten text-[#7f8c8d]">
                          Create something new and start capturing your moments!
                        </p>
                        <Link 
                          href="/add-memory"
                          className="mt-4 px-6 py-3 bg-[#8b6f47] text-white handwritten font-semibold rounded-lg hover:bg-[#6f5437] transition-colors duration-200 flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Your First Memory
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Mood Tracker */}
          <div className="space-y-6">
            <div
              id="mood-journey"
              className={`relative scroll-mt-36 transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl handwritten font-bold text-[#8b6f47]">
                  Mood Journey
                </h2>
                {/* Period Selector */}
                <div className="flex gap-2 bg-[#faf5ed] rounded-lg p-1 shadow-sm border border-[#d4a574]/30">
                  <button
                    onClick={() => setMoodPeriod('month')}
                    className={`px-3 py-1 rounded-md text-sm handwritten font-medium transition-all duration-200 ${
                      moodPeriod === 'month'
                        ? 'bg-[#8b6f47] text-white shadow-sm'
                        : 'text-[#8b6f47] hover:bg-[#8b6f47]/10'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setMoodPeriod('year')}
                    className={`px-3 py-1 rounded-md text-sm handwritten font-medium transition-all duration-200 ${
                      moodPeriod === 'year'
                        ? 'bg-[#8b6f47] text-white shadow-sm'
                        : 'text-[#8b6f47] hover:bg-[#8b6f47]/10'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              <div className="bg-[#faf5ed] shadow-lg rounded-r-lg border-l-4 border-[#d4a574] p-6 relative overflow-hidden">
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-[#d4a574]/20" />
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                  ))}
                </div>

                <div className="relative pl-12">
                  <h3 className="text-center handwritten text-2xl font-bold text-[#2c3e50] mb-1">
                    {moodPeriod === 'month' ? 'This Month' : 'This Year'}
                  </h3>
                  <p className="text-center handwritten text-lg text-[#7f8c8d] mb-6">Your emotional landscape</p>

                  {loadingMoods ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b6f47]"></div>
                    </div>
                  ) : moodData.length > 0 ? (
                    <>
                      {/* Mood Ring Chart */}
                      <div className="relative w-48 h-48 mx-auto mb-6">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {moodData.map((mood, index) => {
                            const totalCount = moodData.reduce((acc, m) => acc + m.count, 0)
                            const startAngle = moodData
                              .slice(0, index)
                              .reduce((acc, m) => acc + (m.count / totalCount) * 360, 0)
                            const angle = (mood.count / totalCount) * 360
                            const radius = 35
                            const centerX = 50
                            const centerY = 50
                            const startRad = (startAngle * Math.PI) / 180
                            const endRad = ((startAngle + angle) * Math.PI) / 180
                            
                            const x1 = centerX + radius * Math.cos(startRad)
                            const y1 = centerY + radius * Math.sin(startRad)
                            const x2 = centerX + radius * Math.cos(endRad)
                            const y2 = centerY + radius * Math.sin(endRad)
                            
                            const largeArc = angle > 180 ? 1 : 0
                            
                            return (
                              <path
                                key={`${mood.emoji}-${index}`}
                                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={mood.color}
                                opacity="0.8"
                                className="hover:opacity-100 transition-opacity duration-200"
                              />
                            )
                          })}
                          <circle cx="50" cy="50" r="20" fill="white" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl handwritten font-bold text-[#2c3e50]">
                              {moodData.reduce((acc, m) => acc + m.count, 0)}
                            </div>
                            <div className="text-sm handwritten text-[#7f8c8d]">Entries</div>
                          </div>
                        </div>
                      </div>

                      {/* Mood Legend */}
                      <div className="space-y-3">
                        {moodData.map((mood, index) => (
                          <div key={`${mood.emoji}-legend-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-5 h-5 rounded-full shadow-sm"
                                style={{ backgroundColor: mood.color }}
                              />
                              <span className="text-base handwritten font-medium text-[#2c3e50]">{mood.emoji} {mood.label}</span>
                            </div>
                            <span className="text-base handwritten text-[#7f8c8d]">{mood.count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-lg handwritten text-[#7f8c8d]">
                        No mood entries for this {moodPeriod === 'month' ? 'month' : 'year'} yet
                      </p>
                      <p className="text-sm handwritten text-[#7f8c8d] mt-2">
                        Add memories with moods to see your emotional journey!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/add-memory">
        <Button
          size="lg"
          className={`fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 handwritten ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </Link>
    </div>
  )
}