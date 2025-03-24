"use client"

import type React from "react"

import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, PieChart, Settings, Users, CreditCard } from "lucide-react"
import { RoleBasedRouter } from "@/providers/role-based-router"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return null
  }

  return (
    <RoleBasedRouter>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white">
          <div className="flex h-16 items-center px-6">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="mt-6 px-3">
            <Link
              href="/admin"
              className="flex items-center rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <PieChart className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/plans"
              className="mt-2 flex items-center rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <CreditCard className="mr-3 h-5 w-5" />
              Subscription Plans
            </Link>
         
            <Button
              variant="ghost"
              className="mt-6 flex w-full items-center rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </RoleBasedRouter>
  )
}

