"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  UsersRound,
  LogOut,
} from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentUserProfile, signOut, type UserRole } from "@/lib/supabase/auth"

const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { href: "/alumnos", label: "Alumnos", icon: Users, roles: ["admin", "trainer"] },
  { href: "/pagos", label: "Pagos", icon: CreditCard, roles: ["admin"] },
  { href: "/usuarios", label: "Usuarios", icon: UsersRound, roles: ["admin"] },
  { href: "/configuracion", label: "Ajustes", icon: Settings, roles: ["admin"] },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    getCurrentUserProfile().then(profile => {
      if (profile) setRole(profile.role)
    })
  }, [])

  const navItems = allNavItems.filter(item => 
    role && item.roles.includes(role)
  )

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
    router.refresh()
  }

  if (!role) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  )
}
