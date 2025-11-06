"use client"

import { useState } from "react"
import { BookOpen, X, Calendar, MapPin, Maximize2, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { UserMenu } from "@/components/UserMenu"

const galleryItems = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    title: "Coffee with Sarah",
    mood: "😊",
    moodLabel: "Happy",
    color: "#B5D99C",
    tags: ["Friends", "Coffee"],
    date: "March 15, 2024",
    location: "Cafe Mocha, Downtown",
    content: "Had the most wonderful conversation about dreams and aspirations. The cafe was cozy and the autumn leaves outside were beautiful.",
    aspectRatio: "tall"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    title: "Beach Sunset",
    mood: "😌",
    moodLabel: "Calm",
    color: "#AEE1E1",
    tags: ["Nature", "Peace"],
    date: "February 28, 2024",
    location: "Malibu Beach, California",
    content: "Watched the most beautiful sunset today. The colors were absolutely breathtaking - oranges, pinks, and purples painting the sky.",
    aspectRatio: "wide"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80",
    title: "New Year's Resolution",
    mood: "🥳",
    moodLabel: "Excited",
    color: "#FFB5E8",
    tags: ["Milestone", "Goals"],
    date: "January 1, 2024",
    location: "Home",
    content: "Starting the new year with excitement and determination. This year is going to be amazing!",
    aspectRatio: "square"
  },
]

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null)
  const [mounted, setMounted] = useState(false)

  useState(() => {
    setMounted(true)
  })

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
          <p className="text-lg handwritten text-[#7f8c8d]">
            Showing {galleryItems.length} {galleryItems.length === 1 ? 'memory' : 'memories'}
          </p>
        </div>

        {/* Polaroid Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
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
                  <img
                    src={item.url}
                    alt={item.title}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      item.aspectRatio === 'tall' ? 'h-80' :
                      item.aspectRatio === 'wide' ? 'h-56' : 'h-72'
                    }`}
                  />
                  
                  {/* Corner Mood Badge */}
                  <div 
                    className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl border-4 border-white group-hover:scale-125 transition-transform duration-300 rotate-12"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.mood}
                  </div>

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
                </div>

                {/* Polaroid Caption Area */}
                <div className="mt-4 space-y-2">
                  <h3 className="text-2xl handwritten font-bold text-[#2c3e50] text-center">
                    {item.title}
                  </h3>
                  <p className="text-sm handwritten text-[#7f8c8d] text-center">
                    {item.date}
                  </p>
                  
                  {/* Location */}
                  {item.location && (
                    <div className="flex items-center justify-center gap-1 text-xs handwritten text-[#7f8c8d]">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {/* Tags with colored borders */}
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs handwritten font-semibold border-2 border-dashed"
                        style={{ 
                          borderColor: item.color,
                          color: item.color
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tape Effect at Top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#fef9f3] opacity-50 shadow-sm rotate-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed View Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#faf5ed]">
          {selectedItem && (
            <div className="relative">
              {/* Image */}
              <div className="w-full h-80 overflow-hidden rounded-t-lg">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Title and Mood */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-4xl handwritten font-bold text-[#2c3e50]">{selectedItem.title}</h2>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-1">{selectedItem.mood}</span>
                    <span className="text-sm handwritten text-[#7f8c8d]">{selectedItem.moodLabel}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[#7f8c8d] mb-3">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg handwritten">{selectedItem.date}</span>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-5 h-5 text-[#8b6f47]" />
                  {selectedItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-[#d4a574]/30 text-[#8b6f47] rounded-full text-sm handwritten font-semibold"
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
