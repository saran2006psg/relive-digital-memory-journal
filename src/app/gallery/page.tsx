"use client"

import { useState, useEffect } from "react"
import { BookOpen, Filter, X, Calendar, Tag as TagIcon, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const galleryItems = [
  {
    id: 1,
    type: "image",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    title: "Coffee with Sarah",
    mood: "😊",
    color: "#B5D99C",
    tags: ["Friends", "Coffee"],
    year: 2024,
    date: "March 15, 2024",
    aspectRatio: "tall"
  },
  {
    id: 2,
    type: "image",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    title: "Beach Sunset",
    mood: "😌",
    color: "#AEE1E1",
    tags: ["Nature", "Peace"],
    year: 2024,
    date: "February 28, 2024",
    aspectRatio: "wide"
  },
  {
    id: 3,
    type: "image",
    url: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80",
    title: "New Year's Resolution",
    mood: "🥳",
    color: "#FFB5E8",
    tags: ["Milestone", "Goals"],
    year: 2024,
    date: "January 1, 2024",
    aspectRatio: "square"
  },
  {
    id: 4,
    type: "image",
    url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80",
    title: "Family Christmas",
    mood: "❤️",
    color: "#F5A896",
    tags: ["Family", "Holiday"],
    year: 2023,
    date: "December 25, 2023",
    aspectRatio: "wide"
  },
  {
    id: 5,
    type: "image",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    title: "Mountain Hiking",
    mood: "😎",
    color: "#FFD56F",
    tags: ["Adventure", "Nature"],
    year: 2023,
    date: "October 15, 2023",
    aspectRatio: "tall"
  },
  {
    id: 6,
    type: "image",
    url: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80",
    title: "First Day at Work",
    mood: "🤗",
    color: "#B8E8D4",
    tags: ["Work", "Milestone"],
    year: 2023,
    date: "July 4, 2023",
    aspectRatio: "square"
  },
  {
    id: 7,
    type: "image",
    url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    title: "Anniversary Dinner",
    mood: "😍",
    color: "#F5A896",
    tags: ["Love", "Anniversary"],
    year: 2023,
    date: "March 15, 2023",
    aspectRatio: "tall"
  },
  {
    id: 8,
    type: "image",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    title: "Graduation Day",
    mood: "🥳",
    color: "#FFB5E8",
    tags: ["Milestone", "Achievement"],
    year: 2022,
    date: "November 20, 2022",
    aspectRatio: "wide"
  },
  {
    id: 9,
    type: "image",
    url: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=80",
    title: "Road Trip Adventure",
    mood: "😎",
    color: "#FFD56F",
    tags: ["Travel", "Adventure"],
    year: 2023,
    date: "August 12, 2023",
    aspectRatio: "square"
  },
  {
    id: 10,
    type: "image",
    url: "https://images.unsplash.com/photo-1476900164809-ff19b8ae5968?w=800&q=80",
    title: "Peaceful Morning",
    mood: "😌",
    color: "#AEE1E1",
    tags: ["Nature", "Peace"],
    year: 2024,
    date: "February 10, 2024",
    aspectRatio: "tall"
  },
  {
    id: 11,
    type: "image",
    url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80",
    title: "Weekend Getaway",
    mood: "😊",
    color: "#B5D99C",
    tags: ["Travel", "Friends"],
    year: 2023,
    date: "September 5, 2023",
    aspectRatio: "wide"
  },
  {
    id: 12,
    type: "image",
    url: "https://images.unsplash.com/photo-1502741126161-b048400d085d?w=800&q=80",
    title: "Birthday Celebration",
    mood: "🥳",
    color: "#FFB5E8",
    tags: ["Family", "Celebration"],
    year: 2023,
    date: "June 18, 2023",
    aspectRatio: "square"
  }
]

const allTags = Array.from(new Set(galleryItems.flatMap(item => item.tags)))
const allYears = Array.from(new Set(galleryItems.map(item => item.year))).sort((a, b) => b - a)
const moods = ["😊", "😌", "🥳", "❤️", "😎", "🤗", "😍"]

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null)
  const [filterTag, setFilterTag] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterMood, setFilterMood] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredItems = galleryItems.filter(item => {
    if (filterTag !== "all" && !item.tags.includes(filterTag)) return false
    if (filterYear !== "all" && item.year !== parseInt(filterYear)) return false
    if (filterMood !== "all" && item.mood !== filterMood) return false
    return true
  })

  const hasActiveFilters = filterTag !== "all" || filterYear !== "all" || filterMood !== "all"

  const clearFilters = () => {
    setFilterTag("all")
    setFilterYear("all")
    setFilterMood("all")
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
              <Link href="/dashboard" className="text-sm font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Dashboard
              </Link>
              <Link href="/add-memory" className="text-sm font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Add Memory
              </Link>
              <Link href="/timeline" className="text-sm font-medium text-[#8b6f47]/70 hover:text-[#8b6f47] transition-colors">
                Timeline
              </Link>
              <Link href="/gallery" className="text-sm font-medium text-[#8b6f47] handwritten">
                Gallery
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Notebook Page Header */}
        <div className="mb-8 relative">
          {/* Spiral Binding Holes */}
          <div className="absolute -left-8 top-0 flex flex-col gap-12 hidden md:flex">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
            ))}
          </div>
          
          <div className="bg-white shadow-2xl rounded-r-lg border-l-4 border-[#e74c3c] p-8 relative overflow-hidden">
            {/* Margin Line */}
            <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#e74c3c]/30" />
            
            {/* Ruled Lines Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-8 border-b border-[#a8d5e2]" />
              ))}
            </div>
            
            <div className="relative pl-12">
              <h1 className="text-5xl md:text-6xl handwritten font-bold text-[#2c3e50] mb-3 leading-tight">
                Memory Gallery
              </h1>
              <p className="text-xl handwritten text-[#7f8c8d]">
                All your precious moments in one place
              </p>
            </div>
          </div>
        </div>

        {/* Filter Notebook Page */}
        <div className="mb-8 relative">
          <div className="absolute -left-8 top-0 flex flex-col gap-8 hidden md:flex">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
            ))}
          </div>
          
          <div className="bg-white shadow-xl rounded-r-lg border-l-4 border-[#f39c12] p-6 relative overflow-hidden">
            <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#f39c12]/30" />
            
            <div className="relative pl-12">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-6 h-6 text-[#8b6f47]" />
                <h2 className="text-2xl handwritten font-bold text-[#2c3e50]">Filter Memories</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm handwritten font-semibold mb-2 block flex items-center gap-2 text-[#34495e]">
                    <TagIcon className="w-4 h-4" />
                    By Tag
                  </label>
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="bg-[#fef9f3] border-[#d4b896]">
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm handwritten font-semibold mb-2 block flex items-center gap-2 text-[#34495e]">
                    <Calendar className="w-4 h-4" />
                    By Year
                  </label>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="bg-[#fef9f3] border-[#d4b896]">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {allYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm handwritten font-semibold mb-2 block flex items-center gap-2 text-[#34495e]">
                    <Heart className="w-4 h-4" />
                    By Mood
                  </label>
                  <Select value={filterMood} onValueChange={setFilterMood}>
                    <SelectTrigger className="bg-[#fef9f3] border-[#d4b896]">
                      <SelectValue placeholder="All Moods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Moods</SelectItem>
                      {moods.map(mood => (
                        <SelectItem key={mood} value={mood}>
                          <span className="text-xl">{mood}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full handwritten border-[#d4b896] hover:bg-[#fef9f3]"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {filterTag !== "all" && (
                    <span className="px-4 py-2 bg-[#e8c7a8] text-[#5d4e37] rounded-full text-sm handwritten font-semibold flex items-center gap-2 shadow-sm">
                      {filterTag}
                      <button onClick={() => setFilterTag("all")} className="hover:scale-110 transition-transform">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filterYear !== "all" && (
                    <span className="px-4 py-2 bg-[#aee1e1] text-[#2c5f5f] rounded-full text-sm handwritten font-semibold flex items-center gap-2 shadow-sm">
                      {filterYear}
                      <button onClick={() => setFilterYear("all")} className="hover:scale-110 transition-transform">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filterMood !== "all" && (
                    <span className="px-4 py-2 bg-[#ffb5e8] text-[#7d3c6b] rounded-full text-sm handwritten font-semibold flex items-center gap-2 shadow-sm">
                      {filterMood}
                      <button onClick={() => setFilterMood("all")} className="hover:scale-110 transition-transform">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 pl-4">
          <p className="text-base handwritten text-[#7f8c8d]">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'memory' : 'memories'}
          </p>
        </div>

        {/* Polaroid Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
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
                {/* Polaroid Style */}
                <div
                  className="bg-white p-4 pb-16 shadow-2xl cursor-pointer group hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:rotate-0 relative"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Photo */}
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
                  </div>

                  {/* Handwritten Caption */}
                  <div className="mt-4 space-y-2">
                    <h3 className="text-2xl handwritten font-bold text-[#2c3e50] text-center">
                      {item.title}
                    </h3>
                    <p className="text-sm handwritten text-[#7f8c8d] text-center">
                      {item.date}
                    </p>
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

                  {/* Tape Effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#fef9f3] opacity-50 shadow-sm rotate-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white shadow-xl rounded-r-lg border-l-4 border-[#95a5a6] p-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-3xl handwritten font-bold mb-3 text-[#2c3e50]">No memories found</h3>
            <p className="text-xl handwritten text-[#7f8c8d] mb-6">Try adjusting your filters</p>
            <Button onClick={clearFilters} className="handwritten text-lg">Clear All Filters</Button>
          </div>
        )}
      </div>

      {/* Full View Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-white border-4 border-[#d4b896]">
          {selectedItem && (
            <div className="relative">
              <img
                src={selectedItem.url}
                alt={selectedItem.title}
                className="w-full h-auto animate-in zoom-in-95 duration-300"
              />
              <div className="p-8 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">{selectedItem.mood}</span>
                  <div>
                    <h2 className="text-4xl handwritten font-bold text-[#2c3e50]">
                      {selectedItem.title}
                    </h2>
                    <p className="text-lg handwritten text-[#7f8c8d]">{selectedItem.date}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {selectedItem.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-full text-base handwritten font-semibold"
                      style={{ backgroundColor: selectedItem.color + '90', color: '#fff' }}
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