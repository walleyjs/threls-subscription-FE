"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/services/api-service"
import { WebhookList } from "@/components/webhook-list"
import type { Webhook } from "@/types/webhook"
import { Plus } from "lucide-react"

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchWebhooks = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getWebhooks()
      setWebhooks(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load webhooks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWebhooks()
  }, [])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <Button onClick={() => router.push("/dashboard/webhooks/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Webhook
        </Button>
      </div>

      <div className="max-w-4xl">
        <p className="text-muted-foreground mb-6">
          Webhooks allow your application to receive real-time notifications when events happen in your account. Each
          webhook can subscribe to specific events and will receive HTTP POST requests when those events occur.
        </p>

        <WebhookList webhooks={webhooks} onUpdate={fetchWebhooks} />
      </div>
    </div>
  )
}

