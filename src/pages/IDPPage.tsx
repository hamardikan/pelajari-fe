import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Fab,
  Dialog,
  DialogContent,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button,
  Grid,
} from '@mui/material'
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Assignment as IDPIcon,
  Search as AnalysisIcon,
  CloudUpload as UploadIcon,
  GridView as NineBoxIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useIDPStore } from '@/store/idpStore'
import { useAuthStore } from '@/store/authStore'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'

export const IDPPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [showGapAnalysis, setShowGapAnalysis] = useState(false)

  const { user } = useAuthStore()
  const {
    gapAnalysis,
    nineBoxData,
    currentIDP,
    isAnalyzing,
    isGeneratingIDP,
    isLoadingIDP,
    isLoadingNineBox,
    fetchGapAnalysis,
    fetchIDP,
    fetchNineBoxData,
    generateIDP,
    clearGapAnalysis,
    performGapAnalysis,
    analysisProgress,
  } = useIDPStore()

  useEffect(() => {
    if (user) {
      // Load existing data
      fetchGapAnalysis(user.id)
      fetchIDP(user.id)
    }
  }, [user, fetchGapAnalysis, fetchIDP])

  const handleStartGapAnalysis = () => {
    clearGapAnalysis()
    setShowGapAnalysis(true)
  }

  const handleGapAnalysisComplete = () => {
    setShowGapAnalysis(false)
    setCurrentTab(1) // Switch to gap analysis results tab
  }

  const handleGenerateIDP = async () => {
    if (!user) return
    
    try {
      await generateIDP(user.id)
      setCurrentTab(3) // Switch to IDP tab (now tab 3 instead of 2)
    } catch (error) {
      console.error('Failed to generate IDP:', error)
    }
  }

  const tabs = [
    { label: 'Overview', icon: AnalyticsIcon },
    { label: 'Gap Analysis', icon: AnalysisIcon },
    { label: '9-Box Mapping', icon: NineBoxIcon },
    { label: 'Development Plan', icon: IDPIcon },
  ]

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <IDPOverview />
      
      case 1:
        if (isAnalyzing) {
          return <Loading message="Analyzing competency gaps..." variant="linear" />
        }
        
        if (gapAnalysis) {
          return (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Gap Analysis Results
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, mb: 4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: gapAnalysis.overallGapScore >= 70 ? 'success.main' : 
                                 gapAnalysis.overallGapScore >= 50 ? 'warning.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h3" color="white" sx={{ fontWeight: 700 }}>
                        {gapAnalysis.overallGapScore}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Overall Gap Score
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {gapAnalysis.overallGapScore >= 70 ? 'Strong competency alignment' :
                       gapAnalysis.overallGapScore >= 50 ? 'Moderate development needed' :
                       'Significant gaps identified'}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Analysis Date: {new Date(gapAnalysis.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Priority Development Areas ({gapAnalysis.priorityAreas.length})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {gapAnalysis.priorityAreas.map((area, index) => (
                        <Chip
                          key={index}
                          label={area}
                          color="error"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={() => setCurrentTab(2)} // Go to 9-Box tab
                      fullWidth
                      startIcon={<NineBoxIcon />}
                    >
                      View 9-Box Mapping
                    </Button>
                  </CardContent>
                </Card>
              </Box>

              {/* Detailed Gap Analysis */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Competency Gap Details
              </Typography>

              <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
                {gapAnalysis.gaps.map((gap, index) => (
                  <Card key={index} sx={{ border: `2px solid ${
                    gap.priority === 'high' ? '#f44336' : 
                    gap.priority === 'medium' ? '#ff9800' : '#4caf50'
                  }20` }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {gap.competencyName}
                          </Typography>
                          <Chip
                            label={gap.category}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={`${gap.priority} Priority`}
                            size="small"
                            color={gap.priority === 'high' ? 'error' : gap.priority === 'medium' ? 'warning' : 'success'}
                            variant="filled"
                          />
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            Gap Level: {gap.gapSize}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {gap.currentLevel} → {gap.requiredLevel}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {gap.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Recommendations */}
              {gapAnalysis.recommendations.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Development Recommendations
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {gapAnalysis.recommendations.map((recommendation, index) => (
                      <Alert key={index} severity="info">
                        <Typography variant="body2">
                          {recommendation.description}
                        </Typography>
                      </Alert>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )
        }
        
        return (
          <EmptyState
            icon={AnalysisIcon}
            title="No Gap Analysis Found"
            description="Start by performing a competency gap analysis to identify development opportunities."
            action={{
              label: 'Start Gap Analysis',
              onClick: handleStartGapAnalysis,
            }}
          />
        )
      
      case 2:
        // 9-Box Mapping Tab
        if (isLoadingNineBox) {
          return <Loading message="Loading 9-box mapping..." variant="linear" />
        }
        
        if (nineBoxData || gapAnalysis?.nineBoxPosition) {
          return <NineBoxDisplay nineBoxData={nineBoxData || gapAnalysis?.nineBoxPosition} />
        }
        
        return (
          <EmptyState
            icon={IDPIcon}
            title="No 9-Box Mapping Found"
            description={
              gapAnalysis 
                ? "9-Box mapping data is not available. This should have been generated with the gap analysis."
                : "Complete a gap analysis first to generate your 9-box mapping."
            }
            action={
              gapAnalysis ? {
                label: 'Generate Development Plan',
                onClick: handleGenerateIDP,
              } : {
                label: 'Start Gap Analysis',
                onClick: handleStartGapAnalysis,
              }
            }
          />
        )
      
      case 3:
        // Development Plan Tab (moved from case 2 to case 3)
        if (isLoadingIDP || isGeneratingIDP) {
          return <Loading message={isGeneratingIDP ? "Generating your development plan..." : "Loading development plan..."} />
        }
        
        if (currentIDP) {
          return (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Individual Development Plan
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, mb: 4 }}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Plan Overview
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Overall Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(currentIDP.overallProgress)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={currentIDP.overallProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {currentIDP.goals.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Goals
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {currentIDP.goals.filter(g => g.status === 'completed').length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Status: <strong>{currentIDP.status}</strong>
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Next Review: {new Date(currentIDP.targetCompletionDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Goal Summary
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {currentIDP.goals.slice(0, 4).map((goal) => (
                        <Box
                          key={goal.id}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {goal.competencyName}
                            </Typography>
                            <Chip
                              label={goal.priority}
                              size="small"
                              color={goal.priority === 'high' ? 'error' : goal.priority === 'medium' ? 'warning' : 'success'}
                              variant="outlined"
                            />
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {goal.currentLevel} → {goal.targetLevel} • {goal.timeframe}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {goal.activities.length} programs
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {goal.progress}% complete
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      
                      {currentIDP.goals.length > 4 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                          +{currentIDP.goals.length - 4} more goals
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Detailed Development Goals */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Detailed Development Goals
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {currentIDP.goals.map((goal, index) => (
                  <Card key={goal.id}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Goal {index + 1}: {goal.competencyName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip
                              label={`${goal.priority} Priority`}
                              size="small"
                              color={goal.priority === 'high' ? 'error' : goal.priority === 'medium' ? 'warning' : 'success'}
                              variant="filled"
                            />
                            <Chip
                              label={goal.timeframe}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`${goal.currentLevel} → ${goal.targetLevel}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {goal.progress}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                        </Box>
                      </Box>

                      {/* Development Programs */}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Development Programs ({goal.activities.length})
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
                        {goal.activities.map((activity) => (
                          <Box
                            key={activity.id}
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              bgcolor: 'grey.50',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {activity.title}
                              </Typography>
                              <Chip
                                label={activity.status.replace('_', ' ')}
                                size="small"
                                color={activity.status === 'completed' ? 'success' : activity.status === 'in_progress' ? 'primary' : 'default'}
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {activity.type.replace('_', ' ')} • Est. {activity.estimatedHours} hours
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Success Metrics */}
                      {goal.successMetrics.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Success Metrics
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {goal.successMetrics.map((metric, metricIndex) => (
                              <Box key={metricIndex} sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  •
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {metric}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )
        }
        
        return (
          <EmptyState
            icon={IDPIcon}
            title="No Development Plan Found"
            description={
              gapAnalysis 
                ? "Your development plan should have been automatically generated. If you don't see it, try refreshing or contact support."
                : "Complete a gap analysis first to generate your development plan."
            }
            action={
              gapAnalysis ? {
                label: 'Refresh Data',
                onClick: () => fetchIDP(user?.id || ''),
              } : {
                label: 'Start Gap Analysis',
                onClick: handleStartGapAnalysis,
              }
            }
          />
        )
      
      default:
        return null
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Individual Development Plan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plan and track your professional development journey
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={<tab.icon />}
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button */}
      { !isAnalyzing && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1500 }}
          onClick={handleStartGapAnalysis}
          aria-label="Upload new analysis"
        >
          <UploadIcon />
        </Fab>
      ) }

      {/* Gap Analysis Dialog */}
      <Dialog
        open={showGapAnalysis}
        onClose={() => setShowGapAnalysis(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={window.innerWidth < 768}
      >
        <DialogContent sx={{ p: 0 }}>
          <GapAnalysisUpload
            onComplete={handleGapAnalysisComplete}
            onCancel={() => setShowGapAnalysis(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

// IDP Overview Component (restored from previous UI)
const IDPOverview: React.FC = () => {
  const { gapAnalysis, nineBoxData, currentIDP } = useIDPStore()
  
  // Extract employee info from gap analysis
  const employeeInfo = gapAnalysis ? {
    name: (gapAnalysis as any).data?.employeeName || 'Employee',
    jobTitle: (gapAnalysis as any).data?.jobTitle || 'Position',
    classification: (gapAnalysis as any).data?.nineBoxClassification || 'Not Classified'
  } : null

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Development Overview
      </Typography>
      
      {employeeInfo && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            {employeeInfo.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {employeeInfo.jobTitle} • {employeeInfo.classification}
          </Typography>
        </Box>
      )}
      
      {!gapAnalysis && !currentIDP && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome to your Individual Development Plan dashboard. Start by performing a competency gap analysis to identify your development opportunities. The system will automatically generate your 9-box mapping and complete development plan in one go!
        </Alert>
      )}
      
      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2B4C5C15 0%, #A8C4A205 100%)',
              border: '1px solid #2B4C5C20',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Gap Analysis
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {gapAnalysis ? `${gapAnalysis.overallGapScore}%` : 'Pending'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {gapAnalysis ? `Overall gap score` : 'Start your competency assessment'}
            </Typography>
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FF980015 0%, #A8C4A205 100%)',
              border: '1px solid #FF980020',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              9-Box Mapping
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {nineBoxData || gapAnalysis?.nineBoxPosition ? 'Complete' : 'Pending'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {nineBoxData || gapAnalysis?.nineBoxPosition ? 'Performance mapping done' : 'Generated with gap analysis'}
            </Typography>
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #A8C4A215 0%, #2B4C5C05 100%)',
              border: '1px solid #A8C4A220',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Development Plan
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
              {currentIDP ? currentIDP.status : 'Not Started'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentIDP ? `${currentIDP.goals.length} development goals` : 'Auto-generated with analysis'}
            </Typography>
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #F4A26115 0%, #A8C4A205 100%)',
              border: '1px solid #F4A26120',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Progress
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {currentIDP ? `${Math.round(currentIDP.overallProgress)}%` : '0%'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Overall completion rate
            </Typography>
          </Box>
        </motion.div>
      </Box>
      
      {/* High Priority Gaps Quick View */}
      {gapAnalysis && gapAnalysis.priorityAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            High Priority Development Areas
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {gapAnalysis.priorityAreas.slice(0, 6).map((area, index) => (
              <Chip
                key={index}
                label={area}
                color="error"
                variant="outlined"
                size="medium"
              />
            ))}
          </Box>
        </motion.div>
      )}
      
      {/* Process Flow Indicator */}
      {(gapAnalysis || currentIDP) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Development Journey
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <Chip 
              label="Gap Analysis" 
              color={gapAnalysis ? 'success' : 'default'} 
              variant={gapAnalysis ? 'filled' : 'outlined'} 
            />
            <Typography>→</Typography>
            <Chip 
              label="9-Box Mapping" 
              color={nineBoxData || gapAnalysis?.nineBoxPosition ? 'success' : 'default'} 
              variant={nineBoxData || gapAnalysis?.nineBoxPosition ? 'filled' : 'outlined'} 
            />
            <Typography>→</Typography>
            <Chip 
              label="Development Plan" 
              color={currentIDP ? 'success' : 'default'} 
              variant={currentIDP ? 'filled' : 'outlined'} 
            />
          </Box>
        </motion.div>
      )}
      
      {/* Recent Activity */}
      {currentIDP && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Development Goals Summary
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentIDP.goals.slice(0, 4).map((goal) => (
              <Box
                key={goal.id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {goal.competencyName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {goal.currentLevel} → {goal.targetLevel} • {goal.timeframe}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={goal.priority}
                    size="small"
                    color={goal.priority === 'high' ? 'error' : goal.priority === 'medium' ? 'warning' : 'success'}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                    {goal.progress}% complete
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {currentIDP.goals.length > 4 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                +{currentIDP.goals.length - 4} more goals
              </Typography>
            )}
          </Box>
        </motion.div>
      )}
    </Box>
  )
}

// New Gap Analysis Upload Component (integrated into the previous UI design)
const GapAnalysisUpload: React.FC<{
  onComplete: () => void
  onCancel: () => void
}> = ({ onComplete, onCancel }) => {
  const [files, setFiles] = useState<File[]>([])
  const { performGapAnalysis, fetchGapAnalysis, fetchIDP, isAnalyzing, analysisProgress } = useIDPStore()
  const { user } = useAuthStore()

  const onDropFiles = (accepted: File[]) => {
    const unique = [...files, ...accepted].slice(0, 2) // keep max 2
    setFiles(unique)
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop: onDropFiles,
    multiple: true,
    maxFiles: 2,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
  })

  const handleSubmit = async () => {
    if (files.length === 2) {
      try {
        await performGapAnalysis({ frameworkFile: files[0], employeeFile: files[1] })
        // Refetch latest data to ensure consistency
        if (user) {
          await Promise.all([
            fetchGapAnalysis(user.id),
            fetchIDP(user.id)
          ])
        }
        onComplete()
      } catch (error) {
        console.error('Gap analysis failed:', error)
      }
    }
  }

  if (isAnalyzing) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <AnalysisIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Analyzing Competency Gaps
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We're processing your framework and employee data to identify development opportunities.
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={analysisProgress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            mb: 2,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            },
          }} 
        />
        <Typography variant="body2" color="text.secondary">
          {analysisProgress}% Complete
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Competency Gap Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload your competency framework and employee assessment files to identify skill gaps and development opportunities.
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Upload Framework & Employee Files (Max 2 files)
          </Typography>

          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive || files.length === 2 ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'primary.50' : files.length === 2 ? 'success.50' : 'grey.50',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            {files.length > 0 ? (
              <>
                {files.map((file, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                ))}
                {files.length < 2 && (
                  <Typography variant="body2" color="text.secondary">
                    Add one more file...
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  Drop up to 2 files here, or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports JSON, CSV, Excel, PDF, DOCX files
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={files.length < 2}
          startIcon={<AnalysisIcon />}
        >
          Start Analysis
        </Button>
      </Box>
    </Box>
  )
}

// 9-Box Display Component
const NineBoxDisplay: React.FC<{
  nineBoxData: any
}> = ({ nineBoxData }) => {
  if (!nineBoxData) {
    return (
      <EmptyState
        icon={NineBoxIcon}
        title="No 9-Box Data Available"
        description="9-Box mapping data is not available."
      />
    )
  }

  const getPositionColor = (performance: string, potential: string) => {
    if (performance === 'high' && potential === 'high') return '#4CAF50' // Green - Star
    if ((performance === 'high' && potential === 'medium') || 
        (performance === 'medium' && potential === 'high')) return '#FF9800' // Orange - Key Player
    if (performance === 'medium' && potential === 'medium') return '#FFC107' // Yellow - Core Player
    if (performance === 'low' || potential === 'low') return '#F44336' // Red - Question Mark/Poor Performer
    return '#9E9E9E' // Gray - default
  }

  const getPositionLabel = (performance: string, potential: string) => {
    if (performance === 'high' && potential === 'high') return 'Star'
    if (performance === 'medium' && potential === 'high') return 'High Potential'
    if (performance === 'low' && potential === 'high') return 'Potential Gem'

    if (performance === 'high' && potential === 'medium') return 'High Performer'
    if (performance === 'medium' && potential === 'medium') return 'Core Player'
    if (performance === 'low' && potential === 'medium') return 'Inconsistent Player'

    if (performance === 'high' && potential === 'low') return 'Solid Performer'
    if (performance === 'medium' && potential === 'low') return 'Average Performer'
    if (performance === 'low' && potential === 'low') return 'Risk'

    return 'Unknown'
  }

  // Calculate grid position (0-2 for both axes)
  const getGridPosition = (level: string) => {
    switch (level) {
      case 'low': return 0
      case 'medium': return 1
      case 'high': return 2
      default: return 1
    }
  }

  const performancePos = getGridPosition(nineBoxData.performance)
  const potentialPos = getGridPosition(nineBoxData.potential)

  // Grid labels for the 9-box
  const gridLabels = [
    // Row index 0 -> low potential
    ['Risk', 'Average Performer', 'Solid Performer'],
    // Row index 1 -> moderate potential
    ['Inconsistent Player', 'Core Player', 'High Performer'],
    // Row index 2 -> high potential
    ['Potential Gem', 'High Potential', 'Star']
  ]

  const gridColors = [
    ['#F44336', '#FF5722', '#FF9800'],
    ['#FF5722', '#FFC107', '#FF9800'],
    ['#8BC34A', '#4CAF50', '#2E7D32']
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          9-Box Performance & Potential Mapping
        </Typography>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
        {/* 9-Box Grid */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Performance vs Potential Matrix
            </Typography>
            
            {/* Grid Container */}
            <Box sx={{ position: 'relative', mx: 'auto', maxWidth: 500 }}>
              {/* Y-axis label */}
              <Box
                sx={{
                  position: 'absolute',
                  left: -40,
                  top: '50%',
                  transform: 'rotate(-90deg) translateY(-50%)',
                  transformOrigin: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'text.secondary',
                  whiteSpace: 'nowrap'
                }}
              >
                POTENTIAL
              </Box>
              
              {/* Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  gap: 1,
                  aspectRatio: '1',
                  border: '2px solid #ddd',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {[2, 1, 0].map((potRow) =>
                  [0, 1, 2].map((perfCol) => {
                    const isUserPosition = potRow === potentialPos && perfCol === performancePos
                    return (
                      <Box
                        key={`${potRow}-${perfCol}`}
                        sx={{
                          position: 'relative',
                          bgcolor: gridColors[potRow][perfCol] + '20',
                          border: isUserPosition ? `3px solid ${gridColors[potRow][perfCol]}` : '1px solid #ddd',
                          borderRadius: 1,
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 80,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: gridColors[potRow][perfCol] + '30',
                          }
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: isUserPosition ? 600 : 400,
                            color: isUserPosition ? gridColors[potRow][perfCol] : 'text.secondary',
                            textAlign: 'center',
                            fontSize: isUserPosition ? '0.75rem' : '0.7rem'
                          }}
                        >
                          {gridLabels[potRow][perfCol]}
                        </Typography>
                        
                        {isUserPosition && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: gridColors[potRow][perfCol],
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)', opacity: 1 },
                                '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                                '100%': { transform: 'scale(1)', opacity: 1 }
                              }
                            }}
                          />
                        )}
                      </Box>
                    )
                  })
                )}
              </Box>
              
              {/* X-axis label */}
              <Box
                sx={{
                  textAlign: 'center',
                  mt: 2,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'text.secondary'
                }}
              >
                PERFORMANCE
              </Box>
              
              {/* Axis indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 1 }}>
                <Typography variant="caption" color="text.secondary">Low</Typography>
                <Typography variant="caption" color="text.secondary">Medium</Typography>
                <Typography variant="caption" color="text.secondary">High</Typography>
              </Box>
              
              {/* Y-axis indicators */}
              <Box sx={{ position: 'absolute', left: -30, top: 0, height: '100%', display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ transform: 'rotate(-90deg)' }}>Low</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ transform: 'rotate(-90deg)' }}>Med</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ transform: 'rotate(-90deg)' }}>High</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        {/* Summary Card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: getPositionColor(nineBoxData.performance, nineBoxData.potential),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <NineBoxIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {getPositionLabel(nineBoxData.performance, nineBoxData.potential)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {nineBoxData.description || 'Performance and potential assessment'}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'capitalize' }}>
                  {nineBoxData.performance}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Performance
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', textTransform: 'capitalize' }}>
                  {nineBoxData.potential}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Potential
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Development Focus
            </Typography>
            
            {nineBoxData.developmentFocus && nineBoxData.developmentFocus.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {nineBoxData.developmentFocus.map((focus: string, index: number) => (
                  <Chip
                    key={index}
                    label={focus}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No specific development focus areas identified.
              </Typography>
            )}
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recommended Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {nineBoxData.category === 'star' && (
                <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                  <strong>Star:</strong> Maintain engagement with stretch assignments and succession planning.
                </Alert>
              )}
              {nineBoxData.category === 'high_potential' && (
                <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                  <strong>High Potential:</strong> Focus on performance acceleration initiatives.
                </Alert>
              )}
              {nineBoxData.category === 'potential_gem' && (
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  <strong>Potential Gem:</strong> Provide coaching and targeted performance improvement.
                </Alert>
              )}
              {nineBoxData.performance === 'high' && nineBoxData.potential === 'high' && (
                <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                  <strong>Star:</strong> Continue with stretch assignments and succession planning.
                </Alert>
              )}
              {nineBoxData.performance === 'medium' && nineBoxData.potential === 'high' && (
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  <strong>High Potential:</strong> Focus on performance improvement and experiential learning.
                </Alert>
              )}
              {nineBoxData.performance === 'high' && nineBoxData.potential === 'medium' && (
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  <strong>High Performer:</strong> Provide mentoring opportunities and lateral growth.
                </Alert>
              )}
              {nineBoxData.performance === 'medium' && nineBoxData.potential === 'medium' && (
                <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                  <strong>Core Player:</strong> Focus on skill development and performance improvement.
                </Alert>
              )}
              {(nineBoxData.performance === 'low' || nineBoxData.potential === 'low') && (
                <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
                  <strong>Development Needed:</strong> Establish immediate performance improvement plan.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
} 