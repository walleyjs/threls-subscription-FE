"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"

const customerRoutes = [
  "/dashboard",
  "/dashboard/plans",
  "/dashboard/payment-methods",
  "/dashboard/profile",
  "/dashboard/settings",
]

const adminRoutes = ["/admin", "/admin/plans", "/admin/subscribers", "/admin/settings"]

export function RoleBasedRouter({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      // Not logged in, redirect to login
      router.push("/login")
      return
    }

    const isAdminRoute = pathname.startsWith("/admin")
    const isCustomerRoute = pathname.startsWith("/dashboard")


    if (user.role === "ADMIN" || user.role=="SUPER_ADMIN") {

      if (isCustomerRoute) {
        router.push("/admin")
      }
    } else {
      if (isAdminRoute) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  // Show loading state when redirecting
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return children
}

