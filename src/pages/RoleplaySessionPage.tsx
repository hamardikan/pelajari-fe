import React, { useEffect, useRef } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate } from 'react-router'
import { usePracticeStore } from '@/store/practiceStore'
import { Loading } from '@/components/common/Loading'
import { Message } from '@/components/practice/Message'
import { MessageInput } from '@/components/practice/MessageInput'
import { EvaluationReport } from '@/components/practice/EvaluationReport'
import { OfflineIndicator } from '@/components/practice/OfflineIndicator'

export const RoleplaySessionPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    currentSession,
    messages,
    isSessionActive,
    isLoadingSession,
    sendMessage,
    endSession,
    sessionEvaluation,
    clearSession,
  } = usePracticeStore()

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentSession && !isLoadingSession) {
      // Ideally fetch session details; here redirect back
      navigate('/practice')
    }
  }, [currentSession, isLoadingSession])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleEnd = async () => {
    await endSession()
  }

  const handleClose = () => {
    clearSession()
    navigate('/practice')
  }

  if (!currentSession) return <Loading message="Loading session..." fullHeight />

  if (sessionEvaluation) {
    return (
      <Box sx={{ py: 2 }}>
        <IconButton onClick={handleClose} sx={{ position: 'fixed', top: 16, right: 16 }}>
          <CloseIcon />
        </IconButton>
        <EvaluationReport evaluation={sessionEvaluation} />
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <OfflineIndicator />
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Roleplay Session</Typography>
        <IconButton onClick={handleEnd} disabled={!isSessionActive}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      {isSessionActive && <MessageInput onSend={sendMessage} />}
    </Box>
  )
} 