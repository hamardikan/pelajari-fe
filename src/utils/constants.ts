export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  LEARNING: {
    MODULES: '/api/learning/modules',
    PROGRESS: '/api/learning/progress',
    ASSESSMENTS: '/api/learning/assessments',
  },
  PRACTICE: {
    SCENARIOS: '/api/roleplay/scenarios',
    SESSIONS: '/api/roleplay/sessions',
  },
  IDP: {
    FRAMEWORKS: '/api/idp/frameworks',
    FRAMEWORK_DETAILS: (id: string) => `/api/idp/frameworks/${id}`,
    GAP_ANALYSIS: '/api/idp/gap-analysis',
    EMPLOYEE_ANALYSIS: (employeeId: string) => `/api/idp/gap-analysis/${employeeId}`,
    GENERATE: '/api/idp/generate',
    PLANS: (employeeId: string) => `/api/idp/plans/${employeeId}`,
    UPDATE_PROGRESS: (idpId: string, goalId: string) => `/api/idp/plans/${idpId}/goals/${goalId}/progress`,
    APPROVE: (idpId: string) => `/api/idp/plans/${idpId}/approve`,
    DEVELOPMENT_PROGRAMS: '/api/idp/development-programs',
    ANALYTICS: '/api/idp/analytics',
  },
  DOCUMENTS: '/api/documents',
} as const

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  LEARNING: '/learning',
  LEARNING_MODULE: '/learning/:moduleId',
  PRACTICE: '/practice',
  PRACTICE_SCENARIO: '/practice/scenarios/:scenarioId',
  PRACTICE_SESSION: '/practice/sessions/:sessionId',
  PROGRESS: '/progress',
  PROFILE: '/profile',
  IDP: '/idp',
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'pelajari_auth_token',
  REFRESH_TOKEN: 'pelajari_refresh_token',
  USER_DATA: 'pelajari_user_data',
  THEME: 'pelajari_theme',
} as const

export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', path: ROUTES.DASHBOARD },
  { id: 'learn', label: 'Learn', icon: 'school', path: ROUTES.LEARNING },
  { id: 'practice', label: 'Practice', icon: 'chat', path: ROUTES.PRACTICE },
  { id: 'idp', label: 'Development', icon: 'assignment', path: ROUTES.IDP },
  { id: 'progress', label: 'Progress', icon: 'trending_up', path: ROUTES.PROGRESS },
  { id: 'profile', label: 'Profile', icon: 'person', path: ROUTES.PROFILE },
] as const

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const 