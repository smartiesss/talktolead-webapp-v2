"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Select } from "@/components/ui/select"
import { useAlerts, useMarkAlertRead, useMarkAllAlertsRead, useApiError } from "@/lib/api/hooks"
import { transformAlerts } from "@/lib/api/transforms"
import { alerts as dummyAlerts } from "@/data/dummy"
import { Alert } from "@/types"
import { formatRelativeTime } from "@/lib/utils"
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  Loader2,
  UserX,
  Activity,
  Target,
  Wifi,
  CheckCircle,
} from "lucide-react"

// =============================================================================
// Constants
// =============================================================================

const SEVERITY_CONFIG: Record<
  Alert["severity"],
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  critical: {
    label: "Critical",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
  },
  warning: {
    label: "Warning",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertTriangle,
  },
  info: {
    label: "Info",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
  },
}

const TYPE_CONFIG: Record<Alert["type"], { label: string; icon: React.ElementType }> = {
  no_activity: { label: "No Activity", icon: UserX },
  low_activity: { label: "Low Activity", icon: Activity },
  target_missed: { label: "Target Missed", icon: Target },
  device_offline: { label: "Device Offline", icon: Wifi },
}

// =============================================================================
// AlertCard
// =============================================================================

interface AlertCardProps {
  alert: Alert
  onMarkRead: (id: string) => void
  isMarkingRead: boolean
}

function AlertCard({ alert, onMarkRead, isMarkingRead }: AlertCardProps) {
  const severity = SEVERITY_CONFIG[alert.severity]
  const type = TYPE_CONFIG[alert.type]
  const SeverityIcon = severity.icon
  const TypeIcon = type.icon

  return (
    <div
      data-testid="alert-card"
      data-severity={alert.severity}
      data-read={alert.isRead}
      className={`flex items-start gap-4 rounded-lg border p-4 transition-opacity ${
        alert.isRead ? "opacity-60" : "opacity-100"
      } ${severity.bg} ${severity.border}`}
    >
      {/* Severity icon */}
      <div className={`mt-0.5 shrink-0 ${severity.color}`}>
        <SeverityIcon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span data-testid="alert-message" className={`font-medium ${severity.color}`}>
            {alert.message}
          </span>
          <Badge
            data-testid="alert-severity-badge"
            variant={
              alert.severity === "critical"
                ? "destructive"
                : alert.severity === "warning"
                ? "warning"
                : "default"
            }
          >
            {severity.label}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TypeIcon className="h-3 w-3" />
            {type.label}
          </Badge>
          {alert.isRead && (
            <span data-testid="alert-read-indicator" className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              Read
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Avatar name={alert.userName} size="xs" />
            <span data-testid="alert-user-name">{alert.userName}</span>
          </div>
          {alert.details && (
            <span data-testid="alert-details" className="text-muted-foreground">
              {alert.details}
            </span>
          )}
          <span data-testid="alert-time" className="text-xs">
            {formatRelativeTime(alert.createdAt)}
          </span>
        </div>
      </div>

      {/* Mark read action */}
      {!alert.isRead && (
        <Button
          data-testid="mark-read-button"
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead(alert.id)}
          disabled={isMarkingRead}
          className="shrink-0"
          title="Mark as read"
        >
          {isMarkingRead ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span className="sr-only">Mark as read</span>
        </Button>
      )}
    </div>
  )
}

// =============================================================================
// Empty state
// =============================================================================

function EmptyState({ filter }: { filter: string }) {
  return (
    <div data-testid="empty-state" className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-green-50 p-4">
        <Bell className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-foreground">
        {filter === "unread" ? "No unread alerts" : "No alerts"}
      </h3>
      <p className="text-sm text-muted-foreground">
        {filter === "unread"
          ? "All caught up! No unread alerts at the moment."
          : "Your team is all good. No alerts to show."}
      </p>
    </div>
  )
}

// =============================================================================
// Stats bar
// =============================================================================

interface StatsBarProps {
  total: number
  unread: number
  critical: number
  warning: number
}

function StatsBar({ total, unread, critical, warning }: StatsBarProps) {
  return (
    <div data-testid="stats-bar" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-gray-100 p-2">
            <Bell className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p data-testid="stat-total" className="text-xl font-bold">{total}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-blue-50 p-2">
            <Bell className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unread</p>
            <p data-testid="stat-unread" className="text-xl font-bold text-blue-600">{unread}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-red-50 p-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Critical</p>
            <p data-testid="stat-critical" className="text-xl font-bold text-red-600">{critical}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-amber-50 p-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Warnings</p>
            <p data-testid="stat-warning" className="text-xl font-bold text-amber-600">{warning}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Main Page
// =============================================================================

type SeverityFilter = "all" | Alert["severity"]
type ReadFilter = "all" | "unread" | "read"

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")
  const [readFilter, setReadFilter] = useState<ReadFilter>("all")
  const [markingReadId, setMarkingReadId] = useState<string | null>(null)

  const { data: apiAlerts, isLoading, error } = useAlerts()
  const errorMessage = useApiError(error)
  const markReadMutation = useMarkAlertRead()
  const markAllReadMutation = useMarkAllAlertsRead()

  // Use API data or fallback to dummy
  const allAlerts: Alert[] = useMemo(() => {
    if (apiAlerts) {
      return transformAlerts(apiAlerts)
    }
    return dummyAlerts
  }, [apiAlerts])

  // Stats
  const stats = useMemo(
    () => ({
      total: allAlerts.length,
      unread: allAlerts.filter((a) => !a.isRead).length,
      critical: allAlerts.filter((a) => a.severity === "critical").length,
      warning: allAlerts.filter((a) => a.severity === "warning").length,
    }),
    [allAlerts]
  )

  // Filtered list
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      if (severityFilter !== "all" && alert.severity !== severityFilter) return false
      if (readFilter === "unread" && alert.isRead) return false
      if (readFilter === "read" && !alert.isRead) return false
      return true
    })
  }, [allAlerts, severityFilter, readFilter])

  const handleMarkRead = async (id: string) => {
    setMarkingReadId(id)
    try {
      await markReadMutation.mutateAsync(id)
    } finally {
      setMarkingReadId(null)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync()
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Alerts"
        subtitle="Monitor your team's activity and performance issues"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Error banner */}
        {errorMessage && (
          <div
            data-testid="error-banner"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Stats bar */}
        <StatsBar
          total={stats.total}
          unread={stats.unread}
          critical={stats.critical}
          warning={stats.warning}
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Read filter */}
            <Select
              data-testid="read-filter"
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
              className="w-36"
              options={[
                { value: "all", label: "All alerts" },
                { value: "unread", label: "Unread only" },
                { value: "read", label: "Read only" },
              ]}
            />

            {/* Severity filter */}
            <Select
              data-testid="severity-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
              className="w-36"
              options={[
                { value: "all", label: "All severities" },
                { value: "critical", label: "Critical only" },
                { value: "warning", label: "Warnings only" },
                { value: "info", label: "Info only" },
              ]}
            />
          </div>

          {/* Mark all read */}
          {stats.unread > 0 && (
            <Button
              data-testid="mark-all-read-button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="flex items-center gap-2"
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Alert list */}
        {isLoading ? (
          <div data-testid="loading-spinner" className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <EmptyState filter={readFilter} />
        ) : (
          <div data-testid="alert-list" className="space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onMarkRead={handleMarkRead}
                isMarkingRead={markingReadId === alert.id}
              />
            ))}
          </div>
        )}

        {/* Count */}
        {!isLoading && filteredAlerts.length > 0 && (
          <p data-testid="result-count" className="text-center text-sm text-muted-foreground">
            Showing {filteredAlerts.length} of {allAlerts.length} alert
            {allAlerts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  )
}
