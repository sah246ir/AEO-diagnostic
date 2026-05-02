import { useCallback, useRef } from 'react'

export type SseHandlerMap = Record<string, (ev: MessageEvent) => void>

/**
 * Thin EventSource wrapper: one connection, named event listeners, explicit close.
 * Handlers should be stable or recreated per `connect` call (typical for one-shot analyze flows).
 */
export function useSSE() {
  const esRef = useRef<EventSource | null>(null)

  const close = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
  }, [])

  const connect = useCallback(
    (url: string, handlers: SseHandlerMap, onTransportError: () => void) => {
      close()
      const es = new EventSource(url)
      for (const [eventName, fn] of Object.entries(handlers)) {
        es.addEventListener(eventName, fn as EventListener)
      }
      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) return
        onTransportError()
      }
      esRef.current = es
    },
    [close],
  )

  return { connect, close }
}
