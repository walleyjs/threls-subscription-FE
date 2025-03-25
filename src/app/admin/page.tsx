"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services/api-service"
import { useToast } from "@/components/ui/use-toast"
import { Users, CreditCard, TrendingUp, AlertCircle } from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    subscriptionPlans: 0,
    pastDueSubscribers:0,
    trialSubscribers:0
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await apiService.getAdminDashboardStats();
       
        setStats(data.data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [toast])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="h-5 w-5" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Subscribers</p>
                <h3 className="stat-value">{stats?.totalSubscribers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="h-5 w-5" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Active Subscribers</p>
                <h3 className="stat-value">{stats?.activeSubscribers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="h-5 w-5" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Inactive Subscribers</p>
                <h3 className="stat-value">{stats?.pastDueSubscribers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-6">
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="h-5 w-5" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Trial Subscribers</p>
                <h3 className="stat-value">{stats?.trialSubscribers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Revenue</p>
                <h3 className="stat-value">${stats.totalRevenue?.toFixed(2)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="stat-card">
              <div className="stat-icon">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Subscription Plans</p>
                <h3 className="stat-value">{stats.subscriptionPlans}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest subscription and payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Coming Soon</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The activity feed will be implemented in the next update. It will include recent subscriptions,
                    cancellations, and payment activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

