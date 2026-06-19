"use client"

import { useEffect, useRef, useCallback } from "react"

type WSMessage = {
  type: "update"
  ref_id: string
  data: {
    status: string
    status_provider?: string | null
    paid_at?: string | null
  }
}

export function useWebSocket(refId: string, onUpdate: (data: WSMessage["data"]) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cbRef = useRef(onUpdate)
  cbRef.current = onUpdate

  const connect = useCallback(() => {
    
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
    const host = process.env.NEXT_PUBLIC_WS_URL || `${proto}//${window.location.hostname}:3001`
    const url = `${host}/ws`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`[WS] Connected to ${url}`)
      
      ws.send(JSON.stringify({ type: "subscribe", ref_id: refId }))
    }

    ws.onmessage = (ev: MessageEvent) => {
      try {
        const msg: WSMessage = JSON.parse(ev.data)
        if (msg.type === "update" && msg.ref_id === refId) {
          console.log(`[WS] Update received for ${refId}:`, msg.data)
          cbRef.current(msg.data)
        }
      } catch {
        
      }
    }

    ws.onclose = () => {
      console.log("[WS] Disconnected, reconnecting in 3s...")
      reconnectTimer.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [refId])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return {
    send: (msg: object) => {
      wsRef.current?.send(JSON.stringify(msg))
    },
  }
}