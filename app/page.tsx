'use client'

import { useState, useCallback } from 'react'

export default function Home() {
  const [post, setPost] = useState('')
  const [memeUrl, setMemeUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingMeme, setIsGeneratingMeme] = useState(false)
  const [copied, setCopied] = useState(false)

  const generatePost = useCallback(async () => {
    setIsGenerating(true)
    setPost('')
    setMemeUrl(null)
    setCopied(false)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) return

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setPost(fullText)
      }

      // After post is complete, generate meme based on content
      if (fullText) {
        setIsGeneratingMeme(true)
        try {
          const memeResponse = await fetch('/api/meme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: fullText }),
          })

          if (memeResponse.ok) {
            const memeData = await memeResponse.json()
            if (memeData.memeUrl) {
              setMemeUrl(memeData.memeUrl)
            }
          }
        } finally {
          setIsGeneratingMeme(false)
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const copyToClipboard = useCallback(async () => {
    if (!post) return
    await navigator.clipboard.writeText(post)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [post])

  const downloadMeme = useCallback(async () => {
    if (!memeUrl) return

    try {
      const response = await fetch(memeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'meme.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(memeUrl, '_blank')
    }
  }, [memeUrl])

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-medium mb-8">LinkedIn Post Generator</h1>

        <button
          onClick={generatePost}
          disabled={isGenerating}
          className="px-4 py-2 bg-white text-black text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>

        {post && (
          <div className="mt-8">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
              {post}
            </div>
            <button
              onClick={copyToClipboard}
              className="mt-4 text-xs text-neutral-500 hover:text-white"
            >
              {copied ? 'Copied' : 'Copy text'}
            </button>
          </div>
        )}

        {isGeneratingMeme && (
          <div className="mt-8 text-sm text-neutral-500">
            Generating meme...
          </div>
        )}

        {memeUrl && (
          <div className="mt-8">
            <img
              src={memeUrl}
              alt="Related meme"
              className="max-w-full rounded"
            />
            <button
              onClick={downloadMeme}
              className="mt-2 text-xs text-neutral-500 hover:text-white"
            >
              Download meme
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
