"use client"

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, User, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UserMenu() {
  const { user, loading, signOut } = useSupabaseAuth()
  const router = useRouter()

  // Show loading state
  if (loading) {
    return (
      <Button className="handwritten text-sm bg-[#3498db]/50 text-white" disabled>
        Loading...
      </Button>
    )
  }

  // Show login button if not logged in
  if (!user) {
    return (
      <Link href="/auth/login">
        <Button className="handwritten text-sm bg-[#3498db] hover:bg-[#2980b9] text-white">
          Sign In
        </Button>
      </Link>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "User"
  const userInitials = userName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10 border-2 border-[#8b6f47]">
            <AvatarFallback className="bg-[#3498db] text-white handwritten font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none handwritten">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="handwritten cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="handwritten cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="handwritten cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
