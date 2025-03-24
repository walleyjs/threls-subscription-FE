"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AlertCircle, CheckCircle, Download, FileText } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceDetails } from "@/components/invoice-details";

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscription data
        try {
          const data = await apiService.getSubscription();
          setSubscription(data.data);
        } catch (error) {
          console.log("No active subscription found");
        }

        // Fetch transaction data
        try {
          setIsTransactionsLoading(true);
          const transactionsData = await apiService.getTransactions();
          setTransactions(transactionsData.data);
        } catch (error) {
          toast({
            title: "Error",
            description:
              "Failed to load transaction history. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsTransactionsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleCancelSubscription = async () => {
    if (!subscription || !subscription._id) return;

    try {
      await apiService.cancelSubscription(subscription._id);

      // Update the local state
      setSubscription({
        ...subscription,
        cancellationRequested: true,
      });

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled and will not renew.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
         setIsInvoiceLoading(true)
         try {
           const invoice = await apiService.getInvoice(invoiceId)
           setSelectedInvoice(invoice.data)
         } catch (error) {
           toast({
             title: "Error",
             description: "Failed to load invoice details. Please try again.",
             variant: "destructive",
           })
         } finally {
           setIsInvoiceLoading(false)
         }
       }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (selectedInvoice) {
         return <InvoiceDetails invoice={selectedInvoice} onBack={() => setSelectedInvoice(null)} />
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
                <p className="text-lg font-medium">
                  {subscription.planId.name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="status-indicator">
                  {subscription.status === "active" ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5 status-indicator-active" />
                      <span className="font-medium status-indicator-active">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5 status-indicator-inactive" />
                      <span className="font-medium status-indicator-inactive">
                        {subscription.status}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
                <p className="text-lg font-medium">
                  {subscription.planId?.price} {subscription?.planId.currency} /{" "}
                  {subscription?.planId.billingCycle}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Next Billing Date
                </h3>
                <p className="text-lg font-medium">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Payment Method
                </h3>
                <p className="text-lg font-medium">
                  {subscription.paymentMethod}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Created At
                </h3>
                <p className="text-lg font-medium">
                  {formatDate(subscription.createdAt)}
                </p>
              </div>
            </div>

            {subscription.cancellationRequested ? (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Cancellation Requested
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Your subscription has been cancelled and will not renew
                        after the current billing period ends. You will continue
                        to have access until{" "}
                        {formatDate(subscription.nextBillingDate)}.
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
            <CardDescription>
              You don&apos;t have an active subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Subscribe to a plan to get access to our services.
            </p>
            <Link href="/dashboard/plans">
              <Button>View Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      
        <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Transaction History</h2>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>View and download your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="loading-spinner"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-medium">{transaction.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>{transaction.failureReason}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-green-100 text-green-800">
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInvoice(transaction._id)}
                              disabled={true}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button disabled={true} variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 p-6 text-center">
                <p className="text-muted-foreground">No transactions found.</p>
                {!subscription && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Subscribe to a plan to see your transaction history.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
