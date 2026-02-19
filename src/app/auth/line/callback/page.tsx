"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { verifyLineState } from "@/lib/auth/line"

function LineCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithLine } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Handle LINE error response
      if (errorParam) {
        setStatus('error')
        setError(errorDescription || 'LINE authentication was cancelled or failed')
        return
      }

      // Verify code exists
      if (!code) {
        setStatus('error')
        setError('No authorization code received from LINE')
        return
      }

      // Verify state for CSRF protection
      if (!state || !verifyLineState(state)) {
        setStatus('error')
        setError('Invalid state parameter. Please try again.')
        return
      }

      try {
        // Exchange code for JWT via backend and login
        const redirectUri = `${window.location.origin}/auth/line/callback`
        await loginWithLine(code, redirectUri)
        setStatus('success')
        // Router push happens in loginWithLine
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to authenticate with LINE')
      }
    }

    handleCallback()
  }, [searchParams, loginWithLine])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-[#00B900] animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-[#00B900]" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Signing in with LINE...'}
            {status === 'success' && 'Login Successful!'}
            {status === 'error' && 'Login Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your LINE account'}
            {status === 'success' && 'Redirecting to dashboard...'}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>
        {status === 'error' && (
          <CardContent>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Back to Login
            </button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default function LineCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-[#00B900] animate-spin" />
      </div>
    }>
      <LineCallbackContent />
    </Suspense>
  )
}
