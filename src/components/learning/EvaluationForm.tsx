import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Send as SubmitIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useLearningStore } from '@/store/learningStore'

interface EvaluationQuestion {
  id?: string
  question: string
  scenario: string
  sampleAnswer?: string
  evaluationCriteria?: string[]
  type?: 'scenario' | 'case_study'
}

interface EvaluationFormProps {
  questions: EvaluationQuestion[]
  moduleId: string
  onComplete: () => void
  onCancel: () => void
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  questions,
  moduleId,
  onComplete,
  onCancel,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<string[]>(new Array(questions.length).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<any[]>([])
  const [showFeedback, setShowFeedback] = useState(false)

  const { submitEvaluation } = useLearningStore()

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses]
    newResponses[currentQuestion] = value
    setResponses(newResponses)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const evaluationResults = []
      
      // Submit each response individually
      for (let i = 0; i < questions.length; i++) {
        if (responses[i]?.trim()) {
          console.log(`Submitting evaluation for question ${i}:`, {
            moduleId,
            questionIndex: i,
            response: responses[i]
          })
          
          const result = await submitEvaluation(moduleId, i, responses[i])
          evaluationResults.push(result)
        } else {
          console.log(`Skipping question ${i} - no response`)
        }
      }
      
      console.log('All evaluation results:', evaluationResults)
      setFeedback(evaluationResults)
      setShowFeedback(true)
    } catch (error) {
      console.error('Failed to submit evaluation:', error)
      // For now, still show the feedback screen even if there's an error
      // In a real app, you'd want to show an error message to the user
      alert(`Error submitting evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const completedResponses = responses.filter(response => response.trim() !== '').length
  const progress = (completedResponses / questions.length) * 100

  if (showFeedback) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
            Evaluation Complete!
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            Your responses have been submitted for evaluation. You'll receive detailed feedback
            to help you improve your skills.
          </Alert>

          {/* Feedback Results */}
          {feedback.map((result, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Question {index + 1} - Score: {result?.score || 'Pending'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {questions[index].question}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                    Your Response:
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {responses[index]}
                    </Typography>
                  </Paper>

                  {result?.feedback && (
                    <>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {result.feedback}
                      </Typography>
                    </>
                  )}

                  {result?.suggestions && (
                    <>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Suggestions for Improvement:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {result.suggestions.map((suggestion: string, idx: number) => (
                          <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                            {suggestion}
                          </Typography>
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={onComplete}
              size="large"
            >
              Complete Module
            </Button>
          </Box>
        </Box>
      </motion.div>
    )
  }

  const question = questions[currentQuestion]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 3 }}>
        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completedResponses}/{questions.length} completed
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((currentQuestion + 1) / questions.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Scenario */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <AssignmentIcon sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
            <Typography variant="h6" color="primary.main">
              Scenario
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {question.scenario}
          </Typography>
        </Paper>

        {/* Question */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {question.question}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder="Type your detailed response here..."
            value={responses[currentQuestion] || ''}
            onChange={(e) => handleResponseChange(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          {/* Evaluation Criteria */}
          {question.evaluationCriteria && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" color="text.secondary">
                  Evaluation Criteria
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {question.evaluationCriteria.map((criteria, index) => (
                    <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                      {criteria}
                    </Typography>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={currentQuestion === 0 ? onCancel : handlePrevious}
          >
            {currentQuestion === 0 ? 'Cancel' : 'Previous'}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!responses[currentQuestion]?.trim() || isSubmitting}
            startIcon={currentQuestion === questions.length - 1 ? <SubmitIcon /> : undefined}
          >
            {isSubmitting
              ? 'Submitting...'
              : currentQuestion === questions.length - 1
              ? 'Submit Evaluation'
              : 'Next Question'
            }
          </Button>
        </Box>
        
        {/* Debug Info */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Debug: Current response: "{responses[currentQuestion] || 'empty'}" | 
            Trimmed: "{responses[currentQuestion]?.trim() || 'empty'}" | 
            Has content: {!!responses[currentQuestion]?.trim() ? 'Yes' : 'No'} | 
            Is submitting: {isSubmitting ? 'Yes' : 'No'} | 
            Button disabled: {(!responses[currentQuestion]?.trim() || isSubmitting) ? 'Yes' : 'No'}
          </Typography>
        </Box>

        {/* Response Progress */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Response Progress:
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={progress === 100 ? 'success' : 'primary'}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      </Box>
    </motion.div>
  )
} 