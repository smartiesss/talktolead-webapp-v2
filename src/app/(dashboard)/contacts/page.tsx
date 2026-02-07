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
import { Search, Plus, Download, ChevronRight, Users, UserPlus, Trophy, Loader2 } from "lucide-react"
import { useContacts, useSubordinates, useApiError } from "@/lib/api/hooks"
import { transformContacts, transformSubordinates } from "@/lib/api/transforms"
import { contacts as dummyContacts, teamMembers } from "@/data/dummy"
import { Contact } from "@/types"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

const statusConfig: Record<Contact['status'], { label: string; variant: "success" | "warning" | "info" | "default" | "destructive" }> = {
  new: { label: "New", variant: "info" },
  contacted: { label: "Contacted", variant: "default" },
  qualified: { label: "Qualified", variant: "success" },
  proposal: { label: "Proposal", variant: "warning" },
  won: { label: "Won", variant: "success" },
  lost: { label: "Lost", variant: "destructive" },
}

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.name} size="sm" />
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          {row.original.title && (
            <p className="text-xs text-muted">{row.original.title}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.company || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const config = statusConfig[row.original.status]
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: "assignedToUserName",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.assignedToUserName || "—"}
      </span>
    ),
  },
  {
    accessorKey: "recordingCount",
    header: "Recordings",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.recordingCount > 0 ? `📼 ${row.original.recordingCount}` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Added",
    cell: ({ row }) => (
      <span className="text-sm text-muted">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/contacts/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
]

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")

  // Fetch real data
  const { data: contactsData, isLoading, error } = useContacts()
  const { data: subordinatesData } = useSubordinates()
  const apiError = useApiError(error)

  // Transform or use dummy data
  const contacts = useMemo(() => {
    if (contactsData && contactsData.length > 0) {
      return transformContacts(contactsData)
    }
    return dummyContacts
  }, [contactsData])

  const users = useMemo(() => {
    if (subordinatesData && subordinatesData.length > 0) {
      return transformSubordinates(subordinatesData)
    }
    return teamMembers
  }, [subordinatesData])

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      const matchesStatus = statusFilter === "all" || contact.status === statusFilter
      const matchesOwner = ownerFilter === "all" || contact.assignedToUserId === ownerFilter

      return matchesSearch && matchesStatus && matchesOwner
    })
  }, [contacts, searchQuery, statusFilter, ownerFilter])

  // Stats
  const stats = useMemo(() => ({
    newLeads: contacts.filter(c => c.status === 'new').length,
    qualified: contacts.filter(c => c.status === 'qualified').length,
    won: contacts.filter(c => c.status === 'won').length,
  }), [contacts])

  return (
    <div className="flex flex-col h-full">
      <Header title="Contacts" subtitle={`${contacts.length} total contacts`} />
      
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.newLeads}</p>
                <p className="text-sm text-muted">New Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.qualified}</p>
                <p className="text-sm text-muted">Qualified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.won}</p>
                <p className="text-sm text-muted">Won</p>
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
                  placeholder="Search contacts..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "All Status" },
                  { value: "new", label: "New" },
                  { value: "contacted", label: "Contacted" },
                  { value: "qualified", label: "Qualified" },
                  { value: "proposal", label: "Proposal" },
                  { value: "won", label: "Won" },
                  { value: "lost", label: "Lost" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-40"
              />
              <Select
                options={[
                  { value: "all", label: "All Owners" },
                  ...users.map((u) => ({ value: u.id, label: u.name })),
                ]}
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="w-full md:w-40"
              />
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
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
                data={filteredContacts}
                searchKey="name"
                pageSize={15}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
