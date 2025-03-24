"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { apiService } from "@/services/api-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Trash2, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FeatureManagement } from "@/components/feature-management"

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any>({ monthly: [], yearly: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const { toast } = useToast()

  // Form state
  const [planName, setPlanName] = useState("")
  const [planDescription, setPlanDescription] = useState("")
  const [planPrice, setPlanPrice] = useState("")
  const [planCurrency, setPlanCurrency] = useState("USD")
  const [planBillingCycle, setPlanBillingCycle] = useState("monthly")
  const [trialPeriodDays, setTrialPeriodDays] = useState("0")
  const [displayOrder, setDisplayOrder] = useState("0")
  const [planFeatures, setPlanFeatures] = useState<any[]>([])

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setIsLoading(true)
      const plansData = await apiService.getPlans()
      setPlans(plansData.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form
      if (!planName || !planDescription || !planPrice) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const planData = {
        name: planName,
        description: planDescription,
        price: Number.parseFloat(planPrice),
        currency: planCurrency,
        billingCycle: planBillingCycle,
        trialPeriodDays: Number.parseInt(trialPeriodDays),
        displayOrder: Number.parseInt(displayOrder),
        isActive: true,
        features: planFeatures.map((feature) => ({
          featureId: feature.featureId,
          limitValue: feature.limitValue,
        })),
      }

      await apiService.createPlan(planData)

      toast({
        title: "Success",
        description: "Plan created successfully",
      })

      setIsCreatingPlan(false)
      resetForm()
      fetchPlans()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setPlanName("")
    setPlanDescription("")
    setPlanPrice("")
    setPlanCurrency("USD")
    setPlanBillingCycle("monthly")
    setTrialPeriodDays("0")
    setDisplayOrder("0")
    setPlanFeatures([])
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (isCreatingPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create Subscription Plan</h1>
          <Button variant="outline" onClick={() => setIsCreatingPlan(false)}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleAddPlan}>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Basic, Premium, Pro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planDescription">Description</Label>
                <Textarea
                  id="planDescription"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Brief description of the plan"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="planPrice">Price</Label>
                <Input
                  id="planPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planCurrency">Currency</Label>
                <Select value={planCurrency} onValueChange={setPlanCurrency}>
                  <SelectTrigger id="planCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planBillingCycle">Billing Cycle</Label>
                <Select value={planBillingCycle} onValueChange={setPlanBillingCycle}>
                  <SelectTrigger id="planBillingCycle">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trialPeriodDays">Trial Period (Days)</Label>
                <Input
                  id="trialPeriodDays"
                  type="number"
                  min="0"
                  value={trialPeriodDays}
                  onChange={(e) => setTrialPeriodDays(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                />
              </div>
            </div>

            <FeatureManagement selectedFeatures={planFeatures} onFeaturesChange={setPlanFeatures} />

            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Create Plan
              </Button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <Button onClick={() => setIsCreatingPlan(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="monthly">Monthly Plans</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.monthly.map((plan: any) => (
              <Card key={plan._id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground"> / month</span>
                  </div>

                  {plan.trialPeriodDays > 0 && (
                    <p className="text-center text-sm text-muted-foreground">{plan.trialPeriodDays} days free trial</p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium">Features:</h4>
                      {plan.features.map((feature: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            {feature.name}
                            {feature.limitType !== "boolean" && `: ${feature.limitValue}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.yearly.map((plan: any) => (
              <Card key={plan._id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground"> / year</span>
                  </div>

                  {plan.trialPeriodDays > 0 && (
                    <p className="text-center text-sm text-muted-foreground">{plan.trialPeriodDays} days free trial</p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium">Features:</h4>
                      {plan.features.map((feature: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            {feature.name}
                            {feature.limitType !== "boolean" && `: ${feature.limitValue}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

