"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUpWithEmail } from "@/lib/supabase/auth"
import { ChartBar, User, EnvelopeSimple, LockKey, CircleNotch, ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      await signUpWithEmail(email, password, name)
      toast.success("Akun berhasil dibuat! Silakan cek email atau langsung login.")
      router.push("/login")
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
      toast.error(err.message || "Gagal membuat akun")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] bg-card border border-border shadow-2xl rounded-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
            <ChartBar className="h-7 w-7 text-primary" weight="bold" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create New Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join the Project Control Center Team</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-600 text-sm font-medium">
            <LockKey className="h-5 w-5 shrink-0 mt-0.5" weight="fill" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                name="name"
                type="text"
                required
                placeholder="Andri Setyawan"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <div className="relative">
              <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                name="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <div className="relative">
              <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <CircleNotch className="h-5 w-5 animate-spin" weight="bold" />
                <span>Processing...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center flex flex-col gap-3">
          <p className="text-xs text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold relative z-50 px-2 py-1">
              Sign in here
            </Link>
          </p>
          <div className="mt-2 text-center">
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
              Execute, Monitor, and Collaborate in One Secure Hub.<br />
              Authorized access only. All activities are monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
