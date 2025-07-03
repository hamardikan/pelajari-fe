import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material'

export const ProfilePage: React.FC = () => {
  const [editMode, setEditMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Software Engineer',
  })

  const handleChange = (field: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [field]: e.target.value })
  }

  const handleToggleEdit = () => {
    setEditMode((prev) => !prev)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Cover + Avatar */}
      <Box
        sx={{
          height: 180,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #2B4C5C 0%, #6E8B9B 100%)',
          position: 'relative',
          mb: 10,
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
            },
            color: 'white',
          }}
        >
          <CameraIcon />
        </IconButton>
        <Avatar
          src={`https://i.pravatar.cc/200?u=${profile.email}`}
          alt={profile.name}
          sx={{
            width: 128,
            height: 128,
            position: 'absolute',
            bottom: -64,
            left: 32,
            border: '4px solid',
            borderColor: 'background.paper',
          }}
        />
      </Box>

      {/* Profile Info Card */}
      <Card sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Personal Information
            </Typography>
            <IconButton onClick={handleToggleEdit} color="primary">
              {editMode ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Full Name"
              value={profile.name}
              onChange={handleChange('name')}
              disabled={!editMode}
              fullWidth
            />
            <TextField
              label="Email"
              value={profile.email}
              onChange={handleChange('email')}
              disabled={!editMode}
              fullWidth
            />
            <TextField
              label="Role / Title"
              value={profile.role}
              onChange={handleChange('role')}
              disabled={!editMode}
              fullWidth
            />
          </Box>

          {editMode && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleToggleEdit}>
                Save Changes
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Preferences
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
            label="Enable Dark Mode"
          />
        </CardContent>
      </Card>
    </Box>
  )
} 