"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { 
  Mic, Clock, Users, UserCheck, AlertTriangle, TrendingUp, 
  ChevronRight, Trophy
} from "lucide-react"
import { teamSummary, alerts, recentActivity, weeklyActivity, teamMembers } from "@/data/dummy"
import { formatDuration, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const unreadAlerts = alerts.filter(a => !a.isRead)

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Team activity overview" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Period Selector */}
        <div className="flex justify-end">
          <Select
            options={[
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "quarter", label: "This Quarter" },
            ]}
            defaultValue="week"
            className="w-40"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{teamSummary.totalRecordings}</p>
                  <p className="text-sm text-muted">Recordings</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+12 from last week</span>
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
                    {Math.floor(teamSummary.totalDuration / 3600)}h {Math.floor((teamSummary.totalDuration % 3600) / 60)}m
                  </p>
                  <p className="text-sm text-muted">Total Hours</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+2.5h from last week</span>
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
                  <p className="text-2xl font-bold text-foreground">{teamSummary.newContacts}</p>
                  <p className="text-sm text-muted">New Leads</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+4 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {teamSummary.activeUsers}/{teamSummary.totalUsers}
                  </p>
                  <p className="text-sm text-muted">Active Salespeople</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted">
                2 salespeople inactive today
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Chart + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {weeklyActivity.map((day, index) => {
                  const maxRecordings = Math.max(...weeklyActivity.map(d => d.recordingsCount))
                  const height = (day.recordingsCount / maxRecordings) * 100
                  const isToday = index === weeklyActivity.length - 1
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <span className="text-xs text-muted">{day.recordingsCount}</span>
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            isToday ? 'bg-primary' : 'bg-primary/30'
                          }`}
                          style={{ height: `${height * 2}px` }}
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

          {/* Alerts Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                Alerts
                {unreadAlerts.length > 0 && (
                  <Badge variant="destructive">{unreadAlerts.length}</Badge>
                )}
              </CardTitle>
              <Link href="/team" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-2 w-2 mt-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {alert.userName}
                      </p>
                      <p className="text-sm text-muted">{alert.message}</p>
                      {alert.details && (
                        <p className="text-xs text-muted mt-1">{alert.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Leaderboard + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Team Leaderboard
              </CardTitle>
              <Link href="/team" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamSummary.byUser.slice(0, 5).map((user, index) => {
                  const medals = ['🥇', '🥈', '🥉']
                  
                  return (
                    <Link
                      key={user.userId}
                      href={`/team/${user.userId}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="w-6 text-center">
                        {index < 3 ? medals[index] : `${index + 1}.`}
                      </span>
                      <Avatar name={user.userName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {user.userName}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDuration(user.duration)} recorded
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{user.recordings}</p>
                        <p className="text-xs text-muted">recordings</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link href="/recordings" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar name={activity.userName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">
                          {activity.userName}
                        </span>{" "}
                        <span className="text-muted">{activity.description}</span>
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
