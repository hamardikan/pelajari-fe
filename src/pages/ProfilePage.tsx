import React from 'react'
import { Box, Typography } from '@mui/material'

export const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Profile Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage your profile, account settings, and preferences. Full profile management coming soon.
      </Typography>
    </Box>
  )
} 