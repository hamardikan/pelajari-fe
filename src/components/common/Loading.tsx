import React from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import { motion } from 'framer-motion'

interface LoadingProps {
  message?: string
  progress?: number
  variant?: 'circular' | 'linear'
  size?: 'small' | 'medium' | 'large'
  fullHeight?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  progress,
  variant = 'circular',
  size = 'medium',
  fullHeight = false,
}) => {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  }

  const containerHeight = fullHeight ? '50vh' : 'auto'
  const minHeight = fullHeight ? '300px' : '200px'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          height: containerHeight,
          minHeight: minHeight,
        }}
      >
        {variant === 'circular' ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <CircularProgress 
              size={sizeMap[size]} 
              thickness={4}
              sx={{ mb: 3 }}
            />
          </motion.div>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
            <LinearProgress 
              variant={progress !== undefined ? 'determinate' : 'indeterminate'}
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}
        
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: 'text.secondary',
            textAlign: 'center',
            mb: progress !== undefined && variant === 'linear' ? 2 : 0,
          }}
        >
          {message}
        </Typography>
        
        {progress !== undefined && variant === 'linear' && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            {Math.round(progress)}% complete
          </Typography>
        )}
      </Box>
    </motion.div>
  )
} 