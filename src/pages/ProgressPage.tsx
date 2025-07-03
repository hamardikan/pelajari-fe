import React from 'react'
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

const modulesCompletedData = [
  { category: 'Technical', completed: 8 },
  { category: 'Leadership', completed: 5 },
  { category: 'Communication', completed: 7 },
]

const assessmentScoresData = [
  { date: 'Week 1', score: 70 },
  { date: 'Week 2', score: 80 },
  { date: 'Week 3', score: 85 },
  { date: 'Week 4', score: 90 },
  { date: 'Week 5', score: 88 },
]

const radarData = [
  { skill: 'Leadership', current: 3, target: 5 },
  { skill: 'Communication', current: 4, target: 5 },
  { skill: 'Technical', current: 5, target: 5 },
  { skill: 'Teamwork', current: 4, target: 5 },
  { skill: 'Problem Solving', current: 3, target: 5 },
]

const achievements = [
  { label: '7-Day Learning Streak', icon: <EmojiEventsIcon color="warning" /> },
  { label: 'Completed 10 Modules', icon: <EmojiEventsIcon color="success" /> },
  { label: 'First Practice Session', icon: <EmojiEventsIcon color="primary" /> },
]

export const ProgressPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Progress Tracking
      </Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
      }}>
        <Paper sx={{ p: 2, height: 320 }}>
          <Typography variant="h6" gutterBottom>
            Modules Completed by Category
          </Typography>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={modulesCompletedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#8884d8" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2, height: 320 }}>
          <Typography variant="h6" gutterBottom>
            Assessment Scores Over Time
          </Typography>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={assessmentScoresData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#82ca9d" name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2, height: 320 }}>
          <Typography variant="h6" gutterBottom>
            Competency Growth
          </Typography>
          <ResponsiveContainer width="100%" height="80%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="Current" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Target" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2, height: 320 }}>
          <Typography variant="h6" gutterBottom>
            Achievements
          </Typography>
          <List>
            {achievements.map((ach, idx) => (
              <ListItem key={idx}>
                <ListItemIcon>{ach.icon}</ListItemIcon>
                <ListItemText primary={ach.label} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  )
} 