"use client"

import { useState, useEffect } from "react"
import { BookOpen, Calendar, Image, Clock, Sparkles, ArrowRight, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Calendar,
    title: "Daily Journal",
    description: "Write your thoughts and feelings in a beautiful digital diary",
    color: "#3498db",
    href: "/add-memory"
  },
  {
    icon: Clock,
    title: "Timeline View",
    description: "Journey through your memories in a visual timeline",
    color: "#8dd3c7",
    href: "/timeline"
  },
  {
    icon: Image,
    title: "Photo Gallery",
    description: "Browse all your photos and videos in one beautiful place",
    color: "#b5d99c",
    href: "/gallery"
  },
  {
    icon: Heart,
    title: "Mood Tracking",
    description: "Track your emotions and see your emotional journey",
    color: "#ff9a8b",
    href: "/dashboard"
  }
]

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5e6d3]">
      {/* Header */}
      <header className="border-b border-[#d4b896] bg-[#faf5ed]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#8b6f47]" />
              <span className="text-2xl handwritten font-bold text-[#8b6f47]">ReLive</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="handwritten">Dashboard</Button>
              </Link>
              <Link href="/add-memory">
                <Button className="handwritten">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Notebook Page Style */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div 
            className={`relative transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Spiral Binding Holes */}
            <div className="absolute -left-8 top-20 flex flex-col gap-16 hidden md:flex">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
              ))}
            </div>

            {/* Main Notebook Page */}
            <div className="bg-white shadow-2xl rounded-r-lg border-l-4 border-[#3498db] p-12 md:p-16 relative overflow-hidden">
              {/* Margin Line */}
              <div className="absolute left-20 top-0 bottom-0 w-[2px] bg-[#3498db]/30" />
              
              {/* Ruled Lines Background */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="h-10 border-b border-[#a8d5e2]" />
                ))}
              </div>

              <div className="relative text-center pl-8">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3498db]/10 text-[#3498db] handwritten text-lg font-semibold mb-6">
                  <Sparkles className="w-5 h-5" />
                  Your Personal Memory Keeper
                </div>
                <h1 className="text-5xl md:text-7xl handwritten font-bold text-[#2c3e50] mb-6 leading-tight">
                  Relive Your
                  <span className="block text-[#3498db] mt-2">Beautiful Moments</span>
                </h1>
                <p className="text-2xl md:text-3xl handwritten text-[#7f8c8d] mb-10 leading-relaxed max-w-3xl mx-auto">
                  A nostalgic digital diary where memories come alive. Write, capture, and cherish every precious moment of your life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/add-memory">
                    <Button size="lg" className="handwritten text-xl h-16 px-10">
                      Start Writing
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="handwritten text-xl h-16 px-10">
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image - Polaroid Style */}
          <div 
            className={`mt-12 transition-all duration-1000 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative max-w-3xl mx-auto">
              {/* Tape Effect */}
              <div className="absolute -top-4 left-1/4 w-32 h-8 bg-[#fef9f3] opacity-60 shadow-md rotate-[-5deg] z-10" />
              <div className="absolute -top-4 right-1/4 w-32 h-8 bg-[#fef9f3] opacity-60 shadow-md rotate-[5deg] z-10" />
              
              <img
                src="https://images.unsplash.com/photo-1513001900722-370f803f498d?w=1200&q=80"
                alt="Vintage journal and memories"
                className="w-full rounded-sm shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Notebook Cards */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Section Header - Notebook Page */}
          <div className="relative mb-16">
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
              
              <div className="relative pl-12 text-center">
                <h2 className="text-5xl handwritten font-bold text-[#2c3e50] mb-2">
                  Everything You Need
                </h2>
                <p className="text-2xl handwritten text-[#7f8c8d]">
                  Powerful features wrapped in a warm, nostalgic design
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={`transition-all duration-700 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="relative">
                  <div className="absolute -left-8 top-8 flex flex-col gap-12 hidden md:flex">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
                    ))}
                  </div>

                  <div 
                    className="bg-white shadow-lg rounded-r-lg p-8 h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-l-4 relative overflow-hidden"
                    style={{ borderLeftColor: feature.color }}
                  >
                    {/* Margin Line */}
                    <div className="absolute left-16 top-0 bottom-0 w-[2px]" style={{ backgroundColor: feature.color + '20' }} />
                    
                    {/* Ruled Lines */}
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 border-b border-[#a8d5e2]" />
                      ))}
                    </div>

                    <div className="relative pl-12">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md"
                        style={{ backgroundColor: feature.color + '40' }}
                      >
                        <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                      </div>
                      <h3 className="text-3xl handwritten font-bold mb-3 text-[#2c3e50]">{feature.title}</h3>
                      <p className="text-xl handwritten text-[#7f8c8d] mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2 handwritten text-lg font-semibold" style={{ color: feature.color }}>
                        Explore
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -left-8 top-12 flex flex-col gap-16 hidden md:flex">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[#d4b896] shadow-inner" />
              ))}
            </div>

            <div className="bg-white shadow-2xl rounded-r-lg border-l-4 border-[#3498db] p-12 md:p-16 relative overflow-hidden">
              <div className="absolute left-20 top-0 bottom-0 w-[2px] bg-[#3498db]/20" />
              <div className="absolute inset-0 pointer-events-none opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="h-10 border-b border-[#a8d5e2]" />
                ))}
              </div>

              <div className="relative text-center pl-8">
                <h2 className="text-4xl md:text-5xl handwritten font-bold text-[#2c3e50] mb-4">
                  Your Story Deserves to be Remembered
                </h2>
                <p className="text-2xl handwritten text-[#7f8c8d] mb-8 max-w-2xl mx-auto">
                  Every moment is precious. Start preserving your memories today and create a digital legacy you'll treasure forever.
                </p>
                <Link href="/add-memory">
                  <Button size="lg" className="handwritten text-xl h-16 px-10">
                    Create Your First Memory
                    <Sparkles className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#d4b896] bg-[#faf5ed]/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8b6f47]" />
              <span className="text-xl handwritten font-bold text-[#8b6f47]">ReLive</span>
            </div>
            <p className="handwritten text-lg text-[#7f8c8d]">
              Made with ❤️ for preserving beautiful memories
            </p>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="handwritten text-base text-[#7f8c8d] hover:text-[#2c3e50] transition-colors">
                Dashboard
              </Link>
              <Link href="/timeline" className="handwritten text-base text-[#7f8c8d] hover:text-[#2c3e50] transition-colors">
                Timeline
              </Link>
              <Link href="/gallery" className="handwritten text-base text-[#7f8c8d] hover:text-[#2c3e50] transition-colors">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}