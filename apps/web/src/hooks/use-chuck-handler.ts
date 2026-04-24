import { useEffect, useRef } from "react"
interface WavChunk {
  id: string
  blob: Blob
  url: string
  duration: number
  timestamp: number
}

interface UseChunkHandlerOptions {
  onChunk: (chunk: WavChunk) => Promise<void>
  retryCount?: number
  retryDelay?: number
}

export function useChunkHandler(
  chunks: WavChunk[],
  { onChunk, retryCount = 3, retryDelay = 1000 }: UseChunkHandlerOptions
) {
  const processedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const processChunk = async (chunk: WavChunk) => {
      let attempts = 0

      while (attempts <= retryCount) {
        try {
          await onChunk(chunk)
          processedIds.current.add(chunk.id)
          return
        } catch (err) {
          attempts++

          if (attempts > retryCount) {
            console.error("Failed chunk:", chunk.id)
            return
          }

          await new Promise((res) => setTimeout(res, retryDelay))
        }
      }
    }

    const newChunks = chunks.filter(
      (c) => !processedIds.current.has(c.id)
    )

    newChunks.forEach((chunk) => {
      processChunk(chunk)
    })
  }, [chunks, onChunk, retryCount, retryDelay])
}