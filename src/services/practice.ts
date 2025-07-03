import { apiClient } from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export interface RoleplayScenario {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  targetCompetencies: string[]
  tags: string[]
  scenario: {
    context: string
    setting: string
    yourRole: string
    aiRole: string
    objectives: string[]
    successCriteria: string[]
  }
}

export interface RoleplaySession {
  id: string
  userId: string
  scenarioId: string
  status: 'active' | 'completed' | 'abandoned'
  startedAt: string
  completedAt?: string
  evaluation?: SessionEvaluation
}

export interface SessionMessage {
  id: string
  sessionId: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface SessionEvaluation {
  overallScore: number
  competencyScores: Record<string, number>
  strengths: string[]
  areasForImprovement: string[]
  detailedFeedback: string
  recommendations: string[]
}

class PracticeService {
  async getScenarios(filters: {
    difficulty?: string
    competency?: string
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString())
    })

    return apiClient.get(`${API_ENDPOINTS.PRACTICE.SCENARIOS}?${params}`)
  }

  async getScenario(scenarioId: string) {
    return apiClient.get(`${API_ENDPOINTS.PRACTICE.SCENARIOS}/${scenarioId}`)
  }

  async startSession(scenarioId: string) {
    return apiClient.post(`${API_ENDPOINTS.PRACTICE.SCENARIOS}/${scenarioId}/start`)
  }

  async sendMessage(sessionId: string, message: string) {
    return apiClient.post(`${API_ENDPOINTS.PRACTICE.SESSIONS}/${sessionId}/message`, {
      message,
    })
  }

  async endSession(sessionId: string) {
    return apiClient.post(`${API_ENDPOINTS.PRACTICE.SESSIONS}/${sessionId}/end`)
  }

  async getSession(sessionId: string) {
    return apiClient.get(`${API_ENDPOINTS.PRACTICE.SESSIONS}/${sessionId}`)
  }

  async getUserSessions(filters: {
    status?: string
    scenarioId?: string
    page?: number
    limit?: number
  } = {}) {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString())
    })

    return apiClient.get(`${API_ENDPOINTS.PRACTICE.SESSIONS}?${params}`)
  }

  async getSessionTranscript(sessionId: string) {
    return apiClient.get(`${API_ENDPOINTS.PRACTICE.SESSIONS}/${sessionId}/transcript`)
  }
}

export const practiceService = new PracticeService() 