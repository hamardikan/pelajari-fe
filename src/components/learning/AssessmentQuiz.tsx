import React, { useState } from 'react'
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Button,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material'
import {
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface AssessmentQuestion {
  id?: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface AssessmentQuizProps {
  questions: AssessmentQuestion[]
  onComplete: (answers: string[]) => void
  onCancel: () => void
}

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({
  questions,
  onComplete,
  onCancel,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''))
  const [showResults, setShowResults] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
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

  const handleSubmit = () => {
    setIsSubmitted(true)
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index]?.correctAnswer) {
        correct++
      }
    })
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'success'
    if (percentage >= 60) return 'warning'
    return 'error'
  }

  const isCurrentAnswerCorrect = (questionIndex: number) => {
    return answers[questionIndex] === questions[questionIndex]?.correctAnswer
  }

  const completedAnswers = answers.filter(answer => answer !== '').length
  const progress = (completedAnswers / questions.length) * 100

  if (showResults) {
    const score = calculateScore()
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ p: 3 }}>
          {/* Score Summary */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Assessment Complete!
            </Typography>
            <Chip
              label={`${score.correct}/${score.total} (${score.percentage}%)`}
              color={getScoreColor(score.percentage)}
              sx={{ fontSize: '1.2rem', p: 3 }}
            />
          </Box>

          {/* Question Results */}
          <Typography variant="h6" sx={{ mb: 3 }}>
            Review Your Answers
          </Typography>
          
          {questions.map((question, index) => (
            <Paper key={index} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                {isCurrentAnswerCorrect(index) ? (
                  <CorrectIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                ) : (
                  <IncorrectIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                )}
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {question.question}
                </Typography>
              </Box>
              
              <Box sx={{ ml: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Your answer: <strong>{answers[index] || 'Not answered'}</strong>
                </Typography>
                {!isCurrentAnswerCorrect(index) && (
                  <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                    Correct answer: <strong>{question.correctAnswer}</strong>
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {question.explanation}
                </Typography>
              </Box>
            </Paper>
          ))}

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="outlined" onClick={onCancel}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => onComplete(answers)}
            >
              Continue to Next Section
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
              {completedAnswers}/{questions.length} answered
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((currentQuestion + 1) / questions.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Question */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
            <QuizIcon sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
            <Typography variant="h6">
              {question.question}
            </Typography>
          </Box>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            >
              {question.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {option}
                    </Typography>
                  }
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'grey.50',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
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
            disabled={!answers[currentQuestion]}
          >
            {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </Button>
        </Box>

        {/* Answer Status */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Answer Progress:
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