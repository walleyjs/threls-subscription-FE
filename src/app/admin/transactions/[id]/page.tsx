"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/services/api-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ArrowLeft, Download, CreditCard, User, Clock, CheckCircle, XCircle, AlertCircle, Repeat } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params object
  const { id } = React.use(params)
  const [transaction, setTransaction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setIsLoading(true)
        const data = await apiService.getAdminTransaction(id)
        setTransaction(data.data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transaction details. Please try again.",
          variant: "destructive",
        })
        router.push("/admin/transactions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionDetails()
  }, [id, router, toast])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "pending":
        return <Clock className="h-6 w-6 text-blue-500" />
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "refunded":
        return <Repeat className="h-6 w-6 text-orange-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
        return <Badge className="bg-green-100 text-green-800">Succeeded</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "refunded":
        return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!transaction) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/transactions")} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
        <h1 className="text-3xl font-bold">Transaction Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaction Information</CardTitle>
              <CardDescription>Details of transaction {transaction.invoiceNumber}</CardDescription>
            </div>
            <div className="flex items-center">
              {getStatusIcon(transaction.status)}
              <span className="ml-2">{getStatusBadge(transaction.status)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                <p className="text-lg font-medium break-all">{transaction._id}</p>
              </div>
             
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Number</p>
                <p className="text-lg font-medium">{transaction.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg font-medium">{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-lg font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-lg font-medium capitalize">{transaction.status}</p>
              </div>
            </div>

            {transaction.failureReason && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Transaction Failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{transaction.failureReason}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="text-base font-medium mb-3">Billing Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(transaction.billingPeriodStart)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDate(transaction.billingPeriodEnd)}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-base font-medium mb-3">Payment Method</h3>
              <div className="flex items-center space-x-4">
                <div className="rounded-md border p-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {transaction.paymentMethodDetails.type.replace("_", " ")} ••••{" "}
                    {transaction.paymentMethodDetails.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {transaction.paymentMethodDetails.expiryMonth.toString().padStart(2, "0")}/
                    {transaction.paymentMethodDetails.expiryYear}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
         
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details of the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-md border p-3">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.userId?.firstName || transaction.metadata?.customerName || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.userId?.email || transaction.metadata?.customerEmail || "No email provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Information</CardTitle>
              <CardDescription>Details of the related subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscription ID</p>
                <p className="font-medium break-all">{transaction.subscriptionId._id}</p>
              </div>
              {transaction.subscriptionId && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="font-medium">{transaction.subscriptionId?.planId?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {formatCurrency(transaction.subscriptionId.planId.price)} /{" "}
                      {transaction.subscriptionId.billingCycle}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{transaction.subscriptionId.status}</p>
                  </div>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/admin/subscribers/${transaction.subscriptionId._id}`)}
              >
                View Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

