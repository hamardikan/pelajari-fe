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

  // 9-Box Mapping
  nineBoxData: any | null
  isLoadingNineBox: boolean

  // IDP Management
  currentIDP: IndividualDevelopmentPlan | null
  teamIDPs: IndividualDevelopmentPlan[]
  isLoadingIDP: boolean
  isGeneratingIDP: boolean

  // Generated IDs from one-shot analysis
  generatedAnalysisId: string | null
  generatedIdpId: string | null

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

  // 9-Box actions
  fetchNineBoxData: (employeeId: string) => Promise<void>
  clearNineBoxData: () => void

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

// Helper to convert API analysis format (with nested data object) to UI-friendly GapAnalysis
const flattenGapAnalysis = (apiAnalysis: any): GapAnalysis => {
  if (!apiAnalysis) return apiAnalysis

  // Real backend structure has analysis.data containing the actual data
  const analysisData = apiAnalysis.data || {}

  // Extract priority areas from gaps where priority is "High"
  const priorityAreas = analysisData.gaps
    ? analysisData.gaps
        .filter((gap: any) => gap.priority?.toLowerCase() === 'high')
        .map((gap: any) => gap.competency)
    : []

  // Create nine box position from the data
  const nineBoxPosition = {
    performance: analysisData.kpiScore >= 80 ? 'high' : analysisData.kpiScore >= 60 ? 'medium' : 'low',
    potential: analysisData.potentialScore >= 80 ? 'high' : analysisData.potentialScore >= 60 ? 'medium' : 'low',
    category: analysisData.nineBoxClassification?.toLowerCase().replace(' ', '_') || 'unknown',
    description: `${analysisData.nineBoxClassification || 'Employee'} with KPI score of ${analysisData.kpiScore || 0}% and potential score of ${analysisData.potentialScore || 0}%`,
    developmentFocus: priorityAreas.slice(0, 3) // Top 3 priority areas
  }

  // Transform gaps to match expected format
  const transformedGaps = analysisData.gaps?.map((gap: any) => ({
    competencyId: gap.competency?.toLowerCase().replace(/\s+/g, '_') || '',
    competencyName: gap.competency || '',
    category: gap.category || '',
    requiredLevel: gap.requiredLevel || '',
    currentLevel: gap.currentLevel || '',
    gapSize: gap.gapLevel || 0,
    priority: gap.priority?.toLowerCase() || 'medium',
    impactOnRole: gap.description || '',
    developmentSuggestions: [],
    description: gap.description || ''
  })) || []

  // Transform recommendations
  const transformedRecommendations = analysisData.recommendations?.map((rec: string, index: number) => ({
    type: 'training' as const,
    title: `Recommendation ${index + 1}`,
    description: rec,
    estimatedDuration: '3-6 months',
    priority: index + 1,
    resources: []
  })) || []

  return {
    id: apiAnalysis.id || '',
    employeeId: analysisData.employeeId || '',
    frameworkId: '',
    assessmentId: '',
    gaps: transformedGaps,
    overallGapScore: analysisData.overallGapScore || 0,
    priorityAreas,
    recommendations: transformedRecommendations,
    nineBoxPosition,
    createdAt: apiAnalysis.createdAt || '',
  } as GapAnalysis
}

// Helper to convert API IDP format to UI-friendly IndividualDevelopmentPlan
const flattenIDPData = (apiIDP: any): IndividualDevelopmentPlan => {
  if (!apiIDP) return apiIDP

  const idpData = apiIDP.data || {}

  // Transform development goals
  const transformedGoals = idpData.developmentGoals?.map((goal: any) => ({
    id: goal.id || '',
    competencyId: goal.competency?.toLowerCase().replace(/\s+/g, '_') || '',
    competencyName: goal.competency || '',
    currentLevel: goal.currentLevel || '',
    targetLevel: goal.targetLevel || '',
    priority: goal.priority?.toLowerCase() || 'medium',
    timeframe: goal.timeframe || '',
    activities: goal.programs?.map((program: any) => ({
      id: program.programId || '',
      type: program.type?.toLowerCase().replace(/\s+/g, '_') || 'training',
      title: program.programName || '',
      description: goal.description || '',
      resourceId: program.programId,
      estimatedHours: 40, // Default estimate
      actualHours: 0,
      status: program.status?.toLowerCase().replace(/\s+/g, '_') || 'not_started',
      completionDate: undefined,
      feedback: undefined
    })) || [],
    successMetrics: goal.successMetrics || [],
    progress: goal.programs?.reduce((acc: number, p: any) => acc + (p.completionPercentage || 0), 0) / (goal.programs?.length || 1) || 0,
    status: goal.programs?.some((p: any) => p.status === 'Completed') ? 'completed' :
            goal.programs?.some((p: any) => p.status === 'In Progress') ? 'in_progress' : 'not_started'
  })) || []

  return {
    id: apiIDP.id || '',
    employeeId: idpData.employeeId || '',
    managerId: idpData.createdBy || '',
    gapAnalysisId: idpData.gapAnalysisId || '',
    status: idpData.overallProgress?.status?.toLowerCase().replace(/\s+/g, '_') || 'draft',
    startDate: apiIDP.createdAt || new Date().toISOString(),
    targetCompletionDate: idpData.nextReviewDate || '',
    goals: transformedGoals,
    overallProgress: idpData.overallProgress?.completionPercentage || 0,
    lastUpdated: apiIDP.updatedAt || apiIDP.createdAt || '',
    approvalHistory: []
  } as IndividualDevelopmentPlan
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
    nineBoxData: null,
    isLoadingNineBox: false,
    currentIDP: null,
    teamIDPs: [],
    isLoadingIDP: false,
    isGeneratingIDP: false,
    generatedAnalysisId: null,
    generatedIdpId: null,
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

        if (response.success && response.data) {
          // New backend returns both analysisId and idpId, plus the actual data
          const responseData = response.data as any
          
          set({
            gapAnalysis: responseData.analysis ? flattenGapAnalysis(responseData.analysis) : null,
            nineBoxData: responseData.analysis?.nineBoxPosition || null,
            currentIDP: responseData.idp || null,
            generatedAnalysisId: responseData.analysisId,
            generatedIdpId: responseData.idpId,
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
        if (response.success && response.data) {
          const analysisData = flattenGapAnalysis((response.data as any).analysis)
          set({ 
            gapAnalysis: analysisData,
            nineBoxData: analysisData?.nineBoxPosition || null
          })
        }
      } catch (error) {
        console.error('Failed to fetch gap analysis:', error)
      }
    },

    clearGapAnalysis: () => {
      set({ 
        gapAnalysis: null, 
        analysisProgress: 0,
        nineBoxData: null,
        currentIDP: null,
        generatedAnalysisId: null,
        generatedIdpId: null
      })
    },

    // 9-Box actions
    fetchNineBoxData: async (employeeId: string) => {
      try {
        set({ isLoadingNineBox: true })
        // If we already have nine box data from gap analysis, use it
        const { nineBoxData } = get()
        if (nineBoxData) {
          set({ isLoadingNineBox: false })
          return
        }
        
        // Otherwise fetch gap analysis which should include nine box data
        await get().fetchGapAnalysis(employeeId)
      } catch (error) {
        console.error('Failed to fetch nine box data:', error)
      } finally {
        set({ isLoadingNineBox: false })
      }
    },

    clearNineBoxData: () => {
      set({ nineBoxData: null })
    },

    // IDP actions
    generateIDP: async (employeeId: string) => {
      try {
        set({ isGeneratingIDP: true })
        
        const response = await idpService.generateIDP(employeeId)
        
        if (response.success && response.data && (response.data as any).idp) {
          set({ 
            currentIDP: (response.data as any).idp,
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
        if (response.success && response.data) {
          set({ currentIDP: flattenIDPData((response.data as any).idp) })
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
        if (response.success && response.data) {
          set({ developmentPrograms: (response.data as any).programs })
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
        if (response.success && response.data) {
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