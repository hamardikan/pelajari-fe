import { apiClient } from './api'

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
    employeeId: string
    frameworkFile?: File
    employeeFile?: File
    frameworkData?: Record<string, unknown>
    employeeData?: Record<string, unknown>
  }) {
    try {
      if (data.frameworkFile || data.employeeFile) {
        const formData = new FormData()
        if (data.frameworkFile) formData.append('frameworkFile', data.frameworkFile)
        if (data.employeeFile) formData.append('employeeFile', data.employeeFile)
        if (data.frameworkData) formData.append('frameworkData', JSON.stringify(data.frameworkData))
        if (data.employeeData) formData.append('employeeData', JSON.stringify(data.employeeData))
        formData.append('employeeId', data.employeeId)

        const response = await apiClient.post('/api/idp/gap-analysis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        return { success: true, data: response.data }
      } else {
        const response = await apiClient.post('/api/idp/gap-analysis', {
          employeeId: data.employeeId,
          frameworkData: data.frameworkData,
          employeeData: data.employeeData,
        })
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Failed to perform gap analysis:', error)
      return { success: false, error }
    }
  }

  async getGapAnalysis(employeeId: string) {
    try {
      const response = await apiClient.get(`/api/idp/gap-analysis/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch gap analysis:', error)
      return { success: false, error }
    }
  }

  // Nine Box Grid
  async mapToNineBox(employeeId: string, data: { kpiScore: number; assessmentScore: number }) {
    try {
      const response = await apiClient.post(`/api/idp/employees/${employeeId}/nine-box`, data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to map to nine box:', error)
      return { success: false, error }
    }
  }

  // IDP Management
  async generateIDP(employeeId: string) {
    try {
      const response = await apiClient.post(`/api/idp/generate/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to generate IDP:', error)
      return { success: false, error }
    }
  }

  async getIDP(employeeId: string) {
    try {
      const response = await apiClient.get(`/api/idp/employees/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch IDP:', error)
      return { success: false, error }
    }
  }

  async updateIDP(idpId: string, updates: Partial<IndividualDevelopmentPlan>) {
    try {
      const response = await apiClient.put(`/api/idp/${idpId}`, updates)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to update IDP:', error)
      return { success: false, error }
    }
  }

  async approveIDP(idpId: string, data: { managerId: string; comments: string }) {
    try {
      const response = await apiClient.put(`/api/idp/${idpId}/approve`, data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to approve IDP:', error)
      return { success: false, error }
    }
  }

  async updateIDPProgress(idpId: string, goalId: string, progress: {
    status: string
    completionPercentage: number
    notes?: string
  }) {
    try {
      const response = await apiClient.put(`/api/idp/${idpId}/goals/${goalId}/progress`, progress)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to update IDP progress:', error)
      return { success: false, error }
    }
  }

  // Impact Measurement
  async measureIDPImpact(employeeId: string) {
    try {
      const response = await apiClient.get(`/api/idp/employees/${employeeId}/impact`)
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
      const response = await apiClient.get(`/api/idp/programs?${params}`)
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
      const response = await apiClient.post('/api/idp/programs', program)
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
      const response = await apiClient.get(`/api/idp/analytics?${params}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch IDP analytics:', error)
      return { success: false, error }
    }
  }

  async exportIDPReport(employeeId: string, format: 'pdf' | 'excel') {
    try {
      const response = await apiClient.get(`/api/idp/employees/${employeeId}/export`, {
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