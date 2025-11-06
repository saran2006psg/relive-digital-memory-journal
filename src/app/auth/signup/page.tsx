"use client"

import { useState } from "react"
import { BookOpen, Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      // Use API route with service role key to bypass email validation
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // User created successfully, now sign them in
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Sign in error after signup:", signInError)
        // User created but login failed - redirect to login page
        alert("✅ Account created! Please log in with your credentials.")
        router.push("/auth/login")
        return
      }

      // Successfully signed in
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      console.error("Signup error:", err)
      
      // Provide helpful error messages
      if (err.message?.includes("already") || err.message?.includes("duplicate")) {
        setError("This email is already registered. Please try logging in instead.")
      } else {
        setError(err.message || "Something went wrong. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundColor: '#ffffff',
      backgroundImage: `
        linear-gradient(90deg, #ffffff 80px, #ffffff 82px, transparent 82px),
        repeating-linear-gradient(0deg, transparent 0px, transparent 34px, rgba(99, 179, 237, 0.25) 34px, rgba(99, 179, 237, 0.25) 35px)
      `,
      backgroundSize: '100% 100%, 100% 35px',
      backgroundRepeat: 'no-repeat, repeat'
    }}>
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
            <div className="p-2 bg-[#fef9f3] rounded-lg group-hover:bg-[#d4b896]/20 transition-colors">
              <BookOpen className="w-8 h-8 text-[#8b6f47]" />
            </div>
            <span className="text-4xl handwritten font-bold text-[#8b6f47]">ReLive</span>
          </Link>
          <p className="text-lg handwritten text-[#7f8c8d] mt-2">Start your journey today</p>
        </div>

        {/* Sign Up Card */}
        <Card className="bg-white shadow-lg rounded-2xl border border-[#d4b896]/30 p-8 relative overflow-hidden">
          <div className="relative">
            <h1 className="text-3xl handwritten font-bold text-[#2c3e50] mb-2">Create Account</h1>
            <p className="text-base handwritten text-[#7f8c8d] mb-8">
              Begin capturing your precious moments
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Name Input */}
              <div>
                <Label htmlFor="name" className="handwritten text-base text-[#2c3e50] mb-2 block">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-11 handwritten text-base border border-[#d4b896] focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 rounded-lg bg-[#fef9f3] transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="handwritten text-base text-[#2c3e50] mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-11 handwritten text-base border border-[#d4b896] focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 rounded-lg bg-[#fef9f3] transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password" className="handwritten text-base text-[#2c3e50] mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-11 handwritten text-base border border-[#d4b896] focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 rounded-lg bg-[#fef9f3] transition-all"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-[#3498db] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <Label htmlFor="confirmPassword" className="handwritten text-base text-[#2c3e50] mb-2 block">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-11 h-11 handwritten text-base border border-[#d4b896] focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 rounded-lg bg-[#fef9f3] transition-all"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-[#3498db] transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base handwritten bg-[#ff9a8b] hover:bg-[#ff8a7a] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d4b896]/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white handwritten text-[#7f8c8d]">or</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="handwritten text-base text-[#7f8c8d]">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-[#ff9a8b] hover:text-[#ff8a7a] font-semibold transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 handwritten text-base text-[#7f8c8d] hover:text-[#8b6f47] transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
