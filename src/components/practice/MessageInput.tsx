import React, { useState } from 'react'
import { Box, TextField, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

interface MessageInputProps {
  onSend: (msg: string) => void
  disabled?: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('')

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  return (
    <Box sx={{ display: 'flex', p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSend()
          }
        }}
      />
      <IconButton color="primary" onClick={handleSend} disabled={disabled || !value.trim()}>
        <SendIcon />
      </IconButton>
    </Box>
  )
} 