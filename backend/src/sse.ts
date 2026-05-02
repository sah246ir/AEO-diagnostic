import type { Response } from "express"

const clients = new Set<Response>()
const MAX_BUFFER = 200
/** Replay for clients that connect after POST returns (POST → EventSource order). */
const buffer: string[] = []

function formatSseMessage(event: string, data: unknown): string {
    const str = typeof data === "string" ? data : JSON.stringify(data)
    const dataLines = str.split("\n").map((line) => `data: ${line}`).join("\n")
    return `event: ${event}\n${dataLines}\n\n`
}

export function clearSseBuffer(): void {
    buffer.length = 0
}

/** Register this response as an SSE stream; keep connection open until the client disconnects. */
export function registerSseConnection(res: Response): void {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8")
    res.setHeader("Cache-Control", "no-cache, no-transform")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("X-Accel-Buffering", "no")

    clients.add(res)

    const remove = () => {
        clients.delete(res)
    }
    res.on("close", remove)
    res.req.on("aborted", remove)

    for (const chunk of buffer) {
        res.write(chunk)
    }
    res.write(": connected\n\n")
}

/**
 * Push an event to every connected SSE client. Import this from other modules to broadcast.
 * @returns how many clients received the write
 */
export function sendSseEvent(event: string, data: unknown): number {
    const payload = formatSseMessage(event, data)
    buffer.push(payload)
    if (buffer.length > MAX_BUFFER) {
        buffer.splice(0, buffer.length - MAX_BUFFER)
    }

    let sent = 0
    for (const res of [...clients]) {
        if (res.writableEnded) {
            clients.delete(res)
            continue
        }
        try {
            res.write(payload)
            sent++
        } catch {
            clients.delete(res)
        }
    }
    return sent
}
