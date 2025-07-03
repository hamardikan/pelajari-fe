import { apiClient } from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export interface LearningModule {
  id: string
  title: string
  summary: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  tags: string[]
  isPublished: boolean
  content: {
    sections: ModuleSection[]
    flashcards: Flashcard[]
    assessment: AssessmentQuestion[]
    evaluation: EvaluationQuestion[]
  }
  createdAt: string
  sourceDocumentId?: string
}

export interface ModuleSection {
  id: string
  title: string
  content: string
  order: number
}

export interface Flashcard {
  id: string
  term: string
  definition: string
  category?: string
}

export interface AssessmentQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface EvaluationQuestion {
  id: string
  question: string
  scenario: string
  type: 'scenario' | 'case_study'
}

export interface UserProgress {
  id: string
  userId: string
  moduleId: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress: {
    completionPercentage: number
    currentSectionIndex: number
    timeSpent: number
    startedAt?: string
    completedAt?: string
  }
}

export interface ModuleFilters {
  search?: string
  difficulty?: string
  tags?: string[]
  page?: number
  limit?: number
}

class LearningService {
  async getModules(filters: ModuleFilters = {}) {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.difficulty) params.append('difficulty', filters.difficulty)
    if (filters.tags?.length) params.append('tags', filters.tags.join(','))
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    return apiClient.get(`${API_ENDPOINTS.LEARNING.MODULES}?${params}`)
  }

  async getModule(moduleId: string) {
    return apiClient.get(`${API_ENDPOINTS.LEARNING.MODULES}/${moduleId}`)
  }

  async startModule(moduleId: string) {
    return apiClient.post(`${API_ENDPOINTS.LEARNING.MODULES}/${moduleId}/start`)
  }

  async updateProgress(moduleId: string, progressData: {
    sectionIndex: number
    completed: boolean
    timeSpent: number
  }) {
    return apiClient.put(API_ENDPOINTS.LEARNING.PROGRESS, {
      moduleId,
      ...progressData,
    })
  }

  async getUserProgress(moduleId?: string) {
    const endpoint = moduleId 
      ? `${API_ENDPOINTS.LEARNING.MODULES}/${moduleId}/progress`
      : API_ENDPOINTS.LEARNING.PROGRESS
    
    return apiClient.get(endpoint)
  }

  async submitAssessment(moduleId: string, answers: string[]) {
    return apiClient.post(API_ENDPOINTS.LEARNING.ASSESSMENTS, {
      moduleId,
      answers,
    })
  }

  async submitEvaluation(moduleId: string, questionIndex: number, response: string) {
    return apiClient.post(API_ENDPOINTS.LEARNING.EVALUATIONS, {
      moduleId,
      questionIndex,
      response,
    })
  }

  async uploadDocument(file: File, onProgress?: (progress: number) => void) {
    return apiClient.upload(API_ENDPOINTS.DOCUMENTS, file, onProgress)
  }

  async createModuleFromDocument(file: File, metadata?: {
    title?: string
    description?: string
    tags?: string[]
  }) {
    const formData = new FormData()
    formData.append('file', file)
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value) {
          formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value)
        }
      })
    }

    return apiClient.post(API_ENDPOINTS.LEARNING.MODULES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const learningService = new LearningService() 