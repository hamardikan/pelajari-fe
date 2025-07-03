import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Box, Container, Typography } from '@mui/material'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const AuthPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2B4C5C 30%, #A8C4A2 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 1,
            }}
          >
            Pelajari
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Grow Your Skills, Naturally
          </Typography>
        </Box>

        {/* Auth Forms */}
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </Box>
      </Box>
    </Container>
  )
} 