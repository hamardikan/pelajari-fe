import React from 'react'
import { Box, useTheme } from '@mui/material'
import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: 10, // Always leave space for bottom nav
          pt: 2,
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '1280px',
          mx: 'auto',
          width: '100%',
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation (Always visible, styled for desktop) */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.appBar + 1,
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', sm: 480, md: 640 },
            maxWidth: '100vw',
            borderRadius: { xs: 0, sm: 3 },
            overflow: 'hidden',
            boxShadow: { xs: 3, sm: 6 },
            mb: { xs: 0, sm: 2 },
          }}
        >
          <BottomNavigation />
        </Box>
      </Box>
    </Box>
  )
} 