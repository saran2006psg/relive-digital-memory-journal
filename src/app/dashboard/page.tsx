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

const moods = [
  { emoji: "😊", label: "Happy", color: "#B5D99C", count: 12 },
  { emoji: "😌", label: "Calm", color: "#8dd3c7", count: 8 },
  { emoji: "😔", label: "Sad", color: "#A8B5E8", count: 3 },
  { emoji: "😡", label: "Angry", color: "#E07A5F", count: 2 },
  { emoji: "❤️", label: "Loved", color: "#ff9a8b", count: 15 },
]

const memories = [
  {
    id: 1,
    date: "March 15, 2023",
    title: "Coffee with Sarah",
    content: "Had the most wonderful conversation about dreams and aspirations. The cafe was cozy and the autumn leaves outside were beautiful.",
    mood: "😊",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
  },
  {
    id: 2,
    date: "March 15, 2022",
    title: "First day at the new job",
    content: "Nervous but excited. Everyone was so welcoming. Can't believe it's been a year already!",
    mood: "😌",
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80"
  }
]

const reminders = [
  { id: 1, title: "Mom's Birthday Memory", date: "In 3 days", color: "#ff9a8b" },
  { id: 2, title: "Anniversary with Alex", date: "In 12 days", color: "#8dd3c7" },
  { id: 3, title: "Graduation Day", date: "In 45 days", color: "#3498db" },
]

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
  const [mounted, setMounted] = useState(false)
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [activeSection, setActiveSection] = useState<string>(dashboardSections[0].id)
  
  useEffect(() => {
    setMounted(true)
    setCurrentHour(new Date().getHours())
  }, [])

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

  const totalMoodCount = moods.reduce((acc, mood) => acc + mood.count, 0)

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
                {getGreeting()}, Traveler
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
              <h2 className="text-3xl handwritten font-bold mb-4 text-[#8b6f47]">
                On This Day
              </h2>
              <div className="space-y-4">
                {memories.map((memory, index) => (
                  <div key={memory.id} className="relative">
                    <div className="bg-[#faf5ed] shadow-lg rounded-r-lg border-l-4 border-[#d4a574] overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                          {/* Tape Effect on Image */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#fef9f3] opacity-60 shadow-sm rotate-[-5deg] z-10" />
                          <img
                            src={memory.image}
                            alt={memory.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 text-4xl">{memory.mood}</div>
                        </div>
                        <div className="md:w-2/3 p-6 relative">
                          <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-[#d4a574]/20" />
                          <div className="absolute inset-0 pointer-events-none opacity-10">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                            ))}
                          </div>
                          
                          <div className="relative pl-12">
                            <div className="text-base handwritten text-[#7f8c8d] mb-2">{memory.date}</div>
                            <h3 className="text-2xl handwritten font-bold mb-3 text-[#2c3e50]">{memory.title}</h3>
                            <p className="text-lg handwritten text-[#34495e] leading-relaxed">{memory.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <h2 className="text-3xl handwritten font-bold mb-4 text-[#8b6f47]">
                Mood Journey
              </h2>
              <div className="bg-[#faf5ed] shadow-lg rounded-r-lg border-l-4 border-[#d4a574] p-6 relative overflow-hidden">
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-[#d4a574]/20" />
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                  ))}
                </div>

                <div className="relative pl-12">
                  <h3 className="text-center handwritten text-2xl font-bold text-[#2c3e50] mb-1">This Month</h3>
                  <p className="text-center handwritten text-lg text-[#7f8c8d] mb-6">Your emotional landscape</p>

                  {/* Mood Ring Chart */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {moods.map((mood, index) => {
                        const startAngle = moods
                          .slice(0, index)
                          .reduce((acc, m) => acc + (m.count / totalMoodCount) * 360, 0)
                        const angle = (mood.count / totalMoodCount) * 360
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
                            key={mood.label}
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
                        <div className="text-3xl handwritten font-bold text-[#2c3e50]">{totalMoodCount}</div>
                        <div className="text-sm handwritten text-[#7f8c8d]">Entries</div>
                      </div>
                    </div>
                  </div>

                  {/* Mood Legend */}
                  <div className="space-y-3">
                    {moods.map((mood) => (
                      <div key={mood.label} className="flex items-center justify-between">
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