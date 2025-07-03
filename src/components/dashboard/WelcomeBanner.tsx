import React from 'react'
import { Box, Typography } from '@mui/material'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'

export const WelcomeBanner: React.FC = () => {
  const { user } = useAuthStore()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {greeting}, {user?.name || 'Learner'}! 🌱
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ready to grow your skills today?
        </Typography>
      </Box>
    </motion.div>
  )
} 