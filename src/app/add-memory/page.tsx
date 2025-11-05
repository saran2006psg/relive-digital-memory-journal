"use client"

import { useState } from "react"
import { Calendar, MapPin, Image as ImageIcon, Video, X, Save, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const moodEmojis = [
  { emoji: "😊", label: "Happy", color: "#B5D99C" },
  { emoji: "😌", label: "Calm", color: "#8dd3c7" },
  { emoji: "😍", label: "Loved", color: "#ff9a8b" },
  { emoji: "😔", label: "Sad", color: "#A8B5E8" },
  { emoji: "😢", label: "Crying", color: "#9BB5E8" },
  { emoji: "😡", label: "Angry", color: "#E07A5F" },
  { emoji: "😴", label: "Tired", color: "#C8B8DB" },
  { emoji: "🤔", label: "Thoughtful", color: "#3498db" },
  { emoji: "😎", label: "Cool", color: "#FFD56F" },
  { emoji: "🥳", label: "Excited", color: "#FFB5E8" },
  { emoji: "😰", label: "Anxious", color: "#D4A5A5" },
  { emoji: "🤗", label: "Grateful", color: "#B8E8D4" },
]

const tagSuggestions = ["Family", "Friends", "Travel", "Work", "Love", "Adventure", "Food", "Nature"]

export default function AddMemoryPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileUrls = Array.from(files).map(file => URL.createObjectURL(file))
      setUploadedFiles([...uploadedFiles, ...fileUrls])
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate save with animation
    setTimeout(() => {
      setIsSaving(false)
      // Reset form or redirect
      alert("Memory saved! 🎉")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#f5e6d3]">
      {/* Header */}
      <header className="border-b border-[#d4b896] bg-[#faf5ed]/80 backdrop-blur-sm sticky top-0 z-10">
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
              <Link href="/add-memory" className="text-sm handwritten font-semibold text-[#8b6f47]">
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
        {/* Back Button & Title - Notebook Style */}
        <div className="mb-8 relative">
          <div className="absolute -left-8 top-4 flex flex-col gap-8 hidden md:flex">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
            ))}
          </div>

          <div className="bg-white shadow-xl rounded-r-lg border-l-4 border-[#3498db] p-8 relative overflow-hidden">
            <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#3498db]/20" />
            <div className="absolute inset-0 pointer-events-none opacity-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 border-b border-[#a8d5e2]" />
              ))}
            </div>
            
            <div className="relative pl-12">
              <Link href="/dashboard" className="inline-flex items-center gap-2 handwritten text-lg text-[#7f8c8d] hover:text-[#2c3e50] transition-colors mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <h1 className="text-5xl md:text-6xl handwritten font-bold text-[#2c3e50]">
                Capture a Moment
              </h1>
              <p className="text-2xl handwritten text-[#7f8c8d] mt-2">
                Write down your thoughts and preserve this memory forever
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Text Editor */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute -left-8 top-8 flex flex-col gap-16 hidden md:flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                ))}
              </div>

              <div className="bg-white shadow-xl rounded-r-lg border-l-4 border-[#3498db] p-8 relative overflow-hidden">
                <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#3498db]/20" />
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                  ))}
                </div>

                <div className="relative space-y-6 pl-12">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base handwritten font-semibold text-[#2c3e50]">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Give your memory a title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-2xl handwritten font-bold border-0 border-b-2 border-[#d4b896] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#3498db] bg-transparent text-[#2c3e50]"
                    />
                  </div>

                  {/* Date and Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-base handwritten font-semibold flex items-center gap-2 text-[#2c3e50]">
                        <Calendar className="w-4 h-4" />
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="handwritten bg-[#fef9f3] border-[#d4b896]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-base handwritten font-semibold flex items-center gap-2 text-[#2c3e50]">
                        <MapPin className="w-4 h-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="Where were you?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="handwritten bg-[#fef9f3] border-[#d4b896]"
                      />
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-base handwritten font-semibold text-[#2c3e50]">
                      Your Story
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Pour your heart out... What happened? How did you feel?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[300px] resize-none bg-transparent border-[#d4b896] text-xl handwritten leading-relaxed text-[#2c3e50]"
                    />
                    <p className="text-sm handwritten text-[#7f8c8d]">
                      {content.length} characters
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Media & Metadata */}
          <div className="space-y-6">
            {/* Mood Selector */}
            <div className="relative">
              <div className="absolute -left-8 top-8 flex flex-col gap-12 hidden md:flex">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                ))}
              </div>

              <div className="bg-white shadow-xl rounded-r-lg border-l-4 border-[#ff9a8b] p-6 relative overflow-hidden">
                <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#ff9a8b]/20" />
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                  ))}
                </div>

                <div className="relative pl-12">
                  <h3 className="text-2xl handwritten font-bold mb-4 text-[#2c3e50]">How are you feeling?</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {moodEmojis.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.emoji)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-3xl transition-all duration-200 hover:scale-110 ${
                          selectedMood === mood.emoji
                            ? 'ring-2 ring-[#3498db] shadow-md scale-105'
                            : 'hover:bg-[#fef9f3]'
                        }`}
                        style={{
                          backgroundColor: selectedMood === mood.emoji ? mood.color + '40' : 'transparent'
                        }}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                  {selectedMood && (
                    <p className="text-lg handwritten text-center mt-4 text-[#7f8c8d]">
                      Feeling {moodEmojis.find(m => m.emoji === selectedMood)?.label}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="relative">
              <div className="absolute -left-8 top-8 flex flex-col gap-12 hidden md:flex">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                ))}
              </div>

              <div className="bg-white shadow-xl rounded-r-lg border-l-4 border-[#8dd3c7] p-6 relative overflow-hidden">
                <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#8dd3c7]/20" />
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                  ))}
                </div>

                <div className="relative pl-12">
                  <h3 className="text-2xl handwritten font-bold mb-4 text-[#2c3e50]">Tags</h3>
                  
                  {/* Tag Input */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag(tagInput)
                        }
                      }}
                      className="handwritten bg-[#fef9f3] border-[#d4b896]"
                    />
                    <Button
                      onClick={() => handleAddTag(tagInput)}
                      variant="outline"
                      size="sm"
                      className="handwritten"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Tag Suggestions */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tagSuggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="px-3 py-1 text-sm handwritten font-medium rounded-full border-2 border-dashed border-[#d4b896] hover:bg-[#fef9f3] hover:border-[#3498db] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Selected Tags - Sticky Note Style */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {tags.map((tag, index) => {
                        const colors = ['#B5D99C', '#8dd3c7', '#ff9a8b', '#3498db', '#C8B8DB', '#FFD56F']
                        return (
                          <div
                            key={tag}
                            className="px-4 py-2 shadow-md relative"
                            style={{ 
                              backgroundColor: colors[index % colors.length],
                              transform: `rotate(${(index % 2 === 0 ? 1 : -1) * 2}deg)`
                            }}
                          >
                            <span className="text-sm handwritten font-bold text-white">
                              #{tag}
                            </span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 hover:scale-110 transition-transform"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                            {/* Sticky note fold */}
                            <div 
                              className="absolute bottom-0 right-0 w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px]"
                              style={{ borderBottomColor: colors[index % colors.length], filter: 'brightness(0.7)' }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="relative">
              <div className="absolute -left-8 top-8 flex flex-col gap-12 hidden md:flex">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                ))}
              </div>

              <div className="bg-white shadow-xl rounded-r-lg border-l-4 border-[#b5d99c] p-6 relative overflow-hidden">
                <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#b5d99c]/20" />
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="h-8 border-b border-[#a8d5e2]" />
                  ))}
                </div>

                <div className="relative pl-12">
                  <h3 className="text-2xl handwritten font-bold mb-4 text-[#2c3e50]">Photos & Videos</h3>
                  
                  {/* Upload Button */}
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#d4b896] rounded-lg p-8 cursor-pointer hover:border-[#3498db] hover:bg-[#fef9f3] transition-all duration-200">
                    <div className="flex gap-3 mb-2">
                      <ImageIcon className="w-8 h-8 text-[#7f8c8d]" />
                      <Video className="w-8 h-8 text-[#7f8c8d]" />
                    </div>
                    <p className="text-base handwritten text-[#7f8c8d] text-center">
                      Click to upload photos or videos
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Uploaded Files Preview - Polaroid Style */}
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          {/* Tape Effect */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#fef9f3] opacity-60 shadow-sm rotate-[-5deg] z-10" />
                          
                          <div className="relative aspect-square rounded-sm overflow-hidden shadow-md group">
                            <img
                              src={file}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                              className="absolute top-2 right-2 p-1 bg-[#e74c3c] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || !title || !content}
              className="w-full h-16 text-xl handwritten font-bold relative overflow-hidden"
              size="lg"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Memory...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-6 h-6" />
                  Save Memory
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Page Turn Animation Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-[#f5e6d3]/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-80">
            <div className="absolute inset-0 bg-white rounded-lg shadow-2xl animate-page-turn origin-left border-l-4 border-[#3498db]" />
            <div className="absolute inset-0 bg-[#3498db]/10 rounded-lg shadow-2xl animate-page-turn-back origin-left delay-500" />
          </div>
        </div>
      )}
    </div>
  )
}