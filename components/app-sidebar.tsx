"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Folder,
  ChartBar,
  SignOut,
  ChartPieSlice
} from "@phosphor-icons/react/dist/ssr"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { navItems, type NavItemId } from "@/lib/data/sidebar"

const navItemIcons: Record<NavItemId, React.ComponentType<{ className?: string }>> = {
  projects: Folder,
  performance: ChartBar,
}

export function AppSidebar({ user }: { user?: { name?: string | null, email?: string | null, image?: string | null } }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    window.location.href = "/login"
  }

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : "U"

  const getHrefForNavItem = (id: NavItemId): string => {
    if (id === "projects") return "/"
    if (id === "performance") return "/performance"
    return "#"
  }

  const isItemActive = (id: NavItemId): boolean => {
    if (id === "projects") {
      return pathname === "/" || pathname.startsWith("/projects")
    }
    return pathname.startsWith(`/${id}`)
  }

  return (
    <Sidebar className="border-border/40 border-r-0 shadow-none border-none">
      <SidebarHeader className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[inset_0_-5px_6.6px_0_rgba(0,0,0,0.25)]">
              <ChartPieSlice className="h-5 w-5" weight="fill" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">R&D Portal</span>
              <span className="text-xs text-muted-foreground truncate">
                Manajerial Dashboard
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0 gap-0 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const href = getHrefForNavItem(item.id)
                const active = isItemActive(item.id)

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="h-10 rounded-xl px-4 font-medium transition-all"
                    >
                      <Link href={href}>
                        {(() => {
                          const Icon = navItemIcons[item.id]
                          return Icon ? <Icon className="h-5 w-5" weight={active ? "fill" : "regular"} /> : null
                        })()}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <Avatar className="h-9 w-9 border border-border shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-sm font-bold truncate">{user?.name || "User"}</span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email || "No email"}</span>
              </div>
              <SignOut className="h-4 w-4 text-muted-foreground shrink-0 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-48 p-1 rounded-xl shadow-xl border-border/60">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg py-2"
              onSelect={handleLogout}
            >
              <SignOut className="h-4 w-4 mr-2" weight="bold" />
              Keluar Sesi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </Sidebar>
  )
}