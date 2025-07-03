import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
} from '@mui/material'
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import { NAVIGATION_ITEMS } from '@/utils/constants'

const iconMap = {
  home: HomeIcon,
  school: SchoolIcon,
  chat: ChatIcon,
  trending_up: TrendingUpIcon,
  person: PersonIcon,
  assignment: AssignmentIcon,
}

export const BottomNavigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()

  const currentPath = location.pathname
  const currentIndex = NAVIGATION_ITEMS.findIndex(item => 
    currentPath.startsWith(item.path)
  )

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    const item = NAVIGATION_ITEMS[newValue]
    if (item) {
      navigate(item.path)
    }
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar + 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      elevation={3}
    >
      <MuiBottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={handleChange}
        showLabels
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            padding: '8px 12px',
            '&.Mui-selected': {
              color: 'primary.main',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 600,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
            },
          },
        }}
      >
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap]
          return (
            <BottomNavigationAction
              key={item.id}
              label={item.label}
              icon={<IconComponent />}
            />
          )
        })}
      </MuiBottomNavigation>
    </Paper>
  )
} 