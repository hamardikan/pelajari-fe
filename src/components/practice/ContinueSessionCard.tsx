import React from 'react'
import { Card, CardContent, Typography, Button as MuiButton } from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { RoleplaySession } from '@/services/practice'

interface ContinueSessionCardProps {
  activeSession: RoleplaySession & { scenarioTitle?: string }
}

export const ContinueSessionCard: React.FC<ContinueSessionCardProps> = ({ activeSession }) => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Active Roleplay Session
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {activeSession.scenarioTitle ?? 'Roleplay Session'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Started at: {new Date(activeSession.startedAt).toLocaleString()}
          </Typography>
          <MuiButton
            variant="contained"
            color="primary"
            onClick={() => navigate(`/practice/sessions/${activeSession.id}`)}
          >
            Continue Session
          </MuiButton>
        </CardContent>
      </Card>
    </motion.div>
  )
} 