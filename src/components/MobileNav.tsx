"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, BookOpen, Home, Plus, Clock, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserMenu } from "@/components/UserMenu"

interface NavLink {
  href: string
  label: string
  icon: React.ReactNode
}

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { href: "/add-memory", label: "Add Memory", icon: <Plus className="w-5 h-5" /> },
  { href: "/timeline", label: "Timeline", icon: <Clock className="w-5 h-5" /> },
  { href: "/gallery", label: "Gallery", icon: <Image className="w-5 h-5" /> },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="md:hidden bg-transparent hover:bg-[#d4a574]/20"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-[#8b6f47]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-[#faf5ed] border-r-4 border-[#d4a574]">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 pt-2">
            <BookOpen className="w-7 h-7 text-[#8b6f47]" />
            <span className="text-3xl handwritten font-bold text-[#8b6f47]">ReLive</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg handwritten font-medium text-[#8b6f47] hover:bg-[#d4a574]/20 transition-colors"
              >
                {link.icon}
                <span className="text-lg">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu at Bottom */}
          <div className="pt-4 border-t border-[#d4a574]/30 mt-auto">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm handwritten text-[#8b6f47]">Account</span>
              <UserMenu />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
