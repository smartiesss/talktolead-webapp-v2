"use client"

import { use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { 
  ArrowLeft, Phone, Mail, Building2, 
  Mic, FileText, Edit, ChevronRight, 
  Clock, RefreshCw, AlertTriangle, Globe, Linkedin,
  Instagram, Facebook
} from "lucide-react"
import { useContact, useRecordings, useApiError, type ApiContact } from "@/lib/api/hooks"
import { formatDate, formatTime, formatDuration } from "@/lib/utils"
import { notFound } from "next/navigation"

function getContactDisplayName(contact: ApiContact): string {
  const primary = contact.languages?.find(l => l.language_code === 'en') ?? contact.languages?.[0]
  const first = primary?.first_name ?? contact.first_name
  const last = primary?.last_name ?? contact.last_name
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return contact.primary_email ?? `Contact #${contact.id}`
}

function getContactCompany(contact: ApiContact): string | null {
  const primary = contact.languages?.find(l => l.language_code === 'en') ?? contact.languages?.[0]
  return primary?.company ?? null
}

export default function ContactDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  
  const { data: contact, isLoading, error, refetch } = useContact(id)
  const { data: allRecordings } = useRecordings()
  const errorMessage = useApiError(error)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Contact Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <p>Loading contact…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !contact) {
    if (!isLoading && error && (error as { status?: number }).status === 404) notFound()
    return (
      <div className="flex flex-col h-full">
        <Header title="Contact Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-foreground font-medium">Failed to load contact</p>
            <p className="text-muted text-sm">{errorMessage ?? 'An unexpected error occurred.'}</p>
            <Button variant="outline" onClick={() => refetch()}>Try again</Button>
          </div>
        </div>
      </div>
    )
  }

  const displayName = getContactDisplayName(contact)
  const company = getContactCompany(contact)
  const contactRecordings = (allRecordings ?? []).filter(r => r.contact_id === contact.id)

  return (
    <div className="flex flex-col h-full">
      <Header title="Contact Details" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Back */}
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
              <Avatar name={displayName} size="lg" className="h-20 w-20 text-2xl" />
              
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground">{displayName}</h2>
                {contact.job_title && (
                  <p className="text-muted">{contact.job_title}</p>
                )}
                {company && (
                  <p className="text-muted flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4" />
                    {company}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 flex-wrap">
                {contact.work_phone && (
                  <a href={`tel:${contact.work_phone}`}>
                    <Button variant="outline" size="icon" title={contact.work_phone}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {contact.primary_email && (
                  <a href={`mailto:${contact.primary_email}`}>
                    <Button variant="outline" size="icon" title={contact.primary_email}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {contact.linkedin && (
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" title="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.primary_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted flex-shrink-0" />
                    <a href={`mailto:${contact.primary_email}`} className="text-sm text-primary hover:underline truncate">
                      {contact.primary_email}
                    </a>
                  </div>
                )}
                {contact.work_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted flex-shrink-0" />
                    <a href={`tel:${contact.work_phone}`} className="text-sm text-foreground">
                      {contact.work_phone}
                    </a>
                  </div>
                )}
                {contact.mobile_number && contact.mobile_number !== contact.work_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted flex-shrink-0" />
                    <a href={`tel:${contact.mobile_number}`} className="text-sm text-foreground">
                      {contact.mobile_number} <span className="text-muted">(mobile)</span>
                    </a>
                  </div>
                )}
                {contact.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-muted flex-shrink-0" />
                    <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                      LinkedIn
                    </a>
                  </div>
                )}
                {contact.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="h-4 w-4 text-muted flex-shrink-0" />
                    <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                      Instagram
                    </a>
                  </div>
                )}
                {contact.facebook && (
                  <div className="flex items-center gap-3">
                    <Facebook className="h-4 w-4 text-muted flex-shrink-0" />
                    <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                      Facebook
                    </a>
                  </div>
                )}
                {contact.crm_id && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted flex-shrink-0" />
                    <span className="text-sm text-muted">
                      {contact.crm_provider ?? 'CRM'}: {contact.crm_id}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multi-language Names */}
            {contact.languages && contact.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contact.languages.map((lang) => (
                    <div key={lang.id} className="p-3 rounded-lg bg-gray-50 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-xs uppercase">{lang.language_code}</Badge>
                      </div>
                      {(lang.first_name || lang.last_name) && (
                        <p className="text-sm font-medium text-foreground">
                          {[lang.first_name, lang.last_name].filter(Boolean).join(' ')}
                        </p>
                      )}
                      {lang.job_title && <p className="text-xs text-muted">{lang.job_title}</p>}
                      {lang.company && <p className="text-xs text-muted">{lang.company}</p>}
                      {lang.address && <p className="text-xs text-muted">{lang.address}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Meta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Added</span>
                  <span className="text-foreground">{formatDate(contact.created_at)}</span>
                </div>
                {contact.updated_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Updated</span>
                    <span className="text-foreground">{formatDate(contact.updated_at)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Recordings</span>
                  <span className="text-foreground font-medium">{contactRecordings.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notes + Recordings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
                <Button variant="outline" size="sm">Edit</Button>
              </CardHeader>
              <CardContent>
                {contact.notes ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {contact.notes}
                  </p>
                ) : (
                  <p className="text-muted text-sm text-center py-4">No notes added</p>
                )}
              </CardContent>
            </Card>

            {/* Related Recordings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Recordings ({contactRecordings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactRecordings.length > 0 ? (
                  <div className="space-y-3">
                    {contactRecordings.map((rec) => {
                      const recName = rec.user?.display_name ?? rec.user?.email ?? 'Unknown'
                      return (
                        <Link key={rec.id} href={`/recordings/${rec.id}`}>
                          <div className="p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">{recName}</p>
                                <p className="text-sm text-muted">
                                  {formatDate(rec.created_at)} at {formatTime(rec.created_at)}
                                </p>
                                {rec.duration && (
                                  <p className="text-xs text-muted mt-1">
                                    {formatDuration(rec.duration)}
                                  </p>
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
                  <p className="text-center text-muted py-6">No recordings for this contact</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
