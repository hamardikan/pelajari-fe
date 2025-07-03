import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { StatsCard } from './StatsCard'
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Chat as ChatIcon,
  Assignment as IDPIcon,
} from '@mui/icons-material'
import { useLearningStore } from '@/store/learningStore'
import { usePracticeStore } from '@/store/practiceStore'
import { useIDPStore } from '@/store/idpStore'

export const QuickStatsGrid: React.FC = () => {
  const { userProgress } = useLearningStore()
  const { currentSession } = usePracticeStore()
  const { currentIDP } = useIDPStore()

  const stats = useMemo(() => {
    const modulesCompleted = userProgress.filter(p => p.status === 'completed').length
    const modulesInProgress = userProgress.filter(p => p.status === 'in_progress').length

    return [
      {
        title: 'Modules Completed',
        value: modulesCompleted,
        icon: <SchoolIcon />,
        color: 'success' as const,
      },
      {
        title: 'Modules In Progress',
        value: modulesInProgress,
        icon: <TrendingUpIcon />,
        color: 'primary' as const,
      },
      {
        title: 'Active Practice',
        value: currentSession ? '1 Active' : 'None',
        icon: <ChatIcon />,
        color: 'warning' as const,
      },
      {
        title: 'Development Plan',
        value: currentIDP ? currentIDP.status : 'Not Started',
        icon: <IDPIcon />,
        color: 'info' as const,
      },
    ]
  }, [userProgress, currentSession, currentIDP])

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        mb: 4,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </Box>
  )
} 