"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Download, FileText, BarChart3, TrendingUp, Users, 
  Mic, Clock, Calendar, ArrowRight
} from "lucide-react"
import { teamSummary, teamMembers, recordings, contacts, weeklyActivity } from "@/data/dummy"
import { formatDuration } from "@/lib/utils"

export default function ReportsPage() {
  // Calculate some report metrics
  const avgRecordingsPerUser = Math.round(teamSummary.totalRecordings / teamSummary.activeUsers)
  const avgDurationPerRecording = Math.round(teamSummary.totalDuration / teamSummary.totalRecordings)
  const conversionRate = Math.round((contacts.filter(c => c.status === 'won').length / contacts.length) * 100)

  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" subtitle="Analytics and exports" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Date Range Selector */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Select
              options={[
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "quarter", label: "This Quarter" },
                { value: "year", label: "This Year" },
                { value: "custom", label: "Custom Range" },
              ]}
              defaultValue="week"
              className="w-40"
            />
          </div>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Jan 1 - Jan 7, 2026
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Recordings</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {teamSummary.totalRecordings}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+18% vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Hours</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {Math.floor(teamSummary.totalDuration / 3600)}h {Math.floor((teamSummary.totalDuration % 3600) / 60)}m
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+12% vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Avg. per Salesperson</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
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
                  <p className="text-sm text-muted">Conversion Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {conversionRate}%
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
                <TrendingUp className="h-4 w-4" />
                <span>+5% vs last week</span>
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
              <div className="h-64 flex items-end justify-between gap-2">
                {weeklyActivity.map((day, index) => {
                  const maxRecordings = Math.max(...weeklyActivity.map(d => d.recordingsCount))
                  const height = (day.recordingsCount / maxRecordings) * 100
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <span className="text-xs text-muted">{day.recordingsCount}</span>
                        <div
                          className="w-full bg-primary rounded-t-md transition-all"
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

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Recordings by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamSummary.byUser.slice(0, 6).map((user, index) => {
                  const maxRecordings = Math.max(...teamSummary.byUser.map(u => u.recordings))
                  const percentage = (user.recordings / maxRecordings) * 100
                  
                  return (
                    <div key={user.userId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{user.userName}</span>
                        <span className="text-muted">{user.recordings} recordings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-primary' : 'bg-primary/60'
                          }`}
                          style={{ width: `${percentage}%` }}
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
            <CardDescription>Download detailed reports in various formats</CardDescription>
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
                <Button variant="outline" size="sm" className="mt-4 w-full">
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
                  <Badge variant="outline">PDF</Badge>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
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
                  <Badge variant="outline">Excel</Badge>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
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
