'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, RefreshCw, Sparkles } from 'lucide-react'

export default function Home() {
  const [post, setPost] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePost = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    setPost('')
    setCopied(false)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to generate post')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Plain text stream - just append the chunks
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setPost(fullText)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const copyToClipboard = useCallback(async () => {
    if (!post) return

    try {
      await navigator.clipboard.writeText(post)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }, [post])

  const charCount = post.length
  const charCountColor =
    charCount === 0
      ? 'text-gray-400'
      : charCount < 800
        ? 'text-amber-500'
        : charCount > 1500
          ? 'text-amber-500'
          : 'text-emerald-500'

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            LinkedIn Post Generator
          </h1>
          <p className="text-lg text-slate-600">
            AI-powered posts for financial services professionals
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Geopolitics & Markets Focus
          </p>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={generatePost}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white
                       rounded-xl font-semibold text-lg shadow-lg
                       hover:bg-slate-800 active:bg-slate-950
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 ease-out
                       hover:shadow-xl hover:-translate-y-0.5"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Post
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Post Preview */}
        {(post || isGenerating) && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-300 rounded-full" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Your Name</div>
                  <div className="text-xs text-slate-500">Portfolio Manager | Market Analyst</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Character Count */}
                <span className={`text-sm font-medium ${charCountColor}`}>
                  {charCount.toLocaleString()} chars
                </span>
                {/* Copy Button */}
                <button
                  onClick={copyToClipboard}
                  disabled={!post || isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5
                             bg-slate-100 hover:bg-slate-200
                             text-slate-700 text-sm font-medium rounded-lg
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors duration-150"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-5">
              {post ? (
                <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {post}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Crafting your post...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            {post && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Preview only - paste into LinkedIn to post</span>
                  <span className={charCount > 3000 ? 'text-red-500 font-medium' : ''}>
                    {charCount > 3000 && 'Exceeds LinkedIn limit (3000)'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips Section */}
        {!post && !isGenerating && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">Pro tip:</span>{' '}
                Each generation uses a different structure and hook pattern for variety.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-500">
          <p>Powered by Claude AI | Built for B2B Finance Professionals</p>
        </footer>
      </div>
    </main>
  )
}
