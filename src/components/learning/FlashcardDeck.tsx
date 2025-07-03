import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material'
import {
  Flip as FlipIcon,
  ArrowBack as PrevIcon,
  ArrowForward as NextIcon,
  Shuffle as ShuffleIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface Flashcard {
  id?: string
  term: string
  definition: string
  category?: string
}

interface FlashcardDeckProps {
  flashcards: Flashcard[]
  onClose: () => void
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  flashcards,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cards, setCards] = useState(flashcards)

  const currentCard = cards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const progress = ((currentIndex + 1) / cards.length) * 100

  return (
    <Box sx={{ p: 3, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Flashcards ({currentIndex + 1} of {cards.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleShuffle} title="Shuffle cards">
            <ShuffleIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Flashcard */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
            height: 400,
            perspective: '1000px',
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              cursor: 'pointer',
            }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            onClick={handleFlip}
          >
            {/* Front (Term) */}
            <Paper
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 2, opacity: 0.8, textTransform: 'uppercase' }}
              >
                Term
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {currentCard?.term}
              </Typography>
              {currentCard?.category && (
                <Chip
                  label={currentCard.category}
                  size="small"
                  sx={{ mt: 2, bgcolor: 'primary.light' }}
                />
              )}
              <Typography
                variant="caption"
                sx={{ mt: 3, opacity: 0.8 }}
              >
                Click to flip
              </Typography>
            </Paper>

            {/* Back (Definition) */}
            <Paper
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                bgcolor: 'success.main',
                color: 'success.contrastText',
                '&:hover': {
                  bgcolor: 'success.dark',
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 2, opacity: 0.8, textTransform: 'uppercase' }}
              >
                Definition
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  lineHeight: 1.6,
                  maxWidth: '100%',
                }}
              >
                {currentCard?.definition}
              </Typography>
              <Typography
                variant="caption"
                sx={{ mt: 3, opacity: 0.8 }}
              >
                Click to flip back
              </Typography>
            </Paper>
          </motion.div>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<PrevIcon />}
          onClick={handlePrevious}
          disabled={cards.length <= 1}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          startIcon={<FlipIcon />}
          onClick={handleFlip}
          sx={{ mx: 2 }}
        >
          {isFlipped ? 'Show Term' : 'Show Definition'}
        </Button>

        <Button
          variant="outlined"
          endIcon={<NextIcon />}
          onClick={handleNext}
          disabled={cards.length <= 1}
        >
          Next
        </Button>
      </Box>

      {/* Instructions */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center', mt: 2 }}
      >
        Use the buttons or click the card to navigate and flip. Press shuffle to randomize the order.
      </Typography>
    </Box>
  )
} 