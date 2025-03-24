"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/services/api-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await apiService.getSubscription()
        setSubscription(data?.data)
      } catch (error) {
        console.log("No active subscription found")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const handleCancelSubscription = async () => {
    if (!subscription || !subscription._id) return

    try {
      await apiService.cancelSubscription(subscription._id)

      // Update the local state
      setSubscription({
        ...subscription,
        cancellationRequested: true,
      })

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled and will not renew.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>Manage your current subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                <p className="text-lg font-medium">{subscription.planId.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="status-indicator">
                  {subscription.status === "active" ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5 status-indicator-active" />
                      <span className="font-medium status-indicator-active">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5 status-indicator-inactive" />
                      <span className="font-medium status-indicator-inactive">{subscription.status}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
                <p className="text-lg font-medium">
                  {subscription.planId?.price} {subscription?.planId.currency} / {subscription?.planId.billingCycle}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Next Billing Date</h3>
                <p className="text-lg font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                <p className="text-lg font-medium">{subscription.paymentMethod}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="text-lg font-medium">{formatDate(subscription.createdAt)}</p>
              </div>
            </div>

            {subscription.cancellationRequested ? (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Cancellation Requested</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Your subscription has been cancelled and will not renew after the current billing period ends.
                        You will continue to have access until {formatDate(subscription.nextBillingDate)}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="destructive" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>You don&apos;t have an active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Subscribe to a plan to get access to our services.</p>
            <Link href="/dashboard/plans">
              <Button>View Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

