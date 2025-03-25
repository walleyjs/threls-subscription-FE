"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SubscriberDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [subscriber, setSubscriber] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriberDetails = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getSubscriberDetails(id);
        console.log("da", data.data);
        setSubscriber(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load subscriber details. Please try again.",
          variant: "destructive",
        });
        router.push("/admin/subscribers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriberDetails();
  }, [id, router, toast]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "trial":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            Trial
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Canceled
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Past Due
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!subscriber) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/subscribers")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subscribers
        </Button>
        <h1 className="text-3xl font-bold">Subscriber Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-lg font-medium">
                  {subscriber.userId.firstName} {subscriber.userId.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-lg font-medium">{subscriber.userId.email}</p>
              </div>
              {subscriber.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-lg font-medium">
                    {subscriber.userId.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Customer Since
                </p>
                <p className="text-lg font-medium">
                  {formatDate(subscriber.userId.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Current subscription information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="mt-1">{getStatusBadge(subscriber.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Plan
                </p>
                <p className="text-lg font-medium">{subscriber.planId.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price
                </p>
                <p className="text-lg font-medium">
                  {formatCurrency(subscriber.planId.price)} /{" "}
                  {subscriber.planId.billingCycle}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Started On
                </p>
                <p className="text-lg font-medium">
                  {formatDate(subscriber.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Period
                </p>
                <p className="text-lg font-medium">
                  {formatDate(subscriber.currentPeriodStart)} -{" "}
                  {formatDate(subscriber.currentPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Next Billing
                </p>
                <p className="text-lg font-medium">
                  {formatDate(subscriber.currentPeriodEnd)}
                </p>
              </div>
            </div>

            {subscriber.canceledAt && (
              <div className="mt-4 rounded-md bg-orange-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Subscription Canceled
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>
                        This subscription was canceled on{" "}
                        {formatDate(subscriber.canceledAt)} and will end on{" "}
                        {formatDate(subscriber.currentPeriodEnd)}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent payment transaction</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriber.lastTransactionId && subscriber.status !== "trial" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow key={subscriber.lastTransactionId._id}>
                  <TableCell>
                    {formatDate(subscriber.lastTransactionId.createdAt)}
                  </TableCell>
                  <TableCell>
                    {subscriber.lastTransactionId.description}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      subscriber.lastTransactionId.amount,
                      subscriber.lastTransactionId.currency
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        subscriber.lastTransactionId.status === "succeeded"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {subscriber.lastTransactionId.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No transactions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
