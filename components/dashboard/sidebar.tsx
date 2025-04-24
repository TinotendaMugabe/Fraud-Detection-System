"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3Icon,
  ShieldAlertIcon,
  HomeIcon,
  ListIcon,
  AlertTriangleIcon,
  SettingsIcon,
  LogOutIcon,
  UsersIcon,
  PlayIcon,
} from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ShieldAlertIcon className="h-6 w-6" />
            <h2 className="text-lg font-semibold tracking-tight">Fraud Detection</h2>
          </Link>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">Overview</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/analytics"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard/analytics" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <BarChart3Icon className="h-4 w-4" />
              Analytics
            </Link>
          </div>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">Fraud Management</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/transactions"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard/transactions" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <ListIcon className="h-4 w-4" />
              Transactions
            </Link>
            <Link
              href="/dashboard/flagged"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard/flagged" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <AlertTriangleIcon className="h-4 w-4" />
              Flagged Transactions
            </Link>
            <Link
              href="/dashboard/rules"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard/rules" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <ShieldAlertIcon className="h-4 w-4" />
              Fraud Rules
            </Link>
            <Link
              href="/dashboard/simulate"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard/simulate" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <PlayIcon className="h-4 w-4" />
              Simulate
            </Link>
          </div>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">Administration</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/users"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard/users" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <UsersIcon className="h-4 w-4" />
              Users
            </Link>
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                pathname === "/dashboard/settings" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>
      <div className="px-4 mt-auto">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
