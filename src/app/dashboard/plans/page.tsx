"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/services/api-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Check, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { PlanComparison } from "@/components/plan-comparison"

export default function PlansPage() {
  const [plans, setPlans] = useState<any>({ monthly: [], yearly: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [defaultTab, setDefaultTab] = useState("monthly")
  const [activeTab, setActiveTab] = useState(defaultTab)
  const { toast } = useToast()
  const router = useRouter()


  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansData = await apiService.getPlans()
        setPlans(plansData?.data)

        try {
         const subscription = await apiService.getSubscription()
         if (subscription.data && subscription.data.planId) {
           setCurrentPlan(subscription?.data.planId._id)

          
           if (subscription.data.planId?.billingCycle === "yearly") {
             setDefaultTab("yearly")
           }
         }
       } catch (error) {
        
         console.log("No active subscription found")
       }

        const paymentMethodsData = await apiService.getPaymentMethods()
        setPaymentMethods(paymentMethodsData?.data)

        const defaultMethod = paymentMethodsData.data.find((method: { isDefault: boolean }) => method.isDefault)
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod._id)
        }
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

    fetchData()
  }, [toast])

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a plan and payment method",
        variant: "destructive",
      })
      return
    }


    if (currentPlan === selectedPlan) {
         toast({
           title: "Info",
           description: "You are already subscribed to this plan",
         })
         return
       }

    try {
      await apiService.createSubscription(selectedPlan, selectedPaymentMethod)

      toast({
        title: "Success",
        description: "You have successfully subscribed to the plan",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe to the plan. Please try again.",
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
      <h1 className="text-3xl font-bold">Subscription Plans</h1>

      <Tabs defaultValue={defaultTab} className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.monthly.map((plan: any) => (
             <Card
                key={plan._id}
                className={`subscription-card ${selectedPlan === plan._id ? "selected" : ""} ${currentPlan === plan._id ? "border-2 border-primary bg-primary/5" : ""}`}
              >
                {selectedPlan === plan._id && <div className="subscription-badge">Selected</div>}
                {currentPlan === plan._id && <div className="subscription-badge bg-green-600">Current Plan</div>}
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

                  <div className="space-y-2">
                    {plan.features.map((feature: any) => (
                      <div key={feature.id} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {feature.name}
                          {typeof feature.value !== "boolean" && `: ${feature.value}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedPlan(plan._id)}
                    variant={selectedPlan === plan._id ? "default" : currentPlan === plan._id ? "secondary" : "outline"}
                    disabled={currentPlan === plan._id}
                  >
                   {currentPlan === plan._id ? "Current Plan" : selectedPlan === plan._id ? "Selected" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.yearly.map((plan: any) => (
              <Card
              key={plan._id}
              className={`subscription-card ${selectedPlan === plan._id ? "selected" : ""} ${currentPlan === plan._id ? "border-2 border-primary bg-primary/5" : ""}`}
            >
              {selectedPlan === plan._id && <div className="subscription-badge">Selected</div>}
              {currentPlan === plan._id && <div className="subscription-badge bg-green-600">Current Plan</div>}
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

                  <div className="space-y-2">
                    {plan.features.map((feature: any) => (
                      <div key={feature.id} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {feature.name}
                          {typeof feature.value !== "boolean" && `: ${feature.value}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedPlan(plan._id)}
                    variant={selectedPlan === plan._id ? "default" : currentPlan === plan._id ? "secondary" : "outline"}
                    disabled={currentPlan === plan._id}
                  >
                    {selectedPlan === plan._id ? "Selected" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Plan Comparison</h2>
        <Card>
          <CardContent className="p-0 overflow-hidden">
          {activeTab === "monthly" ? (
              <PlanComparison plans={plans.monthly} currentPlanId={currentPlan} />
            ) : (
              <PlanComparison plans={plans.yearly} currentPlanId={currentPlan} />
            )}
          </CardContent>
        </Card>
      </div>

      {selectedPlan && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold">Select Payment Method</h2>

          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {paymentMethods.map((method) => (
                  <Card
                    key={method._id}
                    className={`cursor-pointer ${selectedPaymentMethod === method._id ? "border-2 border-primary" : ""}`}
                    onClick={() => setSelectedPaymentMethod(method._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                        <div className="flex items-center">
                        <p className="font-medium">
                            {method?.details?.type} •••• {method?.details?.last4}
                          </p>
                        </div>
                        
                          <p className="text-sm text-muted-foreground">
                            Expires {method.details?.expiryMonth}/{method?.details?.expiryYear}
                          </p>
                          {method.isDefault && (
                              <span className="ml-2 inline-flex items-center text-xs font-medium text-primary">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Default
                              </span>
                            )}
                        </div>
                        {selectedPaymentMethod === method._id && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button onClick={handleSubscribe} disabled={!selectedPaymentMethod}>
                Subscribe Now
              </Button>
            </div>
          ) : (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No Payment Methods</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You need to add a payment method before subscribing.</p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => router.push("/dashboard/payment-methods")}>
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

