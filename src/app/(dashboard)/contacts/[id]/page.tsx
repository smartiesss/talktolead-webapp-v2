"use client"

import { use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Select } from "@/components/ui/select"
import { 
  ArrowLeft, Phone, Mail, MessageSquare, Building2, 
  MapPin, Mic, Image as ImageIcon, FileText, Edit,
  ChevronRight, Calendar, Clock
} from "lucide-react"
import { getContactById, getRecordingById, recordings } from "@/data/dummy"
import { formatDate, formatTime, formatDuration } from "@/lib/utils"
import { notFound } from "next/navigation"

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

export default function ContactDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const contact = getContactById(id)

  if (!contact) {
    notFound()
  }

  // Get related recordings
  const contactRecordings = recordings.filter(r => r.contactId === contact.id)

  return (
    <div className="flex flex-col h-full">
      <Header title="Contact Details" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Back Button */}
        <Link href="/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>

        {/* Contact Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar name={contact.name} size="lg" className="h-20 w-20 text-2xl" />
              
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground">{contact.name}</h2>
                {contact.title && (
                  <p className="text-muted">{contact.title}</p>
                )}
                {contact.company && (
                  <p className="text-muted flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4" />
                    {contact.company}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {contact.phone && (
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                {contact.email && (
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Status Selector */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <Select
                options={statusOptions}
                defaultValue={contact.status}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted" />
                    <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted" />
                    <a href={`tel:${contact.phone}`} className="text-sm text-foreground">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted" />
                    <span className="text-sm text-foreground">{contact.company}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Source & Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Source</span>
                  <Badge variant="outline">{contact.source.replace('_', ' ')}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Assigned to</span>
                  <span className="text-sm text-foreground">
                    {contact.assignedToUserName || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Created by</span>
                  <span className="text-sm text-foreground">{contact.createdByUserName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Created</span>
                  <span className="text-sm text-foreground">{formatDate(contact.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {contact.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Recordings & Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recordings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Recordings ({contactRecordings.length})
                </CardTitle>
                <Link href="/recordings" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </CardHeader>
              <CardContent>
                {contactRecordings.length > 0 ? (
                  <div className="space-y-3">
                    {contactRecordings.slice(0, 5).map((recording) => (
                      <Link
                        key={recording.id}
                        href={`/recordings/${recording.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Mic className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">
                            {formatDate(recording.recordedAt)}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {recording.summary?.slice(0, 60)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-foreground">
                            {formatDuration(recording.duration)}
                          </p>
                          <p className="text-xs text-muted">
                            {formatTime(recording.recordedAt)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mic className="h-8 w-8 text-muted mx-auto" />
                    <p className="text-muted mt-2">No recordings linked to this contact</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Business Cards ({contact.businessCardIds.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contact.businessCardIds.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {contact.businessCardIds.map((cardId) => (
                      <div
                        key={cardId}
                        className="aspect-[1.6/1] bg-gray-100 rounded-lg flex items-center justify-center border border-border cursor-pointer hover:border-primary transition-colors"
                      >
                        <ImageIcon className="h-8 w-8 text-muted" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="h-8 w-8 text-muted mx-auto" />
                    <p className="text-muted mt-2">No business cards</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {contact.notes ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted mx-auto" />
                    <p className="text-muted mt-2">No notes added</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Note
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
