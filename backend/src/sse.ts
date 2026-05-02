import type { Response } from "express"

const clients = new Set<Response>()

function formatSseMessage(event: string, data: Record<string, unknown>): string {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
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

    res.write(": connected\n\n")
}

/**
 * Push an event to every connected SSE client. Import this from other modules to broadcast.
 * @returns how many clients received the write
 */
export function sendSseEvent(event: string, data: Record<string, unknown>): number {
    const payload = formatSseMessage(event, data)
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
