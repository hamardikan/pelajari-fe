import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  Button as MuiButton,
  Card,
  CardContent,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router'
import { usePracticeStore } from '@/store/practiceStore'
import { Loading } from '@/components/common/Loading'

export const ScenarioDetailPage: React.FC = () => {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const {
    currentScenario,
    selectScenario,
    startSession,
    isLoadingSession,
  } = usePracticeStore()

  useEffect(() => {
    if (scenarioId) {
      selectScenario(scenarioId)
    }
  }, [scenarioId])

  const handleStart = async () => {
    if (!currentScenario) return
    try {
      await startSession(currentScenario.id)
      navigate(`/practice/sessions/${currentScenario.id}`)
    } catch (e) {
      console.error(e)
    }
  }

  if (!currentScenario) return <Loading message="Loading scenario..." fullHeight />

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        {currentScenario.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Difficulty: {currentScenario.difficulty}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentScenario.description}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Target Competencies
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {currentScenario.targetCompetencies.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
      </Box>

      <MuiButton
        variant="contained"
        color="primary"
        onClick={handleStart}
        disabled={isLoadingSession}
      >
        {isLoadingSession ? 'Starting...' : 'Start Practice'}
      </MuiButton>
    </Box>
  )
} 