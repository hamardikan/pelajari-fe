import React from 'react'
import { Box, Typography } from '@mui/material'

export const ProgressPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Progress Tracking
      </Typography>
      <Typography variant="body1" color="text.secondary">
        View your learning progress, achievements, and analytics. Detailed charts and metrics coming soon.
      </Typography>
    </Box>
  )
} 