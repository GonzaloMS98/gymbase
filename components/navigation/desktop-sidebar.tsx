"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Dumbbell,
  UsersRound,
  LogOut,
} from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentUserProfile, signOut, type UserRole, type UserProfile } from "@/lib/supabase/auth"
import { Button } from "@/components/ui/button"

const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { href: "/alumnos", label: "Alumnos", icon: Users, roles: ["admin", "trainer"] },
  { href: "/pagos", label: "Pagos", icon: CreditCard, roles: ["admin"] },
  { href: "/usuarios", label: "Usuarios", icon: UsersRound, roles: ["admin"] },
  { href: "/configuracion", label: "Configuracion", icon: Settings, roles: ["admin"] },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    getCurrentUserProfile().then(setProfile)
  }, [])

  const navItems = allNavItems.filter(item => 
    profile && item.roles.includes(profile.role)
  )

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
    router.refresh()
  }

  if (!profile) return null

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dumbbell className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          Yokai Gym
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {profile.fullName?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile.fullName || profile.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile.role === "admin" ? "Administrador" : "Entrenador"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesion
        </Button>
      </div>
    </aside>
  )
}
