"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  onDismiss?: (id: string) => void
}

const variantConfig: Record<ToastVariant, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    className: "border-green-200 bg-green-50",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    className: "border-red-200 bg-red-50",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    className: "border-amber-200 bg-amber-50",
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    className: "border-blue-200 bg-blue-50",
  },
}

export function Toast({ id, title, description, variant = "info", onDismiss }: ToastProps) {
  const config = variantConfig[variant]

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
        config.className
      )}
      data-testid="toast"
      data-variant={variant}
    >
      <div className="shrink-0 pt-0.5">{config.icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted">{description}</p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-0.5 hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4 text-muted" />
        </button>
      )}
    </div>
  )
}

export interface ToasterProps {
  toasts: ToastProps[]
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      data-testid="toaster"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
