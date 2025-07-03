import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  Timer as TimerIcon,
  Speed as DifficultyIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useLearningStore } from '@/store/learningStore'
import { Button as CustomButton } from '@/components/common/Button'
import { Loading } from '@/components/common/Loading'
import { SectionViewer } from '@/components/learning/SectionViewer'
import { AssessmentQuiz } from '@/components/learning/AssessmentQuiz'
import { EvaluationForm } from '@/components/learning/EvaluationForm'
import { FlashcardDeck } from '@/components/learning/FlashcardDeck'

export const ModuleDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  
  const {
    currentModule,
    userProgress,
    isLoadingModules,
    selectModule,
    startModule,
    updateProgress,
    submitAssessment,
    clearCurrentModule,
  } = useLearningStore()

  const [activeStep, setActiveStep] = useState(0)
  const [showAssessment, setShowAssessment] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  // Get current module progress
  const moduleProgress = userProgress.find(p => p.moduleId === moduleId)

  useEffect(() => {
    if (moduleId) {
      selectModule(moduleId)
    }
    
    return () => {
      clearCurrentModule()
    }
  }, [moduleId, selectModule, clearCurrentModule])

  useEffect(() => {
    // Update time spent every 30 seconds
    const interval = setInterval(() => {
      if (isStarted && moduleId) {
        const currentTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
        setTimeSpent(currentTimeSpent)
        
        updateProgress(moduleId, {
          sectionIndex: activeStep,
          completed: false,
          timeSpent: currentTimeSpent,
        }).catch(console.error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isStarted, sessionStartTime, activeStep, moduleId, updateProgress])

  const handleStartModule = async () => {
    if (!moduleId) return
    
    try {
      await startModule(moduleId)
      setIsStarted(true)
      setSessionStartTime(Date.now())
    } catch (error) {
      console.error('Failed to start module:', error)
    }
  }

  const handleSectionComplete = async (sectionIndex: number) => {
    if (!moduleId) return
    
    try {
      const currentTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
      
      await updateProgress(moduleId, {
        sectionIndex,
        completed: true,
        timeSpent: currentTimeSpent,
      })
      
      // Move to next step
      if (sectionIndex < (currentModule?.content.sections.length || 0) - 1) {
        setActiveStep(sectionIndex + 1)
      } else {
        // All sections completed, show assessment
        setShowAssessment(true)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleAssessmentComplete = async (answers: string[]) => {
    if (!moduleId) return
    
    try {
      await submitAssessment(moduleId, answers)
      setShowAssessment(false)
      
      // Show evaluation if available
      if (currentModule?.content.evaluation.length) {
        setShowEvaluation(true)
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error)
    }
  }

  const handleEvaluationComplete = () => {
    setShowEvaluation(false)
    // Module completed - could show completion screen or redirect
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'error'
      default: return 'default'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (isLoadingModules) {
    return <Loading />
  }

  if (!currentModule) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Module not found
        </Typography>
        <CustomButton
          variant="outline"
          onClick={() => navigate('/learning')}
          sx={{ mt: 2 }}
        >
          Back to Learning
        </CustomButton>
      </Box>
    )
  }

  const completionPercentage = moduleProgress?.progress.completionPercentage || 0
  const isCompleted = moduleProgress?.status === 'completed'

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/learning')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
            {currentModule.title}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {currentModule.summary}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <Chip
            icon={<DifficultyIcon />}
            label={currentModule.difficulty}
            color={getDifficultyColor(currentModule.difficulty)}
            variant="outlined"
          />
          <Chip
            icon={<TimerIcon />}
            label={formatDuration(currentModule.estimatedDuration)}
            variant="outlined"
          />
          {currentModule.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isStarted && !moduleProgress ? (
            <CustomButton
              variant="primary"
              startIcon={<PlayIcon />}
              onClick={handleStartModule}
            >
              Start Learning
            </CustomButton>
          ) : (
            <CustomButton
              variant="primary"
              startIcon={isCompleted ? <CheckIcon /> : <PlayIcon />}
              disabled={isCompleted}
            >
              {isCompleted ? 'Completed' : 'Continue Learning'}
            </CustomButton>
          )}
          
          {currentModule.content.flashcards.length > 0 && (
            <CustomButton
              variant="outline"
              onClick={() => setShowFlashcards(true)}
            >
              Review Flashcards
            </CustomButton>
          )}
        </Box>
      </Paper>

      {/* Content */}
      {(isStarted || moduleProgress) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{ p: 3 }}>
            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              sx={{ '& .MuiStepContent-root': { borderLeft: 'none', pl: 4 } }}
            >
              {currentModule.content.sections.map((section, index) => (
                <Step key={section.id || index}>
                  <StepLabel>
                    <Typography variant="h6">{section.title}</Typography>
                  </StepLabel>
                  <StepContent>
                    <SectionViewer
                      section={section}
                      onComplete={() => handleSectionComplete(index)}
                      isActive={activeStep === index}
                    />
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {/* Assessment Section */}
            {activeStep >= currentModule.content.sections.length && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ my: 3 }} />
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <QuizIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Assessment</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Test your understanding with {currentModule.content.assessment.length} questions
                    </Typography>
                    <CustomButton
                      variant="primary"
                      onClick={() => setShowAssessment(true)}
                    >
                      Take Assessment
                    </CustomButton>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Paper>
        </motion.div>
      )}

      {/* Assessment Dialog */}
      <Dialog
        open={showAssessment}
        onClose={() => setShowAssessment(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Module Assessment</DialogTitle>
        <DialogContent>
          <AssessmentQuiz
            questions={currentModule.content.assessment}
            onComplete={handleAssessmentComplete}
            onCancel={() => setShowAssessment(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Evaluation Dialog */}
      <Dialog
        open={showEvaluation}
        onClose={() => setShowEvaluation(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Practical Evaluation</DialogTitle>
        <DialogContent>
          <EvaluationForm
            questions={currentModule.content.evaluation}
            moduleId={moduleId!}
            onComplete={handleEvaluationComplete}
            onCancel={() => setShowEvaluation(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Flashcards Dialog */}
      <Dialog
        open={showFlashcards}
        onClose={() => setShowFlashcards(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Flashcards Review</DialogTitle>
        <DialogContent>
          <FlashcardDeck
            flashcards={currentModule.content.flashcards}
            onClose={() => setShowFlashcards(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
} 