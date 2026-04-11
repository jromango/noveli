export type HybridIntent = 'traditional' | 'ai'

export interface GeminiBookRecommendation {
  titulo: string
  autor: string
  descripcion_breve: string
}

export interface GeminiBooksResponse {
  recomendaciones: GeminiBookRecommendation[]
}

export interface AssistantRecommendation {
  title: string
  author: string
}

export interface AssistantResult {
  intro: string
  recommendations: AssistantRecommendation[]
}

const AI_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const AI_MODEL = 'llama-3.1-8b-instant'

const PHRASE_HINTS = [
  'para',
  'sobre',
  'quiero',
  'recomienda',
  'recomiendame',
  'busco',
  'necesito',
  'me siento',
  'ayudame',
  'emocion',
  'tema',
  'contexto',
]

function getAiApiKey(): string {
  return (
    (import.meta.env.VITE_AI_API_KEY as string | undefined)
    || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
    || ''
  ).trim()
}

export function detectSearchIntent(query: string): HybridIntent {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return 'traditional'

  const words = trimmed.split(/\s+/).filter(Boolean)
  const hasQuestionMark = /[?¿]/.test(trimmed)
  const hasPhraseHint = PHRASE_HINTS.some((hint) => trimmed.includes(hint))

  if (hasQuestionMark || hasPhraseHint) {
    return 'ai'
  }

  if (words.length <= 3) {
    return 'traditional'
  }

  return 'ai'
}

function truncateWords(value: string, maxWords = 15): string {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return value.trim()
  return `${words.slice(0, maxWords).join(' ')}...`
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function extractJsonBlock(rawText: string): string | null {
  const direct = safeJsonParse<any>(rawText)
  if (direct) return rawText

  const match = rawText.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

async function requestStructuredAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = getAiApiKey()
  if (!apiKey) {
    throw new Error('Missing VITE_AI_API_KEY')
  }

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.4,
      max_tokens: 600,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`AI provider error ${response.status}: ${message}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content as string | undefined

  if (!text) {
    throw new Error('AI provider returned empty content')
  }

  return text
}

function normalizeSemanticBooks(rawText: string): GeminiBooksResponse {
  const jsonBlock = extractJsonBlock(rawText)
  const parsed = jsonBlock ? safeJsonParse<GeminiBooksResponse>(jsonBlock) : null
  const list = Array.isArray(parsed?.recomendaciones) ? parsed.recomendaciones : []

  return {
    recomendaciones: list
      .filter((item) => item?.titulo && item?.autor)
      .slice(0, 3)
      .map((item) => ({
        titulo: item.titulo.trim(),
        autor: item.autor.trim(),
        descripcion_breve: truncateWords(item.descripcion_breve || 'Sugerencia semantica para tu busqueda.'),
      })),
  }
}

function normalizeAssistant(rawText: string): AssistantResult {
  const jsonBlock = extractJsonBlock(rawText)
  const parsed = jsonBlock ? safeJsonParse<{ intro?: string; recommendations?: AssistantRecommendation[] }>(jsonBlock) : null
  const recommendations = Array.isArray(parsed?.recommendations)
    ? parsed!.recommendations.filter((item) => item?.title && item?.author).slice(0, 5)
    : []

  return {
    intro: parsed?.intro?.trim() || 'Tu Bibliotecario encontro algunas pistas literarias para esta busqueda.',
    recommendations,
  }
}

export async function getGeminiRecommendations(query: string): Promise<GeminiBookRecommendation[]> {
  const systemPrompt = 'Eres el Bibliotecario de Noveli. Responde siempre con sugerencias de libros reales en formato JSON: {titulo, autor, descripcion_breve}. Actua como buscador semantico de libros y devuelve exactamente 3 coincidencias relevantes.'
  const userPrompt = [
    `Consulta del usuario: "${query.trim()}"`,
    'Devuelve solo JSON valido con este formato:',
    '{"recomendaciones":[{"titulo":"...","autor":"...","descripcion_breve":"..."}]}',
    'descripcion_breve: maximo 15 palabras.',
  ].join('\n')

  const rawText = await requestStructuredAI(systemPrompt, userPrompt)
  return normalizeSemanticBooks(rawText).recomendaciones
}

export async function searchWithSemanticAssistant(query: string): Promise<AssistantResult> {
  const trimmed = query.trim()
  if (trimmed.length < 3) {
    return {
      intro: 'Escribe al menos 3 caracteres para activar al Bibliotecario IA.',
      recommendations: [],
    }
  }

  const systemPrompt = 'Eres el Bibliotecario de Noveli. Tu mision es ayudar al usuario a encontrar libros con una busqueda semantica flexible. Devuelve siempre JSON con intro y una lista de 3 a 5 recomendaciones de libros reales con title y author.'
  const userPrompt = [
    `Consulta del usuario: "${trimmed}"`,
    'Devuelve solo JSON valido con este formato:',
    '{"intro":"texto corto y juvenil","recommendations":[{"title":"...","author":"..."}]}',
    'Sin markdown. Sin texto fuera del JSON.',
  ].join('\n')

  const rawText = await requestStructuredAI(systemPrompt, userPrompt)
  return normalizeAssistant(rawText)
}
