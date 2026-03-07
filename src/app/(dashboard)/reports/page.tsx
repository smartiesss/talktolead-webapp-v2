"use client"

import { useState, useMemo, type ChangeEvent } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import {
  Download, FileText, BarChart3, TrendingUp, Users,
  Mic, Clock, Calendar, Loader2, AlertCircle
} from "lucide-react"
import { useManagerDashboard, useSubordinates, useRecordings, useApiError } from "@/lib/api/hooks"
import { transformDashboard, transformSubordinates, transformRecordings } from "@/lib/api/transforms"
import { teamSummary as dummyTeamSummary, teamMembers as dummyTeamMembers, recordings as dummyRecordings, weeklyActivity } from "@/data/dummy"
import { formatDuration } from "@/lib/utils"

type DateRangeKey = 'week' | 'month' | 'quarter' | 'year'

const DATE_RANGE_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
]

function getDateRangeLabel(key: DateRangeKey): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  let start: Date
  switch (key) {
    case 'week':
      start = new Date(now); start.setDate(now.getDate() - 7); break
    case 'month':
      start = new Date(now); start.setDate(1); break
    case 'quarter':
      start = new Date(now); start.setMonth(Math.floor(now.getMonth() / 3) * 3, 1); break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1); break
    default:
      start = new Date(now); start.setDate(now.getDate() - 7)
  }
  return `${formatter.format(start)} – ${formatter.format(now)}`
}

function downloadCsv(filename: string, rows: string[][]): void {
  const csv = rows.map(r => r.map(cell => JSON.stringify(cell ?? '')).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRangeKey>('week')

  const { data: dashboardData, isLoading: dashLoading, error: dashError } = useManagerDashboard()
  const { data: subordinatesData, isLoading: subLoading } = useSubordinates()
  const { data: recordingsData, isLoading: recLoading } = useRecordings()

  const isLoading = dashLoading || subLoading || recLoading
  const apiError = useApiError(dashError)

  const teamSummary = useMemo(() =>
    dashboardData ? transformDashboard(dashboardData) : dummyTeamSummary,
    [dashboardData]
  )

  const byUser = useMemo(() => {
    if (dashboardData?.by_user && dashboardData.by_user.length > 0) {
      return dashboardData.by_user.map(u => ({
        userId: String(u.user_id),
        userName: u.user_name,
        recordings: u.recordings,
        duration: u.duration,
        contacts: u.contacts,
      }))
    }
    return dummyTeamSummary.byUser
  }, [dashboardData])

  const recordings = useMemo(() =>
    recordingsData && recordingsData.length > 0
      ? transformRecordings(recordingsData)
      : dummyRecordings,
    [recordingsData]
  )

  // Derived metrics
  const avgRecordingsPerUser = teamSummary.activeUsers > 0
    ? Math.round(teamSummary.totalRecordings / teamSummary.activeUsers)
    : 0
  const conversionRate = teamSummary.newContacts > 0 && teamSummary.totalRecordings > 0
    ? Math.round((teamSummary.newContacts / teamSummary.totalRecordings) * 100)
    : 0
  const totalHours = Math.floor(teamSummary.totalDuration / 3600)
  const totalMinutes = Math.floor((teamSummary.totalDuration % 3600) / 60)
  const maxUserRecordings = byUser.length > 0 ? Math.max(...byUser.map(u => u.recordings)) : 1
  const maxBarHeight = Math.max(...weeklyActivity.map(d => d.recordingsCount), 1)

  // CSV export helpers
  function handleActivityExport() {
    const rows = [
      ['Date', 'User', 'Duration (sec)', 'Status', 'Contact', 'Business Cards'],
      ...recordings.map(r => [
        r.recordedAt, r.userName, String(r.duration), r.status,
        r.contactName ?? '', String(r.businessCards.length),
      ])
    ]
    downloadCsv(`activity_report_${dateRange}.csv`, rows)
  }

  function handleTeamExport() {
    const rows = [
      ['User', 'Recordings', 'Total Duration (sec)', 'Contacts'],
      ...byUser.map(u => [u.userName, String(u.recordings), String(u.duration ?? 0), String(u.contacts ?? 0)])
    ]
    downloadCsv(`team_performance_${dateRange}.csv`, rows)
  }

  function handleContactsExport() {
    const uniqueContacts = recordings
      .filter(r => r.contactName)
      .reduce((acc, r) => {
        if (r.contactId && !acc.has(r.contactId)) {
          acc.set(r.contactId, { id: r.contactId, name: r.contactName ?? '', assignee: r.userName })
        }
        return acc
      }, new Map<string, { id: string; name: string; assignee: string }>())
    const rows = [
      ['Contact ID', 'Name', 'Assigned To'],
      ...[...uniqueContacts.values()].map(c => [c.id, c.name, c.assignee])
    ]
    downloadCsv(`contacts_export_${dateRange}.csv`, rows)
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" subtitle="Analytics and exports" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* API Error Banner */}
        {apiError && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span><strong>Note:</strong> Unable to load live data — showing demo data. ({apiError})</span>
          </div>
        )}

        {/* Date Range Selector */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Select
              options={DATE_RANGE_OPTIONS}
              value={dateRange}
              onChange={e => setDateRange((e as ChangeEvent<HTMLSelectElement>).target.value as DateRangeKey)}
              className="w-40"
              aria-label="Date range"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar className="h-4 w-4" />
            <span data-testid="date-range-label">{getDateRangeLabel(dateRange)}</span>
          </div>
          {isLoading && <Loader2 data-testid="loading-spinner" className="h-4 w-4 animate-spin text-muted" />}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Recordings</p>
                  <p className="text-3xl font-bold text-foreground mt-1" data-testid="metric-recordings">
                    {teamSummary.totalRecordings}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+18% vs last {dateRange}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Hours</p>
                  <p className="text-3xl font-bold text-foreground mt-1" data-testid="metric-hours">
                    {totalHours}h {totalMinutes}m
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+12% vs last {dateRange}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Avg. per Salesperson</p>
                  <p className="text-3xl font-bold text-foreground mt-1" data-testid="metric-avg">
                    {avgRecordingsPerUser}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted">
                recordings per person
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">New Contacts</p>
                  <p className="text-3xl font-bold text-foreground mt-1" data-testid="metric-contacts">
                    {teamSummary.newContacts}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+5% vs last {dateRange}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Recording Activity</CardTitle>
              <CardDescription>Daily recordings over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2" data-testid="activity-chart">
                {weeklyActivity.map((day) => {
                  const height = (day.recordingsCount / maxBarHeight) * 100

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <span className="text-xs text-muted">{day.recordingsCount}</span>
                        <div
                          className="w-full bg-primary rounded-t-md transition-all"
                          style={{ height: `${height * 2}px` }}
                          data-testid={`bar-${day.date}`}
                        />
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Recordings by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="team-performance">
                {byUser.slice(0, 6).map((user, index) => {
                  const percentage = maxUserRecordings > 0
                    ? (user.recordings / maxUserRecordings) * 100
                    : 0

                  return (
                    <div key={user.userId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{user.userName}</span>
                        <span className="text-muted">{user.recordings} recordings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-primary/60'}`}
                          style={{ width: `${percentage}%` }}
                          data-testid={`perf-bar-${user.userId}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Reports
            </CardTitle>
            <CardDescription>Download detailed reports as CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Activity Report */}
              <div className="p-4 border border-border rounded-lg hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Activity Report</h3>
                    <p className="text-sm text-muted mt-1">
                      Detailed breakdown of all recordings and activity
                    </p>
                  </div>
                  <Badge variant="outline">CSV</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={handleActivityExport}
                  data-testid="export-activity"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Team Performance */}
              <div className="p-4 border border-border rounded-lg hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Team Performance</h3>
                    <p className="text-sm text-muted mt-1">
                      Individual metrics and comparisons
                    </p>
                  </div>
                  <Badge variant="outline">CSV</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={handleTeamExport}
                  data-testid="export-team"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Contacts Export */}
              <div className="p-4 border border-border rounded-lg hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Contacts Export</h3>
                    <p className="text-sm text-muted mt-1">
                      All contacts with full details
                    </p>
                  </div>
                  <Badge variant="outline">CSV</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={handleContactsExport}
                  data-testid="export-contacts"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
