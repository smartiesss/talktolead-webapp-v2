"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { 
  Search, Plus, ChevronRight, Users, UserCheck, UserX, 
  Mic, Clock, AlertTriangle, Loader2
} from "lucide-react"
import { useSubordinates, useManagerDashboard, useApiError } from "@/lib/api/hooks"
import { transformSubordinates, transformAlerts } from "@/lib/api/transforms"
import { teamMembers, teamSummary, alerts as dummyAlerts, getRecordingsByUser, getContactsByUser } from "@/data/dummy"
import { User } from "@/types"
import { formatRelativeTime, formatDuration } from "@/lib/utils"
import Link from "next/link"

type TeamMemberWithActivity = User & {
  recordings: number
  duration: number
  contacts: number
  activityLevel: 'high' | 'medium' | 'low' | 'none'
  hasAlert: boolean
}

const columns: ColumnDef<TeamMemberWithActivity>[] = [
  {
    accessorKey: "name",
    header: "Team Member",
    cell: ({ row }) => {
      const activityColors = {
        high: 'bg-green-500',
        medium: 'bg-amber-500',
        low: 'bg-red-500',
        none: 'bg-gray-400',
      }
      
      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={row.original.name} size="md" />
            <div 
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                activityColors[row.original.activityLevel as keyof typeof activityColors]
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{row.original.name}</p>
              {row.original.hasAlert && (
                <AlertTriangle className="h-4 w-4 text-accent" />
              )}
            </div>
            <p className="text-xs text-muted">{row.original.email}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant={row.original.status === 'active' ? 'success' : 'warning'}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "recordings",
    header: "Recordings (Week)",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mic className="h-4 w-4 text-muted" />
        <span className="font-medium text-foreground">{row.original.recordings}</span>
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration (Week)",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted" />
        <span className="text-foreground">{formatDuration(row.original.duration)}</span>
      </div>
    ),
  },
  {
    accessorKey: "contacts",
    header: "Contacts",
    cell: ({ row }) => (
      <span className="text-foreground">{row.original.contacts}</span>
    ),
  },
  {
    accessorKey: "lastActiveAt",
    header: "Last Active",
    cell: ({ row }) => (
      <span className="text-sm text-muted">
        {formatRelativeTime(row.original.lastActiveAt)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/team/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
]

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activityFilter, setActivityFilter] = useState("all")

  // Fetch real data
  const { data: subordinatesData, isLoading, error } = useSubordinates()
  const { data: dashboardData } = useManagerDashboard()
  const apiError = useApiError(error)

  // Transform or use dummy data
  const members = useMemo(() => {
    if (subordinatesData && subordinatesData.length > 0) {
      return transformSubordinates(subordinatesData)
    }
    return teamMembers
  }, [subordinatesData])

  const alerts = useMemo(() => {
    if (dashboardData?.alerts) {
      return transformAlerts(dashboardData.alerts)
    }
    return dummyAlerts
  }, [dashboardData])

  // Add activity data to team members
  const teamMembersWithActivity: TeamMemberWithActivity[] = useMemo(() => {
    return members.map((member) => {
      // Try to get summary from API data first
      const summary = dashboardData?.by_user?.find(u => String(u.user_id) === member.id)
      
      // Fallback to dummy data calculations
      const dummySummary = teamSummary.byUser.find(u => u.userId === member.id)
      const memberRecordings = getRecordingsByUser(member.id)
      const memberContacts = getContactsByUser(member.id)
      
      return {
        ...member,
        recordings: summary?.recordings ?? dummySummary?.recordings ?? memberRecordings.length,
        duration: summary?.duration ?? dummySummary?.duration ?? memberRecordings.reduce((acc, r) => acc + r.duration, 0),
        contacts: summary?.contacts ?? dummySummary?.contacts ?? memberContacts.length,
        activityLevel: (summary?.activity_level ?? dummySummary?.activityLevel ?? 'medium') as TeamMemberWithActivity['activityLevel'],
        hasAlert: alerts.some(a => a.userId === member.id && !a.isRead),
      }
    })
  }, [members, dashboardData, alerts])

  // Filter team members
  const filteredMembers = useMemo(() => {
    return teamMembersWithActivity.filter((member) => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || member.status === statusFilter
      const matchesActivity = activityFilter === "all" || member.activityLevel === activityFilter

      return matchesSearch && matchesStatus && matchesActivity
    })
  }, [teamMembersWithActivity, searchQuery, statusFilter, activityFilter])

  // Stats
  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    invited: members.filter(m => m.status === 'invited').length,
    alertCount: alerts.filter(a => !a.isRead).length,
  }), [members, alerts])

  return (
    <div className="flex flex-col h-full">
      <Header title="Team" subtitle={`${members.length} team members`} />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* API Error Banner */}
        {apiError && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Note:</strong> Unable to load live data. Showing demo data. ({apiError})
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted">Total Members</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <UserX className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.invited}</p>
                <p className="text-sm text-muted">Pending Invite</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.alertCount}</p>
                <p className="text-sm text-muted">Alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  placeholder="Search team members..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "invited", label: "Invited" },
                  { value: "disabled", label: "Disabled" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-40"
              />
              <Select
                options={[
                  { value: "all", label: "All Activity" },
                  { value: "high", label: "High Activity" },
                  { value: "medium", label: "Medium Activity" },
                  { value: "low", label: "Low Activity" },
                ]}
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="w-full md:w-40"
              />
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Data Table */
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={filteredMembers}
                searchKey="name"
                pageSize={10}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
