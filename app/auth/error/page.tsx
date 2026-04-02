'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react'
import { Suspense } from 'react'

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration. Check if NEXTAUTH_SECRET is set.',
    AccessDenied: 'Access denied. You do not have permission to view this page.',
    Verification: 'The verification link has expired or has already been used.',
    Default: 'An unexpected authentication error occurred.',
  }

  const message = error ? (errorMessages[error] || error) : errorMessages.Default

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-red-500">
          <AlertCircle size={64} />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          Authentication Error
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We encountered an issue during the login process.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium whitespace-pre-wrap break-words">
                  Error Code: <span className="font-mono bg-red-100 px-1 rounded">{error || 'Unknown'}</span>
                </p>
                <p className="mt-1 text-sm text-red-600 italic">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
            
            <button
               onClick={() => window.location.reload()}
               className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry Connection
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">
              If the problem persists, please contact your Super Admin for database verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCcw className="animate-spin text-blue-500" size={48} />
      </div>
    }>
      <ErrorPageContent />
    </Suspense>
  )
}
