"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/services/api-service"
import { type Webhook, WEBHOOK_EVENT_TYPES } from "@/types/webhook"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"

interface WebhookListProps {
  webhooks: Webhook[]
  onUpdate: () => void
}

export function WebhookList({ webhooks, onUpdate }: WebhookListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleStatusToggle = async (webhook: Webhook) => {
    setIsUpdating(webhook._id)
    try {
      await apiService.updateWebhook(webhook._id, {
        ...webhook,
        isActive: !webhook.isActive,
      })
      toast({
        title: "Success",
        description: `Webhook ${webhook.isActive ? "disabled" : "enabled"} successfully`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (webhookId: string) => {
    setIsDeleting(webhookId)
    try {
      await apiService.deleteWebhook(webhookId)
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const getEventLabel = (eventValue: string) => {
    const event = WEBHOOK_EVENT_TYPES.find((e) => e.value === eventValue)
    return event ? event.label : eventValue
  }

  const getStatusBadge = (webhook: Webhook) => {
    if (!webhook.lastStatus) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Not triggered yet
        </Badge>
      )
    }

    const isSuccess = webhook.lastStatus.startsWith("2")

    if (isSuccess) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Success ({webhook.lastStatus})
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="mr-1 h-3 w-3" />
          Failed ({webhook.lastStatus})
        </Badge>
      )
    }
  }

  if (webhooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3">
            <ExternalLink className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No webhooks configured</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You haven&apos;t set up any webhooks yet. Webhooks allow your application to receive real-time updates.
          </p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/webhooks/new")}>
            Create Webhook
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {webhooks.map((webhook) => (
        <Card key={webhook._id} className={webhook.isActive ? "" : "opacity-70"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-base font-medium">{new URL(webhook.url).hostname}</CardTitle>
                {getStatusBadge(webhook)}
              </div>
              <Switch
                checked={webhook.isActive}
                onCheckedChange={() => handleStatusToggle(webhook)}
                disabled={isUpdating === webhook._id}
              />
            </div>
            <CardDescription className="truncate">{webhook.url}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Subscribed Events</h4>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event:any) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {getEventLabel(event)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Created: {formatDate(webhook.createdAt)}</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/webhooks/${webhook._id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this webhook? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(webhook._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting === webhook._id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

