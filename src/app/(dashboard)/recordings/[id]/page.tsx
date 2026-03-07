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
  Image as ImageIcon, ChevronRight, RefreshCw, AlertTriangle
} from "lucide-react"
import { useRecording, useRecordingStatus, useApiError, type ApiTranscription } from "@/lib/api/hooks"
import { formatDuration, formatDate, formatTime } from "@/lib/utils"
import { notFound } from "next/navigation"

function getTranscriptionText(transcription?: ApiTranscription): string | null {
  if (!transcription?.text) return null
  if (typeof transcription.text === 'string') return transcription.text
  // Segments array → join segment text
  return transcription.text.map(s => s.text).join(' ')
}

function getAiSummary(transcription?: ApiTranscription): string | null {
  return transcription?.executive_summary?.summary 
    ?? transcription?.minutes?.summary 
    ?? null
}

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'success' | 'warning' | 'default' | 'destructive'> = {
    completed: 'success',
    processing: 'warning',
    pending: 'warning',
    failed: 'destructive',
  }
  return (
    <Badge variant={variantMap[status] ?? 'default'}>
      {status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
      {status}
    </Badge>
  )
}

export default function RecordingDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  
  const { data: recording, isLoading, error, refetch } = useRecording(id)
  const { data: statusData } = useRecordingStatus(
    id,
    recording?.status === 'processing' || recording?.status === 'pending'
  )
  const errorMessage = useApiError(error)

  const currentStatus = statusData?.status ?? recording?.status ?? 'pending'
  const displayName = recording?.user?.display_name ?? recording?.user?.email ?? 'Unknown'

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Recording Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <p>Loading recording…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recording) {
    if (!isLoading && error && (error as { status?: number }).status === 404) notFound()
    return (
      <div className="flex flex-col h-full">
        <Header title="Recording Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-foreground font-medium">Failed to load recording</p>
            <p className="text-muted text-sm">{errorMessage ?? 'An unexpected error occurred.'}</p>
            <Button variant="outline" onClick={() => refetch()}>Try again</Button>
          </div>
        </div>
      </div>
    )
  }

  const transcriptionText = getTranscriptionText(recording.transcription)
  const aiSummary = getAiSummary(recording.transcription)
  const contact = recording.contact
  const contactName = contact 
    ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.primary_email || 'Contact'
    : null

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
            <Avatar name={displayName} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
              <p className="text-muted">
                {formatDate(recording.created_at)} at {formatTime(recording.created_at)}
              </p>
            </div>
          </div>
          <StatusBadge status={currentStatus} />
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
                      style={{ height: `${20 + (i * 13 + 7) % 80}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Duration display */}
              <div className="w-full">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div className="absolute h-full w-0 bg-primary rounded-full" />
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted">
                  <span>0:00</span>
                  <span>{recording.duration ? formatDuration(recording.duration) : '--:--'}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" disabled>
                  <SkipBack className="h-5 w-5" />
                </Button>
                {recording.audio_url ? (
                  <a href={recording.audio_url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" className="h-12 w-12" title="Open audio">
                      <Play className="h-6 w-6" />
                    </Button>
                  </a>
                ) : (
                  <Button size="icon" className="h-12 w-12" disabled>
                    <Play className="h-6 w-6" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" disabled>
                  <SkipForward className="h-5 w-5" />
                </Button>
                <div className="ml-4 flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-muted" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-2/3 h-full bg-primary rounded-full" />
                  </div>
                </div>
              </div>

              {currentStatus === 'processing' && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing — transcription will appear shortly
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact */}
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
                          <p className="font-medium text-foreground">{contactName}</p>
                          {contact.job_title && (
                            <p className="text-sm text-muted">{contact.job_title}</p>
                          )}
                          {contact.languages?.[0]?.company && (
                            <p className="text-sm text-muted">{contact.languages[0].company}</p>
                          )}
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

            {/* Recording Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Duration</span>
                  <span className="text-foreground font-medium">
                    {recording.duration ? formatDuration(recording.duration) : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Status</span>
                  <span className="text-foreground font-medium capitalize">{currentStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Recorded</span>
                  <span className="text-foreground font-medium">{formatDate(recording.created_at)}</span>
                </div>
                {recording.transcription?.token_usage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tokens used</span>
                    <span className="text-foreground font-medium">
                      {recording.transcription.token_usage.toLocaleString()}
                    </span>
                  </div>
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
                {transcriptionText && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(transcriptionText)}
                  >
                    Copy
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {transcriptionText ? (
                  <div className="max-h-64 overflow-auto">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {transcriptionText}
                    </p>
                  </div>
                ) : currentStatus === 'processing' || currentStatus === 'pending' ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 text-muted mx-auto animate-spin" />
                    <p className="text-muted mt-2">Transcription in progress…</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted mx-auto" />
                    <p className="text-muted mt-2">No transcription available</p>
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
                {aiSummary ? (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
                  </div>
                ) : currentStatus === 'processing' || currentStatus === 'pending' ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 text-muted mx-auto animate-spin" />
                    <p className="text-muted mt-2">Summary generating…</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-8 w-8 text-muted mx-auto" />
                    <p className="text-muted mt-2">No summary available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Points & Action Items */}
            {recording.transcription?.minutes && (
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recording.transcription.minutes.key_points && recording.transcription.minutes.key_points.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Key Points</p>
                      <ul className="space-y-1">
                        {recording.transcription.minutes.key_points.map((point, i) => (
                          <li key={i} className="text-sm text-foreground flex gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recording.transcription.minutes.action_items && recording.transcription.minutes.action_items.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Action Items</p>
                      <ul className="space-y-1">
                        {recording.transcription.minutes.action_items.map((item, i) => (
                          <li key={i} className="text-sm text-foreground flex gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
