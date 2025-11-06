"use client"

import { useState } from "react"
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        throw error
      }

      // Redirect to dashboard on success
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5e6d3] to-[#e8d5c4] flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#3498db]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#ff9a8b]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#b5d99c]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="w-10 h-10 text-[#8b6f47]" />
            <span className="text-4xl handwritten font-bold text-[#8b6f47]">ReLive</span>
          </Link>
          <p className="text-xl handwritten text-[#7f8c8d]">Welcome back to your memories</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white shadow-2xl rounded-lg border-l-4 border-[#3498db] p-8 relative overflow-hidden">
          {/* Notebook styling */}
          <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-[#3498db]/20" />
          <div className="absolute inset-0 pointer-events-none opacity-5">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-8 border-b border-[#a8d5e2]" />
            ))}
          </div>

          <div className="relative">
            <h1 className="text-3xl handwritten font-bold text-[#2c3e50] mb-2">Sign In</h1>
            <p className="text-lg handwritten text-[#7f8c8d] mb-6">
              Continue your journey through memories
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="handwritten text-lg text-[#2c3e50] mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 handwritten text-lg border-2 border-[#d4b896] focus:border-[#3498db] transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password" className="handwritten text-lg text-[#2c3e50] mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 handwritten text-lg border-2 border-[#d4b896] focus:border-[#3498db] transition-colors"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-[#3498db] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm handwritten text-[#3498db] hover:text-[#2980b9] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg handwritten bg-[#3498db] hover:bg-[#2980b9] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d4b896]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white handwritten text-[#7f8c8d]">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center handwritten text-lg text-[#7f8c8d]">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-[#3498db] hover:text-[#2980b9] font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="handwritten text-lg text-[#7f8c8d] hover:text-[#8b6f47] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
