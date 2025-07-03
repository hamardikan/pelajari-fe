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
} from '@mui/material'
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Assignment as IDPIcon,
  Search as AnalysisIcon,
  CloudUpload as UploadIcon,
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
    currentIDP,
    isAnalyzing,
    isGeneratingIDP,
    isLoadingIDP,
    fetchGapAnalysis,
    fetchIDP,
    generateIDP,
    clearGapAnalysis,
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
      setCurrentTab(2) // Switch to IDP tab
    } catch (error) {
      console.error('Failed to generate IDP:', error)
    }
  }

  const tabs = [
    { label: 'Overview', icon: AnalyticsIcon },
    { label: 'Gap Analysis', icon: AnalysisIcon },
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
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Gap Analysis Results
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
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
                    
                    <Typography variant="body2" color="text.secondary">
                      {gapAnalysis.overallGapScore >= 70 ? 'Strong competency alignment' :
                       gapAnalysis.overallGapScore >= 50 ? 'Moderate development needed' :
                       'Significant gaps identified'}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Priority Development Areas
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {gapAnalysis.priorityAreas.map((area, index) => (
                        <Chip
                          key={index}
                          label={area}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={handleGenerateIDP}
                      disabled={isGeneratingIDP}
                      fullWidth
                      startIcon={isGeneratingIDP ? <Loading /> : <IDPIcon />}
                    >
                      {isGeneratingIDP ? 'Generating...' : 'Generate Development Plan'}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
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
        if (isLoadingIDP || isGeneratingIDP) {
          return <Loading message={isGeneratingIDP ? "Generating your development plan..." : "Loading development plan..."} />
        }
        
        if (currentIDP) {
          return (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Development Plan
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
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

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Development Goals
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {currentIDP.goals.slice(0, 3).map((goal) => (
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
                            {goal.currentLevel} → {goal.targetLevel}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Progress: {goal.progress}%
                            </Typography>
                            <Chip
                              label={goal.status.replace('_', ' ')}
                              size="small"
                              color={goal.status === 'completed' ? 'success' : goal.status === 'in_progress' ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      ))}
                      
                      {currentIDP.goals.length > 3 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                          +{currentIDP.goals.length - 3} more goals
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
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
                ? "Generate your Individual Development Plan based on the gap analysis results."
                : "Complete a gap analysis first to generate your development plan."
            }
            action={
              gapAnalysis ? {
                label: 'Generate IDP',
                onClick: handleGenerateIDP,
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
      {currentTab === 1 && !gapAnalysis && !isAnalyzing && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={handleStartGapAnalysis}
          aria-label="Start gap analysis"
        >
          <AddIcon />
        </Fab>
      )}

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
  const { gapAnalysis, currentIDP } = useIDPStore()
  
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Development Overview
      </Typography>
      
      {!gapAnalysis && !currentIDP && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome to your Individual Development Plan dashboard. Start by performing a competency gap analysis to identify your development opportunities.
        </Alert>
      )}
      
      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
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
              Gap Analysis Status
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {gapAnalysis ? 'Complete' : 'Pending'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {gapAnalysis ? 'Analysis completed' : 'Start your competency assessment'}
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
              {currentIDP ? `${currentIDP.goals.length} development goals` : 'Generate your development plan'}
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
      
      {/* Recent Activity */}
      {currentIDP && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Activity
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentIDP.goals.slice(0, 3).map((goal) => (
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
                    {goal.currentLevel} → {goal.targetLevel}
                  </Typography>
                </Box>
                <Typography variant="body2" color="primary">
                  {goal.progress}% complete
                </Typography>
              </Box>
            ))}
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
  const [frameworkFile, setFrameworkFile] = useState<File | null>(null)
  const [employeeFile, setEmployeeFile] = useState<File | null>(null)
  const { performGapAnalysis, isAnalyzing, analysisProgress } = useIDPStore()

  const onDropFramework = (acceptedFiles: File[]) => {
    setFrameworkFile(acceptedFiles[0])
  }

  const onDropEmployee = (acceptedFiles: File[]) => {
    setEmployeeFile(acceptedFiles[0])
  }

  const { getRootProps: getFrameworkRootProps, getInputProps: getFrameworkInputProps, isDragActive: isFrameworkDragActive } = useDropzone({ 
    onDrop: onDropFramework,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    }
  })
  
  const { getRootProps: getEmployeeRootProps, getInputProps: getEmployeeInputProps, isDragActive: isEmployeeDragActive } = useDropzone({ 
    onDrop: onDropEmployee,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    }
  })

  const handleSubmit = async () => {
    if (frameworkFile && employeeFile) {
      try {
        await performGapAnalysis({ frameworkFile, employeeFile })
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Framework File
            </Typography>
            
            <Box
              {...getFrameworkRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isFrameworkDragActive ? 'primary.main' : frameworkFile ? 'success.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isFrameworkDragActive ? 'primary.50' : frameworkFile ? 'success.50' : 'grey.50',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
            >
              <input {...getFrameworkInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              {frameworkFile ? (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {frameworkFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(frameworkFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    Drop framework file here, or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports JSON, CSV, Excel, PDF, DOCX files
                  </Typography>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Employee Assessment File
            </Typography>
            
            <Box
              {...getEmployeeRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isEmployeeDragActive ? 'primary.main' : employeeFile ? 'success.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isEmployeeDragActive ? 'primary.50' : employeeFile ? 'success.50' : 'grey.50',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
            >
              <input {...getEmployeeInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              {employeeFile ? (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {employeeFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(employeeFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    Drop employee file here, or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports JSON, CSV, Excel, PDF, DOCX files
                  </Typography>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

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
          disabled={!frameworkFile || !employeeFile}
          startIcon={<AnalysisIcon />}
        >
          Start Analysis
        </Button>
      </Box>
    </Box>
  )
} 