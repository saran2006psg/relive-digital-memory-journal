"use client"

import { useState, useEffect, useRef } from "react"
import { BookOpen, Calendar, MapPin, Tag, X } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const memories = [
  {
    id: 1,
    year: 2024,
    month: "March",
    day: 15,
    title: "Coffee with Sarah",
    content: "Had the most wonderful conversation about dreams and aspirations. The cafe was cozy and the autumn leaves outside were beautiful. We talked for hours about our plans for the future.",
    mood: "😊",
    color: "#B5D99C",
    location: "Downtown Cafe",
    tags: ["Friends", "Coffee"],
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
  },
  {
    id: 2,
    year: 2024,
    month: "February",
    day: 28,
    title: "Beach Sunset",
    content: "Watched the most breathtaking sunset at the beach. The sky was painted in shades of orange and pink. Felt so peaceful and grateful.",
    mood: "😌",
    color: "#AEE1E1",
    location: "Santa Monica Beach",
    tags: ["Nature", "Peace"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
  },
  {
    id: 3,
    year: 2024,
    month: "January",
    day: 1,
    title: "New Year's Resolution",
    content: "Starting this year with hope and determination. I want to be more present, more grateful, and more adventurous. Here's to new beginnings!",
    mood: "🥳",
    color: "#FFB5E8",
    location: "Home",
    tags: ["Milestone", "Goals"],
    image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80"
  },
  {
    id: 4,
    year: 2023,
    month: "December",
    day: 25,
    title: "Family Christmas",
    content: "The whole family gathered together. Mom made her famous roast, and we exchanged gifts. The kids were so excited. These are the moments that matter most.",
    mood: "❤️",
    color: "#F5A896",
    location: "Parents' House",
    tags: ["Family", "Holiday"],
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80"
  },
  {
    id: 5,
    year: 2023,
    month: "October",
    day: 15,
    title: "Mountain Hiking Adventure",
    content: "Conquered the tallest peak in the region! The view from the top was absolutely worth the climb. Felt alive and free.",
    mood: "😎",
    color: "#FFD56F",
    location: "Rocky Mountains",
    tags: ["Adventure", "Nature"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
  },
  {
    id: 6,
    year: 2023,
    month: "July",
    day: 4,
    title: "First Day at Dream Job",
    content: "Finally started working at the company I've always wanted to join. Nervous but excited. Met amazing people. This is the beginning of something great.",
    mood: "🤗",
    color: "#B8E8D4",
    location: "Tech Tower Office",
    tags: ["Work", "Milestone"],
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80"
  },
  {
    id: 7,
    year: 2023,
    month: "March",
    day: 15,
    title: "Anniversary with Alex",
    content: "Two years together today. Celebrated with a romantic dinner by the lake. So grateful to have found my soulmate.",
    mood: "😍",
    color: "#F5A896",
    location: "Lakeside Restaurant",
    tags: ["Love", "Anniversary"],
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
  },
  {
    id: 8,
    year: 2022,
    month: "November",
    day: 20,
    title: "Graduated!",
    content: "Finally did it! All those years of hard work paid off. Mom cried, Dad was so proud. I'm ready for the next chapter.",
    mood: "🥳",
    color: "#FFB5E8",
    location: "University Campus",
    tags: ["Milestone", "Achievement"],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
  }
]

// Group memories by year
const groupedMemories = memories.reduce((acc, memory) => {
  if (!acc[memory.year]) {
    acc[memory.year] = []
  }
  acc[memory.year].push(memory)
  return acc
}, {} as Record<number, typeof memories>)

const years = Object.keys(groupedMemories).map(Number).sort((a, b) => b - a)

export default function TimelinePage() {
  const [selectedMemory, setSelectedMemory] = useState<typeof memories[0] | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
              <Link href="/dashboard" className="text-sm font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Dashboard
              </Link>
              <Link href="/add-memory" className="text-sm font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Add Memory
              </Link>
              <Link href="/timeline" className="text-sm font-medium text-[#8b6f47] handwritten">
                Timeline
              </Link>
              <Link href="/gallery" className="text-sm font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Gallery
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header - Notebook Style */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="relative">
          {/* Spiral Binding Holes */}
          <div className="absolute -left-8 top-0 flex flex-col gap-12 hidden md:flex">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
            ))}
          </div>
          
          <div className="bg-white shadow-2xl rounded-r-lg border-l-4 border-[#3498db] p-8 relative overflow-hidden">
            {/* Margin Line */}
            <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#3498db]/30" />
            
            {/* Ruled Lines Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 border-b border-[#a8d5e2]" />
              ))}
            </div>
            
            <div className="relative pl-12">
              <h1 className="text-5xl md:text-6xl handwritten font-bold text-[#2c3e50] leading-tight">
                Your Journey
              </h1>
              <p className="text-2xl handwritten text-[#7f8c8d] mt-2">
                A timeline of your beautiful moments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline - Notebook Pages */}
      <div ref={timelineRef} className="container mx-auto px-4 pb-20 max-w-5xl relative">
        {years.map((year, yearIndex) => (
          <div key={year} className="mb-16">
            {/* Year Tab - Like Notebook Divider */}
            <div className="flex items-center mb-12 relative">
              <div className="absolute -left-8 flex flex-col gap-8 hidden md:flex">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white px-8 py-4 rounded-r-xl shadow-xl relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30" />
                <h2 className="text-4xl handwritten font-bold">{year}</h2>
              </div>
            </div>

            {/* Memories for this year - Notebook Entry Style */}
            <div className="space-y-12">
              {groupedMemories[year].map((memory, index) => (
                <div key={memory.id} className="relative">
                  {/* Spiral Binding Holes */}
                  <div className="absolute -left-8 top-8 flex flex-col gap-16 hidden md:flex">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                    ))}
                  </div>
                  
                  {/* Notebook Page */}
                  <div 
                    className="bg-white shadow-xl rounded-r-lg border-l-4 p-8 relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 group"
                    style={{ borderLeftColor: memory.color }}
                    onClick={() => setSelectedMemory(memory)}
                  >
                    {/* Margin Line */}
                    <div 
                      className="absolute left-20 top-0 bottom-0 w-[2px]"
                      style={{ backgroundColor: memory.color + '30' }}
                    />
                    
                    {/* Ruled Lines Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                      ))}
                    </div>
                    
                    <div className="relative pl-16">
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
                            style={{ backgroundColor: memory.color }}
                          >
                            {memory.mood}
                          </div>
                          <div>
                            <h3 className="text-3xl handwritten font-bold text-[#2c3e50] leading-tight">
                              {memory.title}
                            </h3>
                            <p className="text-base handwritten text-[#7f8c8d] mt-1">
                              {memory.month} {memory.day}, {memory.year}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Photo - Taped Effect */}
                      <div className="relative mb-6 inline-block">
                        {/* Tape Effect */}
                        <div className="absolute -top-3 left-8 w-20 h-6 bg-[#fef9f3] opacity-60 shadow-sm rotate-[-5deg] z-10" />
                        <div className="absolute -top-3 right-8 w-20 h-6 bg-[#fef9f3] opacity-60 shadow-sm rotate-[5deg] z-10" />
                        
                        <img
                          src={memory.image}
                          alt={memory.title}
                          className="w-full max-w-2xl rounded-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        />
                      </div>

                      {/* Memory Text */}
                      <p className="text-xl handwritten leading-relaxed text-[#34495e] mb-6 max-w-2xl">
                        {memory.content}
                      </p>

                      {/* Location */}
                      {memory.location && (
                        <div className="flex items-center gap-2 text-base handwritten text-[#7f8c8d] mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{memory.location}</span>
                        </div>
                      )}

                      {/* Tags - Like Sticky Notes */}
                      <div className="flex flex-wrap gap-3">
                        {memory.tags.map((tag, tagIndex) => (
                          <div
                            key={tag}
                            className="px-4 py-2 shadow-md relative group-hover:shadow-lg transition-shadow"
                            style={{ 
                              backgroundColor: memory.color,
                              transform: `rotate(${(tagIndex % 2 === 0 ? 1 : -1) * 2}deg)`
                            }}
                          >
                            <span className="text-sm handwritten font-bold text-white">
                              #{tag}
                            </span>
                            {/* Sticky note fold */}
                            <div 
                              className="absolute bottom-0 right-0 w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px]"
                              style={{ borderBottomColor: memory.color, filter: 'brightness(0.7)' }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Decorative Corner Fold */}
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-[#f5f5f5] border-l-[40px] border-l-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* End of Timeline */}
        <div className="flex items-center justify-center mt-20">
          <div className="bg-white px-8 py-4 rounded-full shadow-xl border-4 border-[#d4b896]">
            <p className="text-lg handwritten text-[#7f8c8d] font-semibold">
              The beginning of your journey ✨
            </p>
          </div>
        </div>
      </div>

      {/* Memory Detail Dialog - Full Notebook Page */}
      <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-4 border-[#d4b896] p-0">
          {selectedMemory && (
            <div className="relative">
              {/* Ruled Lines Background */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                ))}
              </div>

              <div className="relative p-12">
                {/* Margin Line */}
                <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#e74c3c]/20" />
                
                <div className="pl-12">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-xl"
                      style={{ backgroundColor: selectedMemory.color }}
                    >
                      {selectedMemory.mood}
                    </div>
                    <div>
                      <h2 className="text-5xl handwritten font-bold text-[#2c3e50] leading-tight">
                        {selectedMemory.title}
                      </h2>
                      <p className="text-lg handwritten text-[#7f8c8d] mt-2">
                        {selectedMemory.month} {selectedMemory.day}, {selectedMemory.year}
                      </p>
                    </div>
                  </div>

                  {/* Photo with Tape */}
                  <div className="relative mb-8 inline-block">
                    <div className="absolute -top-4 left-12 w-24 h-8 bg-[#fef9f3] opacity-60 shadow-md rotate-[-3deg] z-10" />
                    <div className="absolute -top-4 right-12 w-24 h-8 bg-[#fef9f3] opacity-60 shadow-md rotate-[3deg] z-10" />
                    
                    <img
                      src={selectedMemory.image}
                      alt={selectedMemory.title}
                      className="w-full rounded-sm shadow-2xl"
                    />
                  </div>

                  {/* Content */}
                  <p className="text-2xl handwritten leading-relaxed text-[#34495e] mb-8">
                    {selectedMemory.content}
                  </p>

                  {/* Metadata */}
                  {selectedMemory.location && (
                    <div className="flex items-center gap-2 text-lg handwritten text-[#7f8c8d] mb-6">
                      <MapPin className="w-5 h-5" />
                      <span>{selectedMemory.location}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-4">
                    {selectedMemory.tags.map((tag, tagIndex) => (
                      <div
                        key={tag}
                        className="px-5 py-3 shadow-lg relative"
                        style={{ 
                          backgroundColor: selectedMemory.color,
                          transform: `rotate(${(tagIndex % 2 === 0 ? 1 : -1) * 3}deg)`
                        }}
                      >
                        <span className="text-base handwritten font-bold text-white">
                          #{tag}
                        </span>
                        <div 
                          className="absolute bottom-0 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-b-[16px]"
                          style={{ borderBottomColor: selectedMemory.color, filter: 'brightness(0.7)' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}