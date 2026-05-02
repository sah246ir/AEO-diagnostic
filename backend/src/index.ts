import "./config.js"
import cors from "cors"
import express from "express"
import { processReccomendation } from "./AnalyzeEngine.js"
import { clearSseBuffer, registerSseConnection, sendSseEvent } from "./sse.js"

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

app.post("/analyze", (req, res) => {
    const query = typeof req.body?.query === "string" ? req.body.query : ""
    const userProduct = typeof req.body?.userProduct === "string" ? req.body.userProduct : ""
    if (!query.trim()) {
        res.status(400).json({ error: "Missing body.query (non-empty string)" })
        return
    }

    clearSseBuffer()
    void processReccomendation(query, userProduct).catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[analyze]", message)
        sendSseEvent("analyze_error", { message })
    })

    res.status(202).json({ ok: true })
})

app.get("/sse", (_req, res) => {
    registerSseConnection(res)
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})
