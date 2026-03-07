"use client"

import { use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { 
  ArrowLeft, Mail, Mic, Clock, AlertTriangle,
  ChevronRight, TrendingUp, RefreshCw, Users
} from "lucide-react"
import { useSubordinates, useSubordinateRecordings, useApiError, type ApiSubordinate } from "@/lib/api/hooks"
import { formatDuration, formatDate, formatTime, formatRelativeTime } from "@/lib/utils"
import { notFound } from "next/navigation"

function getSubordinateName(user: ApiSubordinate): string {
  return user.display_name ?? user.email
}

export default function TeamMemberDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)

  const { data: subordinates, isLoading: loadingTeam, error: teamError } = useSubordinates()
  const { data: recordings, isLoading: loadingRecs, error: recsError } = useSubordinateRecordings(id)
  const teamErrorMessage = useApiError(teamError)
  const recsErrorMessage = useApiError(recsError)

  const isLoading = loadingTeam || loadingRecs
  const user = subordinates?.find(u => String(u.id) === id || String(u.uuid) === id)

  if (loadingTeam) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Team Member" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <p>Loading team member…</p>
          </div>
        </div>
      </div>
    )
  }

  if (teamError) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Team Member" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-foreground font-medium">Failed to load team data</p>
            <p className="text-muted text-sm">{teamErrorMessage ?? 'An unexpected error occurred.'}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    notFound()
  }

  const displayName = getSubordinateName(user)
  const totalDuration = recordings?.reduce((acc, r) => acc + (r.duration ?? 0), 0) ?? 0
  const completedRecs = recordings?.filter(r => r.status === 'completed') ?? []

  return (
    <div className="flex flex-col h-full">
      <Header title="Team Member" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Back */}
        <Link href="/team">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </Link>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar name={displayName} size="lg" className="h-20 w-20 text-2xl" />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-semibold text-foreground">{displayName}</h2>
                  <Badge variant={user.status === 'active' ? 'success' : user.status === 'invited' ? 'warning' : 'default'}>
                    {user.status}
                  </Badge>
                </div>
                <p className="text-muted capitalize">{user.role}</p>
                <p className="text-sm text-muted flex items-center gap-1 mt-1">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                </p>
                {user.last_active_at && (
                  <p className="text-sm text-muted mt-1">
                    Last active {formatRelativeTime(user.last_active_at)}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <a href={`mailto:${user.email}`}>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mic className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {user.recordings_count ?? recordings?.length ?? 0}
                  </p>
                  <p className="text-xs text-muted">Recordings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500 p-1.5 bg-blue-50 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatDuration(totalDuration)}
                  </p>
                  <p className="text-xs text-muted">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500 p-1.5 bg-green-50 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {user.contacts_count ?? 0}
                  </p>
                  <p className="text-xs text-muted">Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-amber-500 p-1.5 bg-amber-50 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {completedRecs.length}
                  </p>
                  <p className="text-xs text-muted">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recordings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Recordings
              {loadingRecs && <RefreshCw className="h-4 w-4 animate-spin text-muted ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recsError ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-muted text-sm">{recsErrorMessage ?? 'Failed to load recordings'}</p>
              </div>
            ) : loadingRecs ? (
              <div className="text-center py-6">
                <RefreshCw className="h-8 w-8 animate-spin text-muted mx-auto mb-2" />
                <p className="text-muted text-sm">Loading recordings…</p>
              </div>
            ) : recordings && recordings.length > 0 ? (
              <div className="space-y-3">
                {recordings.map((rec) => {
                  const contactName = rec.contact
                    ? [rec.contact.first_name, rec.contact.last_name].filter(Boolean).join(' ') || rec.contact.primary_email
                    : null
                  return (
                    <Link key={rec.id} href={`/recordings/${rec.id}`}>
                      <div className="p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground">
                                {formatDate(rec.created_at)} at {formatTime(rec.created_at)}
                              </p>
                              {rec.duration && (
                                <span className="text-xs text-muted">· {formatDuration(rec.duration)}</span>
                              )}
                            </div>
                            {contactName && (
                              <p className="text-sm text-muted mt-0.5">{contactName}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              rec.status === 'completed' ? 'success' :
                              rec.status === 'processing' ? 'warning' : 'default'
                            }>
                              {rec.status}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted py-6">No recordings yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
