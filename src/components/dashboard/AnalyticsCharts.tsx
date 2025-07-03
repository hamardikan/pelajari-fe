import React from 'react'
import {
  Box,
  Paper,
  Typography,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { useLearningStore } from '@/store/learningStore'
import { useIDPStore } from '@/store/idpStore'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export const AnalyticsCharts: React.FC = () => {
  const { modules, userProgress } = useLearningStore()
  const { currentIDP } = useIDPStore()

  // Learning progress data
  const learningProgressData = modules.map((module) => {
    const progress = userProgress.find(p => p.moduleId === module.id)
    return {
      name: module.title,
      progress: progress?.progress.completionPercentage || 0,
      completed: progress?.status === 'completed' ? 100 : (progress?.progress.completionPercentage || 0),
    }
  })

  // Practice performance data (mock data for now)
  const practicePerformanceData = [
    { month: 'Jan', sessions: 12, avgScore: 75 },
    { month: 'Feb', sessions: 18, avgScore: 82 },
    { month: 'Mar', sessions: 15, avgScore: 78 },
    { month: 'Apr', sessions: 22, avgScore: 85 },
    { month: 'May', sessions: 20, avgScore: 88 },
    { month: 'Jun', sessions: 25, avgScore: 90 },
  ]

  // Competency distribution - using goals from IDP
  const goals = currentIDP?.goals || []
  const competencyDistribution = goals.reduce((acc: Record<string, number>, goal) => {
    const category = goal.competencyName.split(' ')[0] // Simple category extraction
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const competencyPieData = Object.entries(competencyDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  // Competency radar data
  const competencyRadarData = goals.slice(0, 8).map((goal) => ({
    subject: goal.competencyName,
    current: parseInt(goal.currentLevel) || 1,
    target: parseInt(goal.targetLevel) || 3,
  }))

  // Learning activity timeline
  const activityTimeline = [
    { date: 'Week 1', modules: 3, practice: 5 },
    { date: 'Week 2', modules: 2, practice: 8 },
    { date: 'Week 3', modules: 4, practice: 6 },
    { date: 'Week 4', modules: 1, practice: 10 },
    { date: 'Week 5', modules: 3, practice: 7 },
    { date: 'Week 6', modules: 2, practice: 9 },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Learning Progress */}
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Learning Progress
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, pb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={learningProgressData} margin={{ bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
                <Bar dataKey="progress" fill="#8884d8" name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Practice Performance */}
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Practice Performance
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, pb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={practicePerformanceData} margin={{ bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sessions"
                  stroke="#8884d8"
                  name="Sessions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#82ca9d"
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Competency Distribution */}
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Competency Distribution
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, pb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ bottom: 32 }}>
                <Pie
                  data={competencyPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {competencyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Competency Radar */}
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Competency Assessment
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, pb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyRadarData} margin={{ bottom: 32 }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar
                  name="Current Level"
                  dataKey="current"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target Level"
                  dataKey="target"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Activity Timeline */}
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column', gridColumn: { xs: '1', md: '1 / -1' } }}>
          <Typography variant="h6" gutterBottom>
            Learning Activity Timeline
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, pb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTimeline} margin={{ bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
                <Line
                  type="monotone"
                  dataKey="modules"
                  stroke="#8884d8"
                  name="Modules Completed"
                />
                <Line
                  type="monotone"
                  dataKey="practice"
                  stroke="#82ca9d"
                  name="Practice Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
} 