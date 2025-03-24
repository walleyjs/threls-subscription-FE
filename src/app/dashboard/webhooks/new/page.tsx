"use client"

import { useRouter } from "next/navigation"
import { WebhookForm } from "@/components/webhook-form"

export default function NewWebhookPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Webhook</h1>

      <div className="max-w-2xl">
        <WebhookForm
          onSuccess={() => router.push("/dashboard/webhooks")}
          onCancel={() => router.push("/dashboard/webhooks")}
        />
      </div>
    </div>
  )
}

