import React, { useMemo } from 'react'
import { Box, Card, CardContent, Typography, LinearProgress, Button as MuiButton } from '@mui/material'
import { useLearningStore } from '@/store/learningStore'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'

export const ContinueLearning: React.FC = () => {
  const { modules, userProgress } = useLearningStore()
  const navigate = useNavigate()

  const nextModule = useMemo(() => {
    // Find module in progress; else recommend first module
    const inProgress = userProgress.find(p => p.status === 'in_progress')
    if (inProgress) {
      const moduleInfo = modules.find(m => m.id === inProgress.moduleId)
      return { module: moduleInfo, progress: inProgress }
    }
    // Recommend first module
    if (modules.length > 0) {
      return { module: modules[0], progress: null }
    }
    return null
  }, [modules, userProgress])

  if (!nextModule) return null

  const { module, progress } = nextModule

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {progress ? 'Continue Learning' : 'Recommended Module'}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {module?.title}
          </Typography>
          {progress && (
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
          )}
          <MuiButton variant="contained" color="primary" onClick={() => navigate(`/learning/${module?.id}`)}>
            {progress ? 'Resume' : 'Start Learning'}
          </MuiButton>
        </CardContent>
      </Card>
    </motion.div>
  )
} 