"use client"

import { useState, useEffect } from "react"
import { BookOpen, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(true)

  useEffect(() => {
    // Check if we have access token from the reset link
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    
    if (!accessToken || type !== 'recovery') {
      setValidToken(false)
      setError("Invalid or expired reset link. Please request a new one.")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: any) {
      console.error("Error resetting password:", error)
      setError(error.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fef9f3] via-[#f8f3ed] to-[#f5ebe0] p-4">
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-[#d4b896]">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-[#8b6f47] mx-auto mb-4" />
            <h1 className="text-2xl handwritten font-bold text-[#2c3e50] mb-4">
              Invalid Reset Link
            </h1>
            <p className="text-sm handwritten text-[#7f8c8d] mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/auth/forgot-password">
              <Button className="w-full">
                Request New Link
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fef9f3] via-[#f8f3ed] to-[#f5ebe0] p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-[#d4b896]">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-[#8b6f47]" />
            <span className="text-4xl handwritten font-bold text-[#8b6f47]">ReLive</span>
          </Link>
          <h1 className="text-3xl handwritten font-bold text-[#2c3e50] mb-2">
            Reset Password
          </h1>
          <p className="text-sm handwritten text-[#7f8c8d]">
            Enter your new password below
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl handwritten font-bold text-[#2c3e50]">
              Password Reset Successful!
            </h2>
            <p className="text-sm handwritten text-[#7f8c8d]">
              Your password has been reset successfully.
            </p>
            <p className="text-xs handwritten text-[#7f8c8d]">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="handwritten text-[#2c3e50] font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-11 pr-11 handwritten bg-[#fef9f3] border-2 border-[#d4b896] focus:border-[#8b6f47] text-[#2c3e50]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-[#2c3e50]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs handwritten text-[#7f8c8d]">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="handwritten text-[#2c3e50] font-semibold">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7f8c8d]" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-11 pr-11 handwritten bg-[#fef9f3] border-2 border-[#d4b896] focus:border-[#8b6f47] text-[#2c3e50]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-[#2c3e50]"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm handwritten text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full h-12 text-lg handwritten font-bold bg-gradient-to-r from-[#8b6f47] to-[#d4a574] hover:from-[#6d5638] hover:to-[#b8895d] shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </div>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Reset Password
                </>
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center pt-4">
              <Link
                href="/auth/login"
                className="text-sm handwritten text-[#8b6f47] hover:text-[#6d5638] transition-colors"
              >
                Remember your password? Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
