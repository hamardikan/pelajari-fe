import React, { useState } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Chip,
} from '@mui/material'
import { Competency } from '@/types'

interface GapAnalysisWizardProps {
  onComplete: (competencies: Competency[]) => void
  onCancel: () => void
}

interface WizardStep {
  title: string
  description: string
}

const steps: WizardStep[] = [
  {
    title: 'Select Competencies',
    description: 'Choose the competencies you want to assess',
  },
  {
    title: 'Current Level Assessment',
    description: 'Rate your current proficiency level for each competency',
  },
  {
    title: 'Target Level Setting',
    description: 'Set your target proficiency level for each competency',
  },
  {
    title: 'Review & Complete',
    description: 'Review your gap analysis and complete the assessment',
  },
]

const competencyCategories = [
  'Leadership',
  'Communication',
  'Technical Skills',
  'Problem Solving',
  'Teamwork',
  'Project Management',
  'Innovation',
  'Strategic Thinking',
]

const competencyOptions: Record<string, string[]> = {
  Leadership: [
    'Team Leadership',
    'Strategic Leadership',
    'Change Management',
    'Decision Making',
    'Mentoring & Coaching',
  ],
  Communication: [
    'Written Communication',
    'Verbal Communication',
    'Presentation Skills',
    'Active Listening',
    'Conflict Resolution',
  ],
  'Technical Skills': [
    'Programming',
    'Data Analysis',
    'System Design',
    'DevOps',
    'Security',
  ],
  'Problem Solving': [
    'Analytical Thinking',
    'Creative Problem Solving',
    'Root Cause Analysis',
    'Critical Thinking',
    'Innovation',
  ],
  Teamwork: [
    'Collaboration',
    'Cross-functional Teams',
    'Remote Team Management',
    'Team Building',
    'Conflict Management',
  ],
  'Project Management': [
    'Agile Methodologies',
    'Risk Management',
    'Resource Planning',
    'Stakeholder Management',
    'Quality Assurance',
  ],
  Innovation: [
    'Design Thinking',
    'Product Innovation',
    'Process Improvement',
    'Technology Trends',
    'Creative Thinking',
  ],
  'Strategic Thinking': [
    'Business Strategy',
    'Market Analysis',
    'Competitive Intelligence',
    'Long-term Planning',
    'Strategic Execution',
  ],
}

export const GapAnalysisWizard: React.FC<GapAnalysisWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([])
  const [currentLevels, setCurrentLevels] = useState<Record<string, number>>({})
  const [targetLevels, setTargetLevels] = useState<Record<string, number>>({})

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleCompetencyToggle = (competency: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(competency)
        ? prev.filter((c) => c !== competency)
        : [...prev, competency]
    )
  }

  const handleCurrentLevelChange = (competency: string, level: number) => {
    setCurrentLevels((prev) => ({ ...prev, [competency]: level }))
  }

  const handleTargetLevelChange = (competency: string, level: number) => {
    setTargetLevels((prev) => ({ ...prev, [competency]: level }))
  }

  const handleComplete = () => {
    const competencies: Competency[] = selectedCompetencies.map((name) => ({
      id: `comp_${Date.now()}_${Math.random()}`,
      name,
      description: `Assessment for ${name}`,
      category: competencyCategories.find((cat) =>
        competencyOptions[cat].includes(name)
      ) || 'Other',
      level: currentLevels[name] || 1,
      targetLevel: targetLevels[name] || 3,
      gap: (targetLevels[name] || 3) - (currentLevels[name] || 1),
    }))

    onComplete(competencies)
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Competencies to Assess
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose the competencies that are most relevant to your role and career goals.
            </Typography>
            {competencyCategories.map((category) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {competencyOptions[category].map((competency) => (
                    <Chip
                      key={competency}
                      label={competency}
                      onClick={() => handleCompetencyToggle(competency)}
                      color={selectedCompetencies.includes(competency) ? 'primary' : 'default'}
                      variant={selectedCompetencies.includes(competency) ? 'filled' : 'outlined'}
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assess Your Current Level
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Rate your current proficiency level for each selected competency.
            </Typography>
            {selectedCompetencies.map((competency) => (
              <FormControl key={competency} component="fieldset" sx={{ mb: 3, width: '100%' }}>
                <FormLabel component="legend">{competency}</FormLabel>
                <RadioGroup
                  row
                  value={currentLevels[competency] || ''}
                  onChange={(e) => handleCurrentLevelChange(competency, Number(e.target.value))}
                >
                  <FormControlLabel value={1} control={<Radio />} label="Beginner" />
                  <FormControlLabel value={2} control={<Radio />} label="Intermediate" />
                  <FormControlLabel value={3} control={<Radio />} label="Advanced" />
                  <FormControlLabel value={4} control={<Radio />} label="Expert" />
                  <FormControlLabel value={5} control={<Radio />} label="Master" />
                </RadioGroup>
              </FormControl>
            ))}
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Set Target Levels
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set your target proficiency level for each competency.
            </Typography>
            {selectedCompetencies.map((competency) => (
              <FormControl key={competency} component="fieldset" sx={{ mb: 3, width: '100%' }}>
                <FormLabel component="legend">{competency}</FormLabel>
                <RadioGroup
                  row
                  value={targetLevels[competency] || ''}
                  onChange={(e) => handleTargetLevelChange(competency, Number(e.target.value))}
                >
                  <FormControlLabel value={1} control={<Radio />} label="Beginner" />
                  <FormControlLabel value={2} control={<Radio />} label="Intermediate" />
                  <FormControlLabel value={3} control={<Radio />} label="Advanced" />
                  <FormControlLabel value={4} control={<Radio />} label="Expert" />
                  <FormControlLabel value={5} control={<Radio />} label="Master" />
                </RadioGroup>
              </FormControl>
            ))}
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Gap Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your competency assessment before completing.
            </Typography>
            {selectedCompetencies.map((competency) => {
              const current = currentLevels[competency] || 1
              const target = targetLevels[competency] || 3
              const gap = target - current
              return (
                <Paper key={competency} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {competency}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">
                      Current: Level {current}
                    </Typography>
                    <Typography variant="body2">
                      Target: Level {target}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={gap > 0 ? 'error.main' : gap < 0 ? 'success.main' : 'text.primary'}
                    >
                      Gap: {gap > 0 ? '+' : ''}{gap}
                    </Typography>
                  </Box>
                </Paper>
              )
            })}
          </Box>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selectedCompetencies.length > 0
      case 1:
        return selectedCompetencies.every((comp) => currentLevels[comp])
      case 2:
        return selectedCompetencies.every((comp) => targetLevels[comp])
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.title}>
            <StepLabel>
              <Typography variant="subtitle2">{step.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {renderStepContent()}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Box>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleComplete}
              disabled={!isStepValid()}
            >
              Complete Assessment
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
} 