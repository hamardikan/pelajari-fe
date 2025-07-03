import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Divider,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  PlayArrow as NextIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

interface ModuleSection {
  id?: string
  title: string
  content: string
  order?: number
  type?: string
}

interface SectionViewerProps {
  section: ModuleSection
  onComplete: () => void
  isActive: boolean
}

export const SectionViewer: React.FC<SectionViewerProps> = ({
  section,
  onComplete,
  isActive,
}) => {
  const [isCompleted, setIsCompleted] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!isActive) return

    // Simulate reading progress based on time spent
    const interval = setInterval(() => {
      const timeSpent = Date.now() - startTime
      const estimatedReadingTime = section.content.length * 50 // ~50ms per character
      const progress = Math.min((timeSpent / estimatedReadingTime) * 100, 100)
      setReadingProgress(progress)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, section.content.length, startTime])

  const handleComplete = () => {
    setIsCompleted(true)
    onComplete()
  }

  const renderContent = (content: string) => {
    // Basic markdown-like rendering
    const paragraphs = content.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      // Handle headers
      if (paragraph.startsWith('# ')) {
        return (
          <Typography key={index} variant="h4" sx={{ mb: 2, mt: 3 }}>
            {paragraph.substring(2)}
          </Typography>
        )
      }
      if (paragraph.startsWith('## ')) {
        return (
          <Typography key={index} variant="h5" sx={{ mb: 2, mt: 2 }}>
            {paragraph.substring(3)}
          </Typography>
        )
      }
      if (paragraph.startsWith('### ')) {
        return (
          <Typography key={index} variant="h6" sx={{ mb: 1, mt: 2 }}>
            {paragraph.substring(4)}
          </Typography>
        )
      }

      // Handle bullet points
      if (paragraph.includes('• ') || paragraph.includes('- ')) {
        const items = paragraph.split(/[•-]/).filter(item => item.trim())
        return (
          <Box key={index} sx={{ mb: 2 }}>
            {items.map((item, itemIndex) => (
              <Typography key={itemIndex} variant="body1" sx={{ mb: 0.5, ml: 2 }}>
                • {item.trim()}
              </Typography>
            ))}
          </Box>
        )
      }

      // Regular paragraph
      return (
        <Typography key={index} variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
          {paragraph}
        </Typography>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Reading Progress */}
        {isActive && !isCompleted && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Reading Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(readingProgress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={readingProgress}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        )}

        {/* Content */}
        <Box sx={{ mb: 4 }}>
          {renderContent(section.content)}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {!isCompleted ? (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleComplete}
              disabled={readingProgress < 80} // Require 80% reading progress
            >
              Mark as Complete
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
              <CheckIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Section Completed</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </motion.div>
  )
} 