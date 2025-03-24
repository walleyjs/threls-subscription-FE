"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/services/api-service"
import { type Webhook, WEBHOOK_EVENT_TYPES, type WebhookEventType } from "@/types/webhook"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

interface WebhookFormProps {
  webhook?: Webhook
  onSuccess?: () => void
  onCancel?: () => void
}

export function WebhookForm({ webhook, onSuccess, onCancel }: WebhookFormProps) {
  const [url, setUrl] = useState(webhook?.url || "")
  const [secret, setSecret] = useState(webhook?.secret || "")
  const [showSecret, setShowSecret] = useState(false)
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>(webhook?.events || [])
  const [isActive, setIsActive] = useState(webhook?.isActive !== false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!webhook

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!url) {
      newErrors.url = "URL is required"
    } else {
      try {
        new URL(url)
      } catch (e) {
        newErrors.url = "Please enter a valid URL"
      }
    }

    if (selectedEvents.length === 0) {
      newErrors.events = "At least one event must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateSecret = () => {
    setIsGeneratingSecret(true)
    const randomSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setSecret(randomSecret)
    setIsGeneratingSecret(false)
  }

  const handleEventToggle = (event: WebhookEventType) => {
    setSelectedEvents((prev) => {
      if (prev.includes(event)) {
        return prev.filter((e) => e !== event)
      } else {
        return [...prev, event]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const webhookData = {
        url,
        secret,
        events: selectedEvents,
        isActive,
      }

      if (isEditing && webhook) {
        await apiService.updateWebhook(webhook._id, webhookData)
        toast({
          title: "Success",
          description: "Webhook updated successfully",
        })
      } else {
        await apiService.createWebhook(webhookData)
        toast({
          title: "Success",
          description: "Webhook created successfully",
        })
      }
      

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard/webhooks")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save webhook",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!secret) {
      generateSecret()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Webhook" : "Create Webhook"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your webhook endpoint and event subscriptions"
            : "Set up a webhook to receive real-time notifications for events"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={errors.url ? "border-destructive" : ""}
            />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
            <p className="text-xs text-muted-foreground">
              The URL that will receive webhook events via HTTP POST requests
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="secret">Webhook Secret</Label>
              <Button type="button" variant="outline" size="sm" onClick={generateSecret} disabled={isGeneratingSecret}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isGeneratingSecret ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
            <div className="relative">
              <Input
                id="secret"
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Used to sign webhook payloads so you can verify they came from us
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Events to Subscribe</Label>
              {errors.events && <p className="text-xs text-destructive">{errors.events}</p>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {WEBHOOK_EVENT_TYPES.map((event) => (
                <div key={event.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`event-${event.value}`}
                    checked={selectedEvents.includes(event.value)}
                    onCheckedChange={() => handleEventToggle(event.value)}
                  />
                  <Label htmlFor={`event-${event.value}`} className="text-sm font-normal">
                    {event.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Webhook Active</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/dashboard/webhooks"))}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Webhook"
            ) : (
              "Create Webhook"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

