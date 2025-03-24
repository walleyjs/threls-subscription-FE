"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Trash2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getPaymentMethods();
      setPaymentMethods(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const paymentMethod = {
        details: {
          expiryMonth:expMonth,
          expiryYear:expYear,
          type: "visa",
          cardholderName,
          cvc,
          cardNumber,
        },
       
        type: "card",
        isDefault,
      };

      await apiService.addPaymentMethod(paymentMethod);

      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchPaymentMethods();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await apiService.setDefaultPaymentMethod(methodId);

      setPaymentMethods((prevMethods) =>
        prevMethods.map((method) => ({
          ...method,
          isDefault: method._id === methodId,
        }))
      );

      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to update default payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setCardholderName("");
    setExpMonth("");
    setExpYear("");
    setCvc("");
    setIsDefault(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Payment Method</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a new credit or debit card to your account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPaymentMethod}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expMonth">Exp. Month</Label>
                    <Select
                      value={expMonth}
                      onValueChange={setExpMonth}
                      required
                    >
                      <SelectTrigger id="expMonth">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <SelectItem
                              key={month}
                              value={month.toString().padStart(2, "0")}
                            >
                              {month.toString().padStart(2, "0")}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expYear">Exp. Year</Label>
                    <Select value={expYear} onValueChange={setExpYear} required>
                      <SelectTrigger id="expYear">
                        <SelectValue placeholder="YY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: 10 },
                          (_, i) => new Date().getFullYear() + i
                        ).map((year) => (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked === true)}
                />
                  <Label htmlFor="isDefault" className="text-sm font-medium">
                    Set as default payment method
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Card</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => (
            <Card
              key={method._id}
              className={method.isDefault ? "border-2 border-primary" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {method.details.type}
                  </CardTitle>
                  {method.isDefault && (
                    <div className="flex items-center text-sm font-medium text-primary">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Default
                    </div>
                  )}
                </div>
                <CardDescription>
                  •••• •••• •••• {method.details.last4}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Expires
                    </p>
                    <p>
                      {method.details.expiryMonth}/{method.details.expiryYear}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Added
                    </p>
                    <p>{new Date(method.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSetDefault(method._id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleSetDefault(method._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Payment Methods</CardTitle>
            <CardDescription>
              You haven&apos;t added any payment methods yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add a payment method to subscribe to a plan.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
