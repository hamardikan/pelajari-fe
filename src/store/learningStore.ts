import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { learningService, LearningModule, UserProgress } from '@/services/learning'
import { apiClient } from '@/services/api'
import { API_ENDPOINTS } from '@/utils/constants'
import { wsService } from '@/services/websocket'

interface LearningState {
  // Modules
  modules: LearningModule[]
  currentModule: LearningModule | null
  isLoadingModules: boolean
  
  // Progress
  userProgress: UserProgress[]
  ongoingModules: UserProgress[]
  isLoadingProgress: boolean
  
  // Filters
  filters: {
    search: string
    difficulty: string
    tags: string[]
  }
  
  // Upload
  uploadProgress: number
  isUploading: boolean
  
  // Actions
  fetchModules: () => Promise<void>
  setFilters: (filters: Partial<LearningState['filters']>) => void
  selectModule: (moduleId: string) => Promise<void>
  startModule: (moduleId: string) => Promise<void>
  updateProgress: (moduleId: string, progressData: {
    sectionIndex: number
    completed: boolean
    timeSpent: number
  }) => Promise<void>
  uploadDocument: (file: File, metadata?: {
    title?: string
    description?: string
    tags?: string[]
  }) => Promise<{ moduleId: string }>
  submitAssessment: (moduleId: string, answers: string[]) => Promise<unknown>
  submitEvaluation: (moduleId: string, questionIndex: number, response: string) => Promise<unknown>
  fetchOngoingModules: () => Promise<void>
  clearCurrentModule: () => void
}

// Helper to normalise module payload coming from the backend (id + data object)
const transformModulePayload = (raw: any): LearningModule => {
  const data = raw?.data || {}

  return {
    id: raw.id,
    title: data.title ?? '',
    summary: data.summary ?? '',
    difficulty: (data.difficulty ?? '') as LearningModule['difficulty'],
    estimatedDuration: data.estimatedDuration ?? 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    isPublished: data.isPublished ?? false,
    content: data.content ?? { sections: [], flashcards: [], assessment: [], evaluation: [] },
    createdAt: raw.createdAt ?? '',
    sourceDocumentId: data.sourceDocumentId,
  }
}

export const useLearningStore = create<LearningState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    modules: [],
    currentModule: null,
    isLoadingModules: false,
    userProgress: [],
    ongoingModules: [],
    isLoadingProgress: false,
    filters: {
      search: '',
      difficulty: '',
      tags: [],
    },
    uploadProgress: 0,
    isUploading: false,

    // Actions
    fetchModules: async () => {
      try {
        set({ isLoadingModules: true })
        const { filters } = get()
        
        const response = await learningService.getModules(filters) as { success: boolean; data: { modules: any[] } }
        
        if (response.success) {
          const normalised = response.data.modules.map(transformModulePayload)
          set({ 
            modules: normalised,
            isLoadingModules: false 
          })
        }
      } catch (error) {
        console.error('Failed to fetch modules:', error)
        set({ isLoadingModules: false })
      }
    },

    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters }
      }))
      
      // Auto-fetch when filters change
      get().fetchModules()
    },

    selectModule: async (moduleId: string) => {
      try {
        const response = await learningService.getModule(moduleId) as { success: boolean; data: { module: any } }
        
        if (response.success) {
          set({ currentModule: transformModulePayload(response.data.module) })
          
          // Join WebSocket room for real-time updates
          wsService.joinModuleRoom(moduleId)
        }
      } catch (error) {
        console.error('Failed to fetch module:', error)
      }
    },

    startModule: async (moduleId: string) => {
      try {
        const response = await learningService.startModule(moduleId) as { success: boolean; data: { progress: UserProgress } }
        
        if (response.success) {
          // Update progress in store
          set((state) => ({
            userProgress: [
              ...state.userProgress.filter(p => p.moduleId !== moduleId),
              response.data.progress
            ]
          }))
        }
      } catch (error) {
        console.error('Failed to start module:', error)
        throw error
      }
    },

    updateProgress: async (moduleId: string, progressData: {
      sectionIndex: number
      completed: boolean
      timeSpent: number
    }) => {
      try {
        const response = await learningService.updateProgress(moduleId, progressData) as { success: boolean; data: UserProgress }
        
        if (response.success) {
          // Update progress in store
          set((state) => ({
            userProgress: state.userProgress.map(p => 
              p.moduleId === moduleId 
                ? { ...p, ...response.data }
                : p
            )
          }))
        }
      } catch (error) {
        console.error('Failed to update progress:', error)
        throw error
      }
    },

    uploadDocument: async (file: File, metadata?: {
      title?: string
      description?: string
      tags?: string[]
    }) => {
      try {
        set({ isUploading: true, uploadProgress: 0 })
        
        const response = await learningService.createModuleFromDocument(
          file, 
          metadata,
        ) as { success: boolean; data: { moduleId: string } }
        
        if (response.success) {
          set({ 
            isUploading: false, 
            uploadProgress: 100 
          })
          
          // Refresh modules list
          await get().fetchModules()
          
          return response.data
        }
        
        throw new Error('Upload failed')
      } catch (error) {
        set({ isUploading: false, uploadProgress: 0 })
        console.error('Failed to upload document:', error)
        throw error
      }
    },

    submitAssessment: async (moduleId: string, answers: string[]) => {
      try {
        const response = await learningService.submitAssessment(moduleId, answers) as { success: boolean; data: unknown }
        
        if (response.success) {
          return response.data
        }
        
        throw new Error('Assessment submission failed')
      } catch (error) {
        console.error('Failed to submit assessment:', error)
        throw error
      }
    },

    submitEvaluation: async (moduleId: string, questionIndex: number, response: string) => {
      try {
        const result = await learningService.submitEvaluation(moduleId, questionIndex, response) as { success: boolean; data: unknown }
        
        if (result.success) {
          return result.data
        }
        
        throw new Error('Evaluation submission failed')
      } catch (error) {
        console.error('Failed to submit evaluation:', error)
        throw error
      }
    },

    fetchOngoingModules: async () => {
      try {
        const response = await apiClient.get(`${API_ENDPOINTS.LEARNING.PROGRESS}/ongoing`) as {
          success: boolean;
          data: { progressList: UserProgress[] }
        }

        if (response.success) {
          set({ ongoingModules: response.data.progressList })
        }
      } catch (error) {
        console.error('Failed to fetch ongoing modules:', error)
      }
    },

    clearCurrentModule: () => {
      const { currentModule } = get()
      if (currentModule) {
        wsService.leaveModuleRoom(currentModule.id)
      }
      set({ currentModule: null })
    },
  }))
)

// Subscribe to WebSocket events
wsService.on('module:completed', () => {
  const { fetchModules } = useLearningStore.getState()
  fetchModules()
})

wsService.on('progress:updated', (data) => {
  const state = useLearningStore.getState()
  state.updateProgress(data.moduleId, {
    sectionIndex: 0,
    completed: false,
    timeSpent: 0
  })
}) 