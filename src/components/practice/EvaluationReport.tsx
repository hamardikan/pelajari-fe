import React from 'react'
import { Box, Typography, Chip, Card, CardContent } from '@mui/material'
import { SessionEvaluation } from '@/services/practice'

interface Props {
  evaluation: SessionEvaluation
}

export const EvaluationReport: React.FC<Props> = ({ evaluation }) => {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Session Evaluation</Typography>
      <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
        Score: {evaluation.overallScore}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr 1fr',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          mb: 3,
        }}
      >
        {Object.entries(evaluation.competencyScores).map(([comp, score]) => (
          <Card key={comp}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2">{comp}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{score}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Strengths</Typography>
        {evaluation.strengths.map((s) => (
          <Chip key={s} label={s} color="success" sx={{ mr: 0.5, mt: 0.5 }} />
        ))}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Areas for Improvement</Typography>
        {evaluation.areasForImprovement.map((a) => (
          <Chip key={a} label={a} color="warning" sx={{ mr: 0.5, mt: 0.5 }} />
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {evaluation.detailedFeedback}
      </Typography>
    </Box>
  )
} 