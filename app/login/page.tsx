"use client"

import { useState } from "react"
import { signInWithEmail } from "@/lib/supabase/auth"
import { useRouter } from "next/navigation"
import { ChartBar, LockKey, EnvelopeSimple, CircleNotch } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signInWithEmail(email, password)
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Email atau Password salah. Silakan coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
      {/* Background Decor (Opsional agar terlihat elegan) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[400px] bg-card border border-border shadow-2xl rounded-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
            <ChartBar className="h-7 w-7 text-primary" weight="bold" />
          </div>
          <div className="mb-2 px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded-full border border-primary/20">
            Internal Access Only
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Project Control Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Secure access for internal project operations</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-600 text-sm font-medium">
            <LockKey className="h-5 w-5 shrink-0 mt-0.5" weight="fill" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <div className="relative">
              <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <span>Verifying...</span>
              </>
            ) : (
              "Sign In to System"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Don’t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-bold relative z-50 px-2 py-1">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            Execute, Monitor, and Collaborate in One Secure Hub.<br />
            Authorized access only. All activities are monitored.
          </p>
        </div>
      </div>
    </div>
  )
}