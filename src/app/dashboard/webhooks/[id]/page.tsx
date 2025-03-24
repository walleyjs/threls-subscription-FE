"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/services/api-service"
import { WebhookForm } from "@/components/webhook-form"
import type { Webhook } from "@/types/webhook"

export default function EditWebhookPage({ params }: { params: { id: string } }) {
  const [webhook, setWebhook] = useState<Webhook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  useEffect(() => {
    const fetchWebhook = async () => {
      try {
        setIsLoading(true)
        const data = await apiService.getWebhook(id)
        setWebhook(data.data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load webhook details. Please try again.",
          variant: "destructive",
        })
        router.push("/dashboard/webhooks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWebhook()
  }, [id, router, toast])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!webhook) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Webhook</h1>

      <div className="max-w-2xl">
        <WebhookForm
          webhook={webhook}
          onSuccess={() => router.push("/dashboard/webhooks")}
          onCancel={() => router.push("/dashboard/webhooks")}
        />
      </div>
    </div>
  )
}

