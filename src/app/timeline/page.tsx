"use client"

import { useState } from "react"
import { BookOpen, Calendar, MapPin, Tag, Clock, Heart, Sparkles } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { UserMenu } from "@/components/UserMenu"

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
          <p className="text-xl handwritten text-[#7f8c8d]">
            {memories.length} precious moments captured in time
          </p>
        </div>
      </div>

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
                            src={memory.image}
                            alt={memory.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                  src={selectedMemory.image}
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