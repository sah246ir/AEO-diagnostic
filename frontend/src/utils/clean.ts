const DEFAULT_MAX_STRING_LENGTH = 280

/** Trims and truncates very long strings for display (ellipsis, no word changes). */
export function clip(text: string, maxLength: number = DEFAULT_MAX_STRING_LENGTH): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1).trim()}…`
}

/** First non-empty items, capped at `maxItems`, each passed through `clip`. */
export function pickTop(items: string[], maxItems = 3): string[] {
  return items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, maxItems)
    .map((item) => clip(item))
}

/** Splits on sentence boundaries; returns at most `maxSentences` parts (no other heuristics). */
export function splitTextIntoSentences(text: string, maxSentences: number): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  return trimmed
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .slice(0, maxSentences)
}
