import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  subtitle?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid`,
          borderColor: `${color}.main`,
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon && (
          <Box sx={{ mr: 2, color: `${color}.main`, fontSize: 32 }}>{icon}</Box>
        )}
        <CardContent sx={{ flexGrow: 1, p: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 