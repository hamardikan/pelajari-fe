import { apiClient } from './api'
import { ApiResponse } from '@/types'

export interface CompetencyFramework {
  id: string
  jobTitle: string
  department: string
  managerialCompetencies: Competency[]
  functionalCompetencies: Competency[]
  behavioralCompetencies: Competency[]
  createdAt: string
  updatedAt: string
}

export interface Competency {
  id: string
  name: string
  description: string
  expectedLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
  category: 'managerial' | 'functional' | 'behavioral'
  weight: number
  metrics: string[]
}

export interface EmployeeAssessment {
  id: string
  employeeId: string
  assessorId: string
  competencyScores: CompetencyScore[]
  overallScore: number
  assessmentDate: string
  notes: string
  status: 'draft' | 'submitted' | 'approved'
}

export interface CompetencyScore {
  competencyId: string
  currentLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
  score: number
  evidence: string[]
  assessorNotes: string
}

export interface GapAnalysis {
  id: string
  employeeId: string
  frameworkId: string
  assessmentId: string
  gaps: CompetencyGap[]
  overallGapScore: number
  priorityAreas: string[]
  recommendations: Recommendation[]
  nineBoxPosition: NineBoxPosition
  createdAt: string
}

export interface CompetencyGap {
  competencyId: string
  competencyName: string
  category: string
  requiredLevel: string
  currentLevel: string
  gapSize: number
  priority: 'high' | 'medium' | 'low'
  impactOnRole: string
  developmentSuggestions: string[]
  description: string
}

export interface Recommendation {
  type: 'training' | 'mentoring' | 'project' | 'certification'
  title: string
  description: string
  estimatedDuration: string
  priority: number
  resources: Resource[]
}

export interface Resource {
  id: string
  type: 'module' | 'scenario' | 'external' | 'mentor'
  title: string
  url?: string
  description: string
}

export interface NineBoxPosition {
  performance: 'low' | 'medium' | 'high'
  potential: 'low' | 'medium' | 'high'
  category: string
  description: string
  developmentFocus: string[]
}

export interface IndividualDevelopmentPlan {
  id: string
  employeeId: string
  managerId: string
  gapAnalysisId: string
  status: 'draft' | 'active' | 'completed' | 'on_hold'
  startDate: string
  targetCompletionDate: string
  goals: DevelopmentGoal[]
  overallProgress: number
  lastUpdated: string
  approvalHistory: ApprovalRecord[]
}

export interface DevelopmentGoal {
  id: string
  competencyId: string
  competencyName: string
  currentLevel: string
  targetLevel: string
  priority: 'high' | 'medium' | 'low'
  timeframe: string
  activities: DevelopmentActivity[]
  successMetrics: string[]
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
}

export interface DevelopmentActivity {
  id: string
  type: 'training' | 'mentoring' | 'project' | 'reading' | 'certification'
  title: string
  description: string
  resourceId?: string
  estimatedHours: number
  actualHours?: number
  status: 'not_started' | 'in_progress' | 'completed'
  completionDate?: string
  feedback?: string
}

export interface ApprovalRecord {
  id: string
  approverId: string
  approverName: string
  action: 'submitted' | 'approved' | 'rejected' | 'modified'
  comments: string
  timestamp: string
}

class IDPService {
  // Competency Framework Management
  async getCompetencyFrameworks() {
    try {
      const response = await apiClient.get('/api/idp/frameworks') as { data: { frameworks: CompetencyFramework[] } }
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch frameworks:', error)
      return { success: false, error }
    }
  }

  async getCompetencyFramework(frameworkId: string) {
    try {
      const response = await apiClient.get(`/api/idp/frameworks/${frameworkId}`) as { data: { framework: CompetencyFramework } }
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch framework:', error)
      return { success: false, error }
    }
  }

  async createCompetencyFramework(framework: Partial<CompetencyFramework>) {
    try {
      const response = await apiClient.post('/api/idp/frameworks', framework) as { data: { framework: CompetencyFramework } }
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to create framework:', error)
      return { success: false, error }
    }
  }

  // Gap Analysis
  async performGapAnalysis(data: {
    frameworkFile: File
    employeeFile: File
    employeeId?: string
    metadata?: Record<string, unknown> | string
  }) {
    try {
        const formData = new FormData()
        formData.append('frameworkFile', data.frameworkFile)
        formData.append('employeeFile', data.employeeFile)

        if (data.employeeId) {
          formData.append('employeeId', data.employeeId)
        }

        if (data.metadata) {
          const metaValue = typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata)
          formData.append('metadata', metaValue)
        }

        const response = await apiClient.post<ApiResponse<{ 
          analysisId: string
          idpId: string
          status: string
          message: string
          analysis?: GapAnalysis
          idp?: IndividualDevelopmentPlan
        }>>('/api/idp/gap-analysis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to perform gap analysis:', error)
      return { success: false, error }
    }
  }

  async getGapAnalysis(employeeId: string) {
    try {
      const response = await apiClient.get<ApiResponse<{ analysis: GapAnalysis }>>(`/api/idp/gap-analysis/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch gap analysis:', error)
      return { success: false, error }
    }
  }

  // Nine Box Grid
  async mapToNineBox(employeeId: string, data: { kpiScore: number; assessmentScore: number }) {
    try {
      const response = await apiClient.post<ApiResponse<{ classification: string }>>(`/api/idp/employees/${employeeId}/nine-box`, data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to map to nine box:', error)
      return { success: false, error }
    }
  }

  // IDP Management
  async generateIDP(employeeId: string) {
    try {
      const response = await apiClient.post<ApiResponse<{ idpId: string; idp?: IndividualDevelopmentPlan; status: string; message: string }>>(`/api/idp/generate/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to generate IDP:', error)
      return { success: false, error }
    }
  }

  async getIDP(employeeId: string) {
    try {
      const response = await apiClient.get<ApiResponse<{ idp: IndividualDevelopmentPlan }>>(`/api/idp/employees/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch IDP:', error)
      return { success: false, error }
    }
  }

  async approveIDP(idpId: string) {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(`/api/idp/${idpId}/approve`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to approve IDP:', error)
      return { success: false, error }
    }
  }

  async updateIDPProgress(idpId: string, progress: {
    status: string
    completionPercentage: number
  }) {
    try {
      const response = await apiClient.put<ApiResponse<{ progress: number }>>(`/api/idp/${idpId}/progress`, progress)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to update IDP progress:', error)
      return { success: false, error }
    }
  }

  async updateIDP(idpId: string, updates: Partial<IndividualDevelopmentPlan>) {
    try {
      const response = await apiClient.put<ApiResponse<{ idp: IndividualDevelopmentPlan }>>(`/api/idp/${idpId}`, updates)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to update IDP:', error)
      return { success: false, error }
    }
  }

  // Impact Measurement
  async measureIDPImpact(employeeId: string) {
    try {
      const response = await apiClient.get<ApiResponse<{ impact: unknown }>>(`/api/idp/employees/${employeeId}/impact`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to measure IDP impact:', error)
      return { success: false, error }
    }
  }

  // Development Programs
  async getDevelopmentPrograms(filters?: {
    competency?: string
    type?: string
    difficulty?: string
  }) {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
      }
      const response = await apiClient.get<ApiResponse<{ programs: any[] }>>(`/api/idp/programs?${params}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch development programs:', error)
      return { success: false, error }
    }
  }

  async createDevelopmentProgram(program: {
    name: string
    type: string
    description: string
    targetCompetencies: string[]
    duration: string
    difficulty: string
    format: string
    cost?: number
  }) {
    try {
      const response = await apiClient.post<ApiResponse<{ programId: string }>>('/api/idp/programs', program)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to create development program:', error)
      return { success: false, error }
    }
  }

  // Reports and Analytics
  async getIDPAnalytics(filters?: {
    department?: string
    dateRange?: { start: string; end: string }
    managerId?: string
  }) {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            if (typeof value === 'object') {
              params.append(key, JSON.stringify(value))
            } else {
              params.append(key, value)
            }
          }
        })
      }
      const response = await apiClient.get<ApiResponse<{ analytics: unknown }>>(`/api/idp/analytics?${params}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch IDP analytics:', error)
      return { success: false, error }
    }
  }

  async exportIDPReport(employeeId: string, format: 'pdf' | 'excel') {
    try {
      const response = await apiClient.get<ApiResponse<Blob>>(`/api/idp/employees/${employeeId}/export`, {
        params: { format },
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to export IDP report:', error)
      return { success: false, error }
    }
  }
}

export const idpService = new IDPService() 