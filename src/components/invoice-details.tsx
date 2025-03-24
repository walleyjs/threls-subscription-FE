"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Download, Printer, ArrowLeft } from "lucide-react"

interface InvoiceDetailsProps {
  invoice: any
  onBack: () => void
}

export function InvoiceDetails({ invoice, onBack }: InvoiceDetailsProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  const handleDownload = () => {
    alert("In development")
  }

  return (
    <div className="space-y-6 print:p-10">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Card className="border print:border-0 print:shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <div>
              <CardTitle className="text-2xl">Invoice</CardTitle>
              <CardDescription>Invoice #{invoice?.invoiceNumber}</CardDescription>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold">{invoice?.companyInfo?.name}</h3>
              <p className="text-sm text-muted-foreground">{invoice?.companyInfo?.address?.line1}</p>
              <p className="text-sm text-muted-foreground">
                {invoice?.companyInfo?.address?.city}, {invoice?.companyInfo?.address?.state}{" "}
                {invoice?.companyInfo?.address?.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">{invoice?.companyInfo?.address?.country}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Bill To:</h3>
              <p className="font-medium">{invoice.customerInfo.name}</p>
              <p>{invoice.customerInfo.email}</p>
              <p>{invoice.customerInfo.address.line1}</p>
              <p>
                {invoice.customerInfo.address.city}, {invoice.customerInfo.address.state}{" "}
                {invoice.customerInfo.address.postalCode}
              </p>
              <p>{invoice.customerInfo.address.country}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Invoice Number:</p>
                <p>{invoice.invoiceNumber}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Invoice Date:</p>
                <p>{formatDate(invoice.createdAt)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Payment Date:</p>
                <p>{formatDate(invoice.paidAt)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Status:</p>
                <p className="capitalize font-medium text-green-600">{invoice.status}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Payment Method:</p>
                <p>
                  {invoice.paymentMethod.brand} •••• {invoice.paymentMethod.last4}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-base font-medium">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Description</th>
                    <th className="py-2 text-right font-medium">Quantity</th>
                    <th className="py-2 text-right font-medium">Unit Price</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.amount, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between border-b py-2">
                <p className="font-medium">Subtotal:</p>
                <p>{formatCurrency(invoice.subtotal, invoice.currency)}</p>
              </div>
              <div className="flex justify-between border-b py-2">
                <p className="font-medium">Tax:</p>
                <p>{formatCurrency(invoice.tax, invoice.currency)}</p>
              </div>
              <div className="flex justify-between py-2">
                <p className="text-lg font-bold">Total:</p>
                <p className="text-lg font-bold">{formatCurrency(invoice.total, invoice.currency)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>
              If you have any questions about this invoice, please contact{" "}
              <a href={`mailto:${invoice.companyInfo.email}`} className="text-primary hover:underline">
                {invoice.companyInfo.email}
              </a>
            </p>
            <p className="mt-1">Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

