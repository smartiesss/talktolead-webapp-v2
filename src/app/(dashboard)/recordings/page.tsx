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
import { Search, Play, ChevronRight, Download, Mic, Clock, CreditCard, Loader2 } from "lucide-react"
import { useRecordings, useSubordinates, useApiError } from "@/lib/api/hooks"
import { transformRecordings, transformSubordinates } from "@/lib/api/transforms"
import { recordings as dummyRecordings, teamMembers } from "@/data/dummy"
import { Recording } from "@/types"
import { formatDuration, formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"

const columns: ColumnDef<Recording>[] = [
  {
    accessorKey: "userName",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.userName} size="sm" />
        <div>
          <p className="font-medium text-foreground">{row.original.userName}</p>
          <p className="text-xs text-muted">{formatTime(row.original.recordedAt)}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "recordedAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{formatDate(row.original.recordedAt)}</span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{formatDuration(row.original.duration)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const variants: Record<string, { label: string; variant: "success" | "warning" | "default" | "destructive" }> = {
        ready: { label: "Ready", variant: "success" },
        processing: { label: "Processing", variant: "warning" },
        uploading: { label: "Uploading", variant: "default" },
        failed: { label: "Failed", variant: "destructive" },
      }
      const config = variants[status] || { label: status, variant: "default" }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: "contactName",
    header: "Contact",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.contactName || "—"}
      </span>
    ),
  },
  {
    accessorKey: "businessCards",
    header: "Cards",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.businessCards.length > 0 
          ? `📷 ${row.original.businessCards.length}` 
          : "—"
        }
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Play className="h-4 w-4" />
        </Button>
        <Link href={`/recordings/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    ),
  },
]

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch real data
  const { data: recordingsData, isLoading, error } = useRecordings()
  const { data: subordinatesData } = useSubordinates()
  const apiError = useApiError(error)

  // Transform or use dummy data
  const recordings = useMemo(() => {
    if (recordingsData && recordingsData.length > 0) {
      return transformRecordings(recordingsData)
    }
    return dummyRecordings
  }, [recordingsData])

  const users = useMemo(() => {
    if (subordinatesData && subordinatesData.length > 0) {
      return transformSubordinates(subordinatesData)
    }
    return teamMembers
  }, [subordinatesData])

  // Filter recordings
  const filteredRecordings = useMemo(() => {
    return recordings.filter((recording) => {
      const matchesSearch = 
        recording.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recording.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (recording.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      const matchesUser = userFilter === "all" || recording.userId === userFilter
      const matchesStatus = statusFilter === "all" || recording.status === statusFilter

      return matchesSearch && matchesUser && matchesStatus
    })
  }, [recordings, searchQuery, userFilter, statusFilter])

  // Stats
  const totalDuration = useMemo(() => 
    recordings.reduce((acc, r) => acc + r.duration, 0), 
    [recordings]
  )
  const totalBusinessCards = useMemo(() =>
    recordings.reduce((acc, r) => acc + r.businessCards.length, 0),
    [recordings]
  )

  return (
    <div className="flex flex-col h-full">
      <Header title="Recordings" subtitle={`${recordings.length} total recordings`} />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* API Error Banner */}
        {apiError && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Note:</strong> Unable to load live data. Showing demo data. ({apiError})
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recordings.length}</p>
                <p className="text-sm text-muted">Total Recordings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatDuration(totalDuration)}
                </p>
                <p className="text-sm text-muted">Total Duration</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBusinessCards}</p>
                <p className="text-sm text-muted">Business Cards</p>
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
                  placeholder="Search by user, contact, or content..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "All Users" },
                  ...users.map((u) => ({ value: u.id, label: u.name })),
                ]}
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full md:w-40"
              />
              <Select
                options={[
                  { value: "all", label: "All Status" },
                  { value: "ready", label: "Ready" },
                  { value: "processing", label: "Processing" },
                  { value: "failed", label: "Failed" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-40"
              />
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
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
                data={filteredRecordings}
                searchKey="userName"
                pageSize={15}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
