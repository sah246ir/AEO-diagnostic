import "./config.js"
import cors from "cors"
import express from "express"
import { processReccomendation } from "./AnalyzeEngine.js"
import { registerSseConnection, sendSseEvent } from "./sse.js"

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())
 
app.post("/analyze", async (req, res) => {
    const query = typeof req.body?.query === "string" ? req.body.query : ""
    const userProduct = typeof req.body?.userProduct === "string" ? req.body.userProduct : ""
    if (!query.trim()) {
        res.status(400).json({ error: "Missing body.query (non-empty string)" })
        return
    }
    try {
        const result = await processReccomendation(query, userProduct)
        res.json(result)
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        res.status(500).json({ error: message })
    }
})

app.get("/sse", (_req, res) => {
    registerSseConnection(res)
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})
