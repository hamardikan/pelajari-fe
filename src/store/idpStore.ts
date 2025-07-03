import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  idpService, 
  CompetencyFramework, 
  GapAnalysis, 
  IndividualDevelopmentPlan,
  DevelopmentGoal
} from '@/services/idp'

interface IDPState {
  // Competency Frameworks
  frameworks: CompetencyFramework[]
  currentFramework: CompetencyFramework | null
  isLoadingFrameworks: boolean

  // Gap Analysis
  gapAnalysis: GapAnalysis | null
  isAnalyzing: boolean
  analysisProgress: number

  // IDP Management
  currentIDP: IndividualDevelopmentPlan | null
  teamIDPs: IndividualDevelopmentPlan[]
  isLoadingIDP: boolean
  isGeneratingIDP: boolean

  // Development Programs
  developmentPrograms: Record<string, unknown>[]
  isLoadingPrograms: boolean

  // Analytics
  idpAnalytics: Record<string, unknown> | null
  isLoadingAnalytics: boolean

  // Actions
  // Framework actions
  fetchFrameworks: () => Promise<void>
  selectFramework: (frameworkId: string) => Promise<void>
  createFramework: (framework: Partial<CompetencyFramework>) => Promise<void>

  // Gap Analysis actions
  performGapAnalysis: (data: { frameworkFile: File, employeeFile: File }) => Promise<void>
  fetchGapAnalysis: (employeeId: string) => Promise<void>
  clearGapAnalysis: () => void

  // IDP actions
  generateIDP: (employeeId: string) => Promise<void>
  fetchIDP: (employeeId: string) => Promise<void>
  updateIDPGoal: (goalId: string, updates: Partial<DevelopmentGoal>) => Promise<void>
  approveIDP: (idpId: string) => Promise<void>
  updateIDPProgress: (idpId: string, progress: { status: string; completionPercentage: number }) => Promise<void>
  
  // Program actions
  fetchDevelopmentPrograms: (filters?: Record<string, unknown>) => Promise<void>
  
  // Analytics actions
  fetchIDPAnalytics: (filters?: Record<string, unknown>) => Promise<void>
}

export const useIDPStore = create<IDPState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    frameworks: [],
    currentFramework: null,
    isLoadingFrameworks: false,
    gapAnalysis: null,
    isAnalyzing: false,
    analysisProgress: 0,
    currentIDP: null,
    teamIDPs: [],
    isLoadingIDP: false,
    isGeneratingIDP: false,
    developmentPrograms: [],
    isLoadingPrograms: false,
    idpAnalytics: null,
    isLoadingAnalytics: false,

    // Framework actions
         fetchFrameworks: async () => {
       try {
         set({ isLoadingFrameworks: true })
         const response = await idpService.getCompetencyFrameworks()
         if (response.success && response.data) {
           set({ frameworks: response.data.frameworks })
         }
       } catch (error) {
         console.error('Failed to fetch frameworks:', error)
       } finally {
         set({ isLoadingFrameworks: false })
       }
     },

         selectFramework: async (frameworkId: string) => {
       try {
         const response = await idpService.getCompetencyFramework(frameworkId)
         if (response.success && response.data) {
           set({ currentFramework: response.data.framework })
         }
       } catch (error) {
         console.error('Failed to fetch framework:', error)
       }
     },

     createFramework: async (framework: Partial<CompetencyFramework>) => {
       try {
         const response = await idpService.createCompetencyFramework(framework)
         if (response.success && response.data) {
           set((state) => ({
             frameworks: [...state.frameworks, response.data.framework]
           }))
         }
       } catch (error) {
         console.error('Failed to create framework:', error)
         throw error
       }
     },

    // Gap Analysis actions
    performGapAnalysis: async (data: { frameworkFile: File, employeeFile: File }) => {
      try {
        set({ isAnalyzing: true, analysisProgress: 0 })

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          set((state) => ({
            analysisProgress: Math.min(state.analysisProgress + 10, 90)
          }))
        }, 500)

        const response = await idpService.performGapAnalysis(data)

        clearInterval(progressInterval)
        set({ analysisProgress: 100 })

        if (response.success) {
          set({
            gapAnalysis: response.data.analysis,
            isAnalyzing: false
          })
        }
      } catch (error) {
        console.error('Failed to perform gap analysis:', error)
        set({ isAnalyzing: false, analysisProgress: 0 })
        throw error
      }
    },

    fetchGapAnalysis: async (employeeId: string) => {
      try {
        const response = await idpService.getGapAnalysis(employeeId)
        if (response.success) {
          set({ gapAnalysis: response.data.analysis })
        }
      } catch (error) {
        console.error('Failed to fetch gap analysis:', error)
      }
    },

    clearGapAnalysis: () => {
      set({ gapAnalysis: null, analysisProgress: 0 })
    },

    // IDP actions
    generateIDP: async (employeeId: string) => {
      try {
        set({ isGeneratingIDP: true })
        
        const response = await idpService.generateIDP(employeeId)
        
        if (response.success) {
          set({ 
            currentIDP: response.data.idp,
            isGeneratingIDP: false 
          })
        }
      } catch (error) {
        console.error('Failed to generate IDP:', error)
        set({ isGeneratingIDP: false })
        throw error
      }
    },

    fetchIDP: async (employeeId: string) => {
      try {
        set({ isLoadingIDP: true })
        const response = await idpService.getIDP(employeeId)
        if (response.success) {
          set({ currentIDP: response.data.idp })
        }
      } catch (error) {
        console.error('Failed to fetch IDP:', error)
      } finally {
        set({ isLoadingIDP: false })
      }
    },

    updateIDPGoal: async (goalId: string, updates: Partial<DevelopmentGoal>) => {
      try {
        const { currentIDP } = get()
        if (!currentIDP) return

        const response = await idpService.updateIDPProgress(
          currentIDP.id, 
          {
            status: updates.status || 'in_progress',
            completionPercentage: updates.progress || 0
          }
        )

        if (response.success) {
          set((state) => ({
            currentIDP: state.currentIDP ? {
              ...state.currentIDP,
              goals: state.currentIDP.goals.map(goal =>
                goal.id === goalId ? { ...goal, ...updates } : goal
              )
            } : null
          }))
        }
      } catch (error) {
        console.error('Failed to update IDP goal:', error)
        throw error
      }
    },

    approveIDP: async (idpId: string) => {
      try {
        const response = await idpService.approveIDP(idpId)

        if (response.success) {
          set((state) => ({
            currentIDP: state.currentIDP ? {
              ...state.currentIDP,
              status: 'active'
            } : null
          }))
        }
      } catch (error) {
        console.error('Failed to approve IDP:', error)
        throw error
      }
    },

    updateIDPProgress: async (idpId: string, progress: { status: string; completionPercentage: number }) => {
      try {
        const response = await idpService.updateIDPProgress(idpId, progress)

        if (response.success) {
          set((state) => ({
            currentIDP: state.currentIDP ? {
              ...state.currentIDP,
              overallProgress: progress.completionPercentage,
              status: progress.status as any
            } : null
          }))
        }
      } catch (error) {
        console.error('Failed to update IDP progress:', error)
        throw error
      }
    },

    // Program actions
    fetchDevelopmentPrograms: async (filters?: Record<string, unknown>) => {
      try {
        set({ isLoadingPrograms: true })
        const response = await idpService.getDevelopmentPrograms(filters as Parameters<typeof idpService.getDevelopmentPrograms>[0])
        if (response.success) {
          set({ developmentPrograms: response.data.programs })
        }
      } catch (error) {
        console.error('Failed to fetch development programs:', error)
      } finally {
        set({ isLoadingPrograms: false })
      }
    },

    // Analytics actions
    fetchIDPAnalytics: async (filters?: Record<string, unknown>) => {
      try {
        set({ isLoadingAnalytics: true })
        const response = await idpService.getIDPAnalytics(filters as Parameters<typeof idpService.getIDPAnalytics>[0])
        if (response.success) {
          set({ idpAnalytics: response.data })
        }
      } catch (error) {
        console.error('Failed to fetch IDP analytics:', error)
      } finally {
        set({ isLoadingAnalytics: false })
      }
    },
  }))
) 