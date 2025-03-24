export type WebhookEventType =
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "subscription.renewed"
  | "payment.succeeded"
  | "payment.failed"
  | "payment.refunded"

export interface Webhook {
  _id: string
  userId: string
  url: string
  secret: string
  events: WebhookEventType[]
  isActive: boolean
  lastStatus: string
  lastResponse: string
  failedAttempts: number
  createdAt: string
  updatedAt?: string
}

export const WEBHOOK_EVENT_TYPES: { value: WebhookEventType; label: string }[] = [
  { value: "subscription.created", label: "Subscription Created" },
  { value: "subscription.updated", label: "Subscription Updated" },
  { value: "subscription.canceled", label: "Subscription Canceled" },
  { value: "subscription.renewed", label: "Subscription Renewed" },
  { value: "payment.succeeded", label: "Payment Succeeded" },
  { value: "payment.failed", label: "Payment Failed" },
  { value: "payment.refunded", label: "Payment Refunded" },
]

