import React from 'react'
import { Card, CardContent, Typography, Chip, Box } from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { RoleplayScenario } from '@/services/practice'

interface ScenarioCardProps {
  scenario: RoleplayScenario
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario }) => {
  const navigate = useNavigate()
  const difficulty = scenario?.difficulty || 'Unknown'
  const title = scenario?.title || 'Untitled Scenario'
  const description = scenario?.description || 'No description available.'
  const targetCompetencies = Array.isArray(scenario?.targetCompetencies) ? scenario.targetCompetencies : []

  return (
    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
      <Card
        onClick={() => navigate(`/practice/scenarios/${scenario?.id || ''}`)}
        sx={{ borderRadius: 2, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {difficulty}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {targetCompetencies.length > 0 ? (
              <>
                {targetCompetencies.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
                {targetCompetencies.length > 3 && (
                  <Chip label={`+${targetCompetencies.length - 3}`} size="small" />
                )}
              </>
            ) : (
              <Chip label="No competencies" size="small" color="default" />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
} 