"use client"

import { use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { 
  ArrowLeft, Play, Pause, SkipBack, SkipForward, 
  Volume2, User, MapPin, Clock, FileText, Sparkles,
  Image as ImageIcon, ChevronRight
} from "lucide-react"
import { getRecordingById, getContactById } from "@/data/dummy"
import { formatDuration, formatDate, formatTime } from "@/lib/utils"
import { notFound } from "next/navigation"

export default function RecordingDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const recording = getRecordingById(id)

  if (!recording) {
    notFound()
  }

  const contact = recording.contactId ? getContactById(recording.contactId) : null

  return (
    <div className="flex flex-col h-full">
      <Header title="Recording Details" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Back Button */}
        <Link href="/recordings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recordings
          </Button>
        </Link>

        {/* Recording Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={recording.userName} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{recording.userName}</h2>
              <p className="text-muted">
                {formatDate(recording.recordedAt)} at {formatTime(recording.recordedAt)}
              </p>
              {recording.location && (
                <p className="text-sm text-muted flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {recording.location.address}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant={
              recording.status === 'ready' ? 'success' :
              recording.status === 'processing' ? 'warning' : 'default'
            }
          >
            {recording.status}
          </Badge>
        </div>

        {/* Audio Player */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Waveform Placeholder */}
              <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="flex items-end gap-1 h-12">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/30 rounded-full"
                      style={{ height: `${20 + Math.random() * 80}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div className="absolute h-full w-1/3 bg-primary rounded-full" />
                  <div 
                    className="absolute h-4 w-4 bg-primary rounded-full -top-1"
                    style={{ left: '33%' }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted">
                  <span>5:08</span>
                  <span>{formatDuration(recording.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-12 w-12">
                  <Play className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon">
                  <SkipForward className="h-5 w-5" />
                </Button>
                <div className="ml-4 flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-muted" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-2/3 h-full bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Cards */}
          <div className="space-y-6">
            {/* Linked Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Linked Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contact ? (
                  <Link href={`/contacts/${contact.id}`}>
                    <div className="p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{contact.name}</p>
                          <p className="text-sm text-muted">{contact.title}</p>
                          <p className="text-sm text-muted">{contact.company}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted" />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted">No contact linked</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Link Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Business Cards ({recording.businessCards.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recording.businessCards.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {recording.businessCards.map((card) => (
                      <div
                        key={card.id}
                        className="aspect-[1.6/1] bg-gray-100 rounded-lg flex items-center justify-center border border-border cursor-pointer hover:border-primary transition-colors"
                      >
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-muted mx-auto" />
                          <p className="text-xs text-muted mt-1">
                            @{formatDuration(card.timestampOffset)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted py-6">No business cards captured</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Transcription & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transcription */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcription
                </CardTitle>
                <Button variant="outline" size="sm">Copy</Button>
              </CardHeader>
              <CardContent>
                {recording.transcription ? (
                  <div className="max-h-64 overflow-auto">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {recording.transcription}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted mx-auto" />
                    <p className="text-muted mt-2">Transcription in progress...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recording.summary ? (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-foreground leading-relaxed">
                      {recording.summary}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-8 w-8 text-muted mx-auto" />
                    <p className="text-muted mt-2">Summary will be generated after transcription</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notes</CardTitle>
                <Button variant="outline" size="sm">Edit</Button>
              </CardHeader>
              <CardContent>
                {recording.notes ? (
                  <p className="text-sm text-foreground">{recording.notes}</p>
                ) : (
                  <p className="text-muted text-sm">No notes added</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
