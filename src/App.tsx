import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Layout } from '@/components/layout'
import {
  AuthPage,
  DashboardPage,
  LearningPage,
  ModuleDetailPage,
  PracticePage,
  ProgressPage,
  ProfilePage,
  IDPPage,
  ScenarioDetailPage,
  RoleplaySessionPage,
} from '@/pages'
import { ROUTES } from '@/utils/constants'

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return <>{children}</>
}

// Public Route component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  
  return <>{children}</>
}

function App() {
  // Initialize WebSocket connection when authenticated
  useWebSocket()

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth/*"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                  <Route path={ROUTES.LEARNING} element={<LearningPage />} />
                  <Route path="/learning/:moduleId" element={<ModuleDetailPage />} />
                  <Route path={ROUTES.PRACTICE} element={<PracticePage />} />
                  <Route path={ROUTES.PRACTICE_SCENARIO} element={<ScenarioDetailPage />} />
                  <Route path={ROUTES.PRACTICE_SESSION} element={<RoleplaySessionPage />} />
                  <Route path={ROUTES.PROGRESS} element={<ProgressPage />} />
                  <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                  <Route path={ROUTES.IDP} element={<IDPPage />} />
                  <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            style: {
              background: '#A8C4A2',
            },
          },
          error: {
            style: {
              background: '#f44336',
            },
          },
        }}
      />
    </>
  )
}

export default App
