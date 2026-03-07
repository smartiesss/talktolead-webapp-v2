"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { 
  User, Building2, Users, Bell, Shield, CreditCard,
  Plus, Trash2, ExternalLink, AlertCircle, Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { useSubordinates } from "@/lib/api/hooks"

export default function SettingsPage() {
  const { user } = useAuth()
  const { data: subordinates, isLoading: isLoadingTeam, error: teamError } = useSubordinates()

  const displayName = user?.display_name || user?.name || user?.email || 'User'
  const email = user?.email || ''
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your account and team" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto max-w-4xl">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your personal account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar name={displayName} size="lg" className="h-20 w-20 text-2xl" />
              <div>
                <Button variant="outline" size="sm">Change Photo</Button>
                <p className="text-xs text-muted mt-2">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input defaultValue={displayName} data-testid="name-input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input defaultValue={email} type="email" data-testid="email-input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Input defaultValue={role} disabled data-testid="role-input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input placeholder="+852 9123 4567" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Organization Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>Manage your organization settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Organization Name</label>
                <Input defaultValue="Acme Sales Team" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Join Code</label>
                <div className="flex gap-2">
                  <Input defaultValue="ACME-2024" readOnly className="font-mono" />
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Current Plan</p>
                  <p className="text-sm text-muted">
                    {user?.subscription_tier 
                      ? `${user.subscription_tier} Plan`
                      : 'Pro Plan — 25 users, unlimited recordings'
                    }
                  </p>
                </div>
                <Badge variant="info" data-testid="plan-badge">
                  {user?.subscription_tier ?? 'Pro'}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>

            {typeof user?.token_balance === 'number' && (
              <div className="p-4 border border-border rounded-lg" data-testid="token-balance">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Token Balance</p>
                    <p className="text-sm text-muted">API tokens remaining this billing period</p>
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    {user.token_balance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>Invite and manage team members</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTeam && (
              <div className="flex items-center justify-center py-8" data-testid="team-loading">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
              </div>
            )}

            {teamError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg" data-testid="team-error">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Failed to load team members
              </div>
            )}

            {!isLoadingTeam && !teamError && (
              <div className="space-y-3">
                {(subordinates ?? []).slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                    data-testid="team-member-row"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={member.display_name ?? member.email} size="sm" />
                      <div>
                        <p className="font-medium text-foreground">
                          {member.display_name ?? member.email}
                        </p>
                        <p className="text-xs text-muted">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={member.status === 'active' ? 'success' : 'warning'}
                      >
                        {member.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-muted hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {!subordinates || subordinates.length === 0 ? (
                  <p className="text-sm text-muted text-center py-6" data-testid="team-empty">
                    No team members yet. Invite your first member!
                  </p>
                ) : null}

                {subordinates && subordinates.length > 5 && (
                  <Button variant="link" className="mt-4 w-full" data-testid="view-all-members">
                    View all {subordinates.length} members
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Low Activity Alerts', desc: 'Get notified when team members have low activity' },
              { title: 'New Recording Alerts', desc: 'Notifications for new team recordings' },
              { title: 'Daily Digest', desc: 'Receive a daily summary of team activity' },
              { title: 'Weekly Reports', desc: 'Get weekly performance reports via email' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={index < 2}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted">Last changed 30 days ago</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted">Manage your logged in devices</p>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Delete Organization</p>
                <p className="text-sm text-muted">Permanently delete your organization and all data</p>
              </div>
              <Button variant="destructive">Delete Organization</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
