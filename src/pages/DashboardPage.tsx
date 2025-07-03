import React, { useEffect } from 'react'
import { Box } from '@mui/material'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { QuickStatsGrid } from '@/components/dashboard/QuickStatsGrid'
import { ContinueLearning } from '@/components/dashboard/ContinueLearning'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { useLearningStore } from '@/store/learningStore'
import { usePracticeStore } from '@/store/practiceStore'
import { useIDPStore } from '@/store/idpStore'

export const DashboardPage: React.FC = () => {
  const { fetchModules } = useLearningStore()
  const { fetchScenarios } = usePracticeStore()
  const { fetchFrameworks } = useIDPStore()

  useEffect(() => {
    fetchModules()
    fetchScenarios()
    fetchFrameworks()
  }, [])

  return (
    <Box sx={{ py: 2 }}>
      <WelcomeBanner />
      <QuickStatsGrid />
      <ContinueLearning />
      <RecentActivity />
      <AnalyticsCharts />
    </Box>
  )
} 