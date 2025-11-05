"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Heart, Smile, Meh, Frown, BookOpen, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  
  useEffect(() => {
    setMounted(true)
    setCurrentHour(new Date().getHours())
  }, [])

  const getGreeting = () => {
    if (currentHour < 12) return "Good Morning"
    if (currentHour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const totalMoodCount = moods.reduce((acc, mood) => acc + mood.count, 0)

  return (
    <div className="min-h-screen bg-[#f5e6d3] pb-20">
      {/* Header */}
      <header className="border-b border-[#d4b896] bg-[#faf5ed]/80 backdrop-blur-sm sticky top-0 z-10">
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
          <div className="absolute -left-8 top-4 flex flex-col gap-8 hidden md:flex">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
            ))}
          </div>

          <div className="bg-white shadow-xl rounded-r-lg border-l-4 border-[#3498db] p-8 relative overflow-hidden">
            <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#3498db]/20" />
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
              className={`transition-all duration-700 delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h2 className="text-3xl handwritten font-bold mb-4 flex items-center gap-2 text-[#2c3e50]">
                <Calendar className="w-7 h-7 text-[#3498db]" />
                On This Day
              </h2>
              <div className="space-y-4">
                {memories.map((memory, index) => (
                  <div key={memory.id} className="relative">
                    <div className="absolute -left-8 top-8 flex flex-col gap-16 hidden md:flex">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                      ))}
                    </div>

                    <div className="bg-white shadow-lg rounded-r-lg border-l-4 border-[#3498db] overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
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
                          <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#3498db]/20" />
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

            {/* Reminders */}
            <div
              className={`transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h2 className="text-3xl handwritten font-bold mb-4 flex items-center gap-2 text-[#2c3e50]">
                <Clock className="w-7 h-7 text-[#3498db]" />
                Upcoming Reminders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reminders.map((reminder, index) => (
                  <div key={reminder.id} className="relative">
                    <div className="absolute -left-8 top-4 hidden md:block">
                      <div className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                    </div>

                    <div
                      className="bg-white shadow-lg rounded-r-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 relative overflow-hidden"
                      style={{ borderLeftColor: reminder.color }}
                    >
                      <div className="absolute left-12 top-0 bottom-0 w-[2px]" style={{ backgroundColor: reminder.color + '20' }} />
                      <div className="absolute inset-0 pointer-events-none opacity-10">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-6 border-b border-[#a8d5e2]" />
                        ))}
                      </div>
                      
                      <div className="relative pl-8">
                        <h3 className="text-xl handwritten font-bold text-[#2c3e50] mb-2">{reminder.title}</h3>
                        <p className="text-lg handwritten font-semibold" style={{ color: reminder.color }}>
                          {reminder.date}
                        </p>
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
              className={`relative transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="absolute -left-8 top-20 flex flex-col gap-16 hidden md:flex">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                ))}
              </div>

              <h2 className="text-3xl handwritten font-bold mb-4 flex items-center gap-2 text-[#2c3e50]">
                <Heart className="w-7 h-7 text-[#ff9a8b]" />
                Mood Journey
              </h2>
              <div className="bg-white shadow-lg rounded-r-lg border-l-4 border-[#ff9a8b] p-6 relative overflow-hidden">
                <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#ff9a8b]/20" />
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