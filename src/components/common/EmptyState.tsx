import React from 'react'
import {
  Box,
  Typography,
  Paper,
} from '@mui/material'
import { motion } from 'framer-motion'
import { Button } from './Button'

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Icon 
            sx={{ 
              fontSize: 64, 
              color: 'text.secondary',
              opacity: 0.5 
            }} 
          />
        </Box>
        
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            mb: action || children ? 4 : 0,
            maxWidth: 400,
            mx: 'auto'
          }}
        >
          {description}
        </Typography>
        
        {action && (
          <Button
            variant="primary"
            onClick={action.onClick}
            sx={{ minWidth: 140 }}
          >
            {action.label}
          </Button>
        )}
        
        {children && (
          <Box sx={{ mt: 3 }}>
            {children}
          </Box>
        )}
      </Paper>
    </motion.div>
  )
} 