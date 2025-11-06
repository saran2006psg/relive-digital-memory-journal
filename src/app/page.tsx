"use client"

import { useState, useEffect } from "react"
import { BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Typewriter } from "@/components/ui/typewriter"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/notebook-pattern.svg')] opacity-5" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="container mx-auto h-full relative">
          <div className="absolute inset-0 flex flex-col justify-start pt-32">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-12 border-b border-[#d4b896]/20" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center pl-8">
          <h1 className="text-6xl md:text-8xl handwritten font-extrabold text-[#2c3e50] mb-8 leading-tight">
            ReLive
          </h1>

          <div className="text-3xl md:text-4xl handwritten text-[#7f8c8d] mb-16 leading-relaxed min-h-[120px] flex items-center justify-center">
            {mounted ? (
              <Typewriter
                text={[
                  "Where your memories come alive again.",
                  "Capture every precious moment.",
                  "Your story, beautifully preserved.",
                  "Relive the moments that matter."
                ]}
                speed={80}
                deleteSpeed={50}
                waitTime={3000}
                loop={true}
                className="text-3xl md:text-4xl handwritten text-[#7f8c8d]"
                cursorChar="|"
                cursorClassName="text-[#3498db]"
              />
            ) : (
              <span>Where your memories come alive again.</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/auth/login">
              <Button 
                size="lg" 
                className="handwritten text-xl bg-[#88aaee] hover:bg-[#88aaee] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Start Your Journey
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-[#8b6f47]/60 handwritten text-lg">
            Begin capturing your beautiful moments today
          </p>
        </div>
      </div>
    </div>
  )
}
