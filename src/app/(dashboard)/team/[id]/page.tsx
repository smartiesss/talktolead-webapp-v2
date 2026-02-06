"use client"

import { use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { 
  ArrowLeft, Mail, Mic, Clock, Users, AlertTriangle,
  ChevronRight, Play, TrendingUp, TrendingDown
} from "lucide-react"
import { getUserById, getRecordingsByUser, getContactsByUser, alerts, teamSummary } from "@/data/dummy"
import { formatDuration, formatDate, formatTime, formatRelativeTime } from "@/lib/utils"
import { notFound } from "next/navigation"

export default function TeamMemberDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const user = getUserById(id)

  if (!user) {
    notFound()
  }

  const userRecordings = getRecordingsByUser(user.id)
  const userContacts = getContactsByUser(user.id)
  const userAlerts = alerts.filter(a => a.userId === user.id)
  const userSummary = teamSummary.byUser.find(u => u.userId === user.id)

  // Calculate stats
  const totalDuration = userRecordings.reduce((acc, r) => acc + r.duration, 0)
  
  // Mock weekly activity data
  const weeklyData = [
    { day: 'Mon', count: Math.floor(Math.random() * 10) + 5 },
    { day: 'Tue', count: Math.floor(Math.random() * 10) + 5 },
    { day: 'Wed', count: Math.floor(Math.random() * 10) + 5 },
    { day: 'Thu', count: Math.floor(Math.random() * 10) + 3 },
    { day: 'Fri', count: Math.floor(Math.random() * 10) + 3 },
    { day: 'Sat', count: Math.floor(Math.random() * 3) },
    { day: 'Sun', count: Math.floor(Math.random() * 2) },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Team Member" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Back Button */}
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
              <Avatar name={user.name} size="lg" className="h-20 w-20 text-2xl" />
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-foreground">{user.name}</h2>
                  <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                    {user.status}
                  </Badge>
                </div>
                <p className="text-muted capitalize">{user.role}</p>
                <p className="text-sm text-muted flex items-center gap-1 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted mt-1">
                  Joined {formatDate(user.createdAt)} • Last active {formatRelativeTime(user.lastActiveAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Banner */}
        {userAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  {userAlerts[0].message}
                </p>
                {userAlerts[0].details && (
                  <p className="text-sm text-red-700 mt-1">{userAlerts[0].details}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userSummary?.recordings ?? userRecordings.length}
                  </p>
                  <p className="text-sm text-muted">Recordings (This Week)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatDuration(userSummary?.duration ?? totalDuration)}
                  </p>
                  <p className="text-sm text-muted">Total Duration (This Week)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userSummary?.contacts ?? userContacts.length}
                  </p>
                  <p className="text-sm text-muted">Contacts Added (This Week)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activity Trend (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {weeklyData.map((day, index) => {
                  const maxCount = Math.max(...weeklyData.map(d => d.count))
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                  const isToday = index === weeklyData.length - 1
                  
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <span className="text-xs text-muted">{day.count}</span>
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            isToday ? 'bg-primary' : 'bg-primary/30'
                          }`}
                          style={{ height: `${Math.max(height * 1.5, 4)}px` }}
                        />
                      </div>
                      <span className="text-xs text-muted">{day.day}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Weekly Target</span>
                <span className="font-medium">15 recordings</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Current</span>
                <span className="font-medium">
                  {userSummary?.recordings ?? userRecordings.length} recordings
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(((userSummary?.recordings ?? userRecordings.length) / 15) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                {(userSummary?.recordings ?? userRecordings.length) >= 15 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">On track</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-600">
                      {15 - (userSummary?.recordings ?? userRecordings.length)} more needed
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recordings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Recordings</CardTitle>
            <Link href="/recordings" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {userRecordings.length > 0 ? (
              <div className="space-y-3">
                {userRecordings.slice(0, 5).map((recording) => (
                  <Link
                    key={recording.id}
                    href={`/recordings/${recording.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                  >
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground">
                          {formatDate(recording.recordedAt)} at {formatTime(recording.recordedAt)}
                        </p>
                        <Badge
                          variant={recording.status === 'ready' ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {recording.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted truncate">
                        {recording.summary?.slice(0, 80) || 'Processing...'}...
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-sm">
                        {formatDuration(recording.duration)}
                      </p>
                      {recording.contactName && (
                        <p className="text-xs text-muted">{recording.contactName}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mic className="h-8 w-8 text-muted mx-auto" />
                <p className="text-muted mt-2">No recordings yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
