import React from 'react'
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material'
import { useLearningStore } from '@/store/learningStore'
import { usePracticeStore } from '@/store/practiceStore'
import { motion } from 'framer-motion'

export const RecentActivity: React.FC = () => {
  const { userProgress } = useLearningStore()
  const { sessionEvaluation } = usePracticeStore()

  const activities: { id: string; text: string; date: string }[] = []

  userProgress
    .filter(p => p.status === 'completed')
    .slice(-3)
    .forEach(p => {
      activities.push({
        id: p.id,
        text: `Completed module ${p.moduleId}`,
        date: p.progress.completedAt || '',
      })
    })

  if (sessionEvaluation) {
    activities.push({
      id: 'session-' + Date.now(),
      text: `Finished practice session with score ${sessionEvaluation.overallScore}`,
      date: new Date().toISOString(),
    })
  }

  if (activities.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Recent Activity
        </Typography>
        <List>
          {activities.map(act => (
            <ListItem key={act.id} sx={{ py: 0 }}>
              <ListItemText primary={act.text} secondary={new Date(act.date).toLocaleDateString()} />
            </ListItem>
          ))}
        </List>
      </Box>
    </motion.div>
  )
} 