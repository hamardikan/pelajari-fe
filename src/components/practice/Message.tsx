import React from 'react'
import { Box, Typography } from '@mui/material'
import { SessionMessage } from '@/services/practice'

interface MessageProps {
  message: SessionMessage
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user'
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Box
        sx={{
          backgroundColor: isUser ? 'primary.main' : 'grey.200',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          px: 2,
          py: 1,
          borderRadius: 2,
          maxWidth: '70%',
        }}
      >
        <Typography variant="body2">{message.content}</Typography>
      </Box>
    </Box>
  )
} 