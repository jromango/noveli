import { searchWithSemanticAssistant } from './geminiService'

export interface GeminiRecommendation {
  title: string
  author: string
}

export interface GeminiAssistantResult {
  intro: string
  recommendations: GeminiRecommendation[]
}

export async function searchWithGeminiAssistant(query: string): Promise<GeminiAssistantResult> {
  return searchWithSemanticAssistant(query)
}
