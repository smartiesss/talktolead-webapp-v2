"use client"

import * as React from "react"
import { ToastProps, ToastVariant, Toaster } from "@/components/ui/toast"

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: ToastProps[]
  toast: (input: ToastInput) => string
  dismiss: (id: string) => void
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

let counter = 0
function generateId() {
  return `toast-${++counter}`
}

const DEFAULT_DURATION = 4000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const toast = React.useCallback(
    ({ title, description, variant = "info", duration = DEFAULT_DURATION }: ToastInput): string => {
      const id = generateId()
      const newToast: ToastProps = { id, title, description, variant, duration }
      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id)
        }, duration)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [dismiss]
  )

  const success = React.useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "success" }),
    [toast]
  )
  const error = React.useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "error" }),
    [toast]
  )
  const warning = React.useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "warning" }),
    [toast]
  )
  const info = React.useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "info" }),
    [toast]
  )

  // Cleanup all timers on unmount
  React.useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const value: ToastContextValue = { toasts, toast, dismiss, success, error, warning, info }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}



const noOpContext: ToastContextValue = {
  toasts: [],
  toast: () => "",
  dismiss: () => {},
  success: () => "",
  error: () => "",
  warning: () => "",
  info: () => "",
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    // Graceful degradation when rendered outside ToastProvider (e.g. tests, Storybook)
    if (process.env.NODE_ENV === "development") {
      console.warn("[useToast] used outside ToastProvider — falling back to no-op")
    }
    return noOpContext
  }
  return ctx
}
