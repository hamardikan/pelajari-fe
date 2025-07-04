import React, { useEffect, useState, ChangeEvent } from 'react'
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material'
import { usePracticeStore } from '@/store/practiceStore'
import { ScenarioCard } from '@/components/practice/ScenarioCard'
import { ContinueSessionCard } from '@/components/practice/ContinueSessionCard'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const MOCK_SCENARIOS = [
  {
    id: 'mock-1',
    title: 'Handling a Difficult Client',
    description: 'Practice managing challenging customer interactions.',
    difficulty: 'intermediate' as const,
    estimatedDuration: 15,
    targetCompetencies: ['communication', 'empathy', 'problem-solving'],
    tags: ['customer-service', 'conflict-resolution'],
    scenario: {
      context: 'You are a customer service representative...',
      setting: 'Phone call during business hours',
      yourRole: 'Senior Customer Service Representative',
      aiRole: 'Frustrated Client (Alex Thompson)',
      objectives: [
        'Acknowledge the client\'s frustration',
        'Gather detailed information',
        'Provide clear action plan',
      ],
      successCriteria: [
        'Client feels heard and understood',
        'Professional tone maintained',
      ],
    },
  },
  {
    id: 'mock-2',
    title: 'Team Standup Leadership',
    description: 'Lead a daily standup meeting with your team.',
    difficulty: 'beginner' as const,
    estimatedDuration: 10,
    targetCompetencies: ['leadership', 'communication'],
    tags: ['teamwork', 'leadership'],
    scenario: {
      context: 'You are leading a daily standup...',
      setting: 'Morning team meeting',
      yourRole: 'Team Lead',
      aiRole: 'Team Members',
      objectives: [
        'Facilitate updates',
        'Encourage participation',
      ],
      successCriteria: [
        'All members share updates',
        'Meeting stays on time',
      ],
    },
  },
]

export const PracticePage: React.FC = () => {
  const { scenarios, isLoadingScenarios, fetchScenarios, activeRoleplaySession, fetchActiveSession } = usePracticeStore()
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScenarios().catch(() => setError('Failed to load scenarios.'))
    fetchActiveSession()
  }, [])

  const handleFilterChange = () => {
    fetchScenarios({ search, difficulty }).catch(() => setError('Failed to load scenarios.'))
  }

  const scenarioList = scenarios.length === 0 ? MOCK_SCENARIOS : scenarios

  return (
    <Box sx={{ py: 4 }}>
      {activeRoleplaySession && (
        <ContinueSessionCard activeSession={activeRoleplaySession} />
      )}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Practice Scenarios
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="diff-label">Difficulty</InputLabel>
          <Select
            labelId="diff-label"
            label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
        <Box>
          <Typography
            component="button"
            onClick={handleFilterChange}
            sx={{ cursor: 'pointer', color: 'primary.main', mt: 1.25 }}
          >
            Apply Filters
          </Typography>
        </Box>
      </Box>

      {error && <EmptyState title="Error" description={error} icon={ErrorOutlineIcon} />}
      {isLoadingScenarios ? (
        <Loading fullHeight message="Loading scenarios..." />
      ) : scenarioList.length === 0 ? (
        <EmptyState
          title="No Scenarios Found"
          description="There are no practice scenarios available. Please check back later."
          icon={InfoOutlinedIcon}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {scenarioList.map((sc) => (
            <ScenarioCard key={sc.id} scenario={sc} />
          ))}
        </Box>
      )}
    </Box>
  )
} 