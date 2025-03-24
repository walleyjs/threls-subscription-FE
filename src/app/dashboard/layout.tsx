"use client"

import type React from "react"

import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, Home, LogOut, Settings, User } from "lucide-react"
import { RoleBasedRouter } from "@/providers/role-based-router"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <RoleBasedRouter>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white">
          <div className="flex h-16 items-center px-6">
            <h1 className="text-xl font-bold">Subscription App</h1>
          </div>
          <nav className="mt-6 px-3">
            <Link
              href="/dashboard"
              className="flex items-center rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/plans"
              className="mt-2 flex items-center rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <CreditCard className="mr-3 h-5 w-5" />
              Plans
            </Link>
            <Link
              href="/dashboard/payment-methods"
              className="mt-2 flex items-center rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <CreditCard className="mr-3 h-5 w-5" />
              Payment Methods
            </Link>
            <Link
              href="/dashboard/settings"
              className="mt-2 flex items-center rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
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
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </RoleBasedRouter>
  )
}

