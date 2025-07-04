import React from 'react'
import { Box, Card, CardContent, Typography, LinearProgress, Button as MuiButton } from '@mui/material'
import { useNavigate } from 'react-router'
import { UserProgress } from '@/services/learning'
import { useLearningStore } from '@/store/learningStore'

interface OngoingModulesSectionProps {
  ongoingModules: UserProgress[]
}

export const OngoingModulesSection: React.FC<OngoingModulesSectionProps> = ({ ongoingModules }) => {
  const { modules } = useLearningStore()
  const navigate = useNavigate()

  if (ongoingModules.length === 0) return null

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Continue Learning
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {ongoingModules.map((progress) => {
          const module = modules.find((m) => m.id === progress.moduleId)
          return (
            <Card key={progress.id} sx={{ flex: '1 1 280px', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  In Progress
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {module?.title ?? 'Untitled Module'}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress.progress.completionPercentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(progress.progress.completionPercentage)}% completed
                  </Typography>
                </Box>
                {progress.progress.startedAt && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Last accessed: {new Date(progress.progress.startedAt).toLocaleDateString()}
                  </Typography>
                )}
                <MuiButton variant="contained" color="primary" onClick={() => navigate(`/learning/${progress.moduleId}`)}>
                  Continue Learning
                </MuiButton>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
} 