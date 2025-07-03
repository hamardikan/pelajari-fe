import React from 'react'
import { Box, Chip } from '@mui/material'
import { WifiOff, Queue } from '@mui/icons-material'
import { usePracticeStore } from '@/store/practiceStore'

export const OfflineIndicator: React.FC = () => {
  const { isOnline, offlineQueueSize } = usePracticeStore()

  if (isOnline && offlineQueueSize === 0) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {!isOnline && (
        <Chip
          icon={<WifiOff />}
          label="Offline Mode"
          color="warning"
          variant="filled"
          sx={{ fontWeight: 'bold' }}
        />
      )}
      
      {offlineQueueSize > 0 && (
        <Chip
          icon={<Queue />}
          label={`${offlineQueueSize} message${offlineQueueSize > 1 ? 's' : ''} queued`}
          color="info"
          variant="filled"
          sx={{ fontWeight: 'bold' }}
        />
      )}
    </Box>
  )
} 