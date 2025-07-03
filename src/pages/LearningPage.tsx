import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogContent,
  InputAdornment,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useLearningStore } from '@/store/learningStore'
import { DocumentUpload } from '@/components/learning/DocumentUpload'
import { Button } from '@/components/common/Button'

// Mock Module Card Component for now
const ModuleCard: React.FC<{ module: any; onClick?: () => void }> = ({ module, onClick }) => (
  <motion.div
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
  >
    <Box
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2,
        cursor: 'pointer',
        height: '100%',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
      onClick={onClick}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {module.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {module.summary}
      </Typography>
      <Chip label={module.difficulty} size="small" variant="outlined" />
    </Box>
  </motion.div>
)

export const LearningPage: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const {
    modules,
    filters,
    isLoadingModules,
    fetchModules,
    setFilters,
  } = useLearningStore()

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const handleSearch = (value: string) => {
    setFilters({ search: value })
  }

  const handleDifficultyFilter = (difficulty: string) => {
    setFilters({ difficulty: difficulty === filters.difficulty ? '' : difficulty })
  }

  const handleTagFilter = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    setFilters({ tags: newTags })
  }

  // Get available tags from modules
  const availableTags = Array.from(
    new Set(modules.flatMap(module => module.tags))
  ).slice(0, 10)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Learning Modules
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and learn from AI-generated content
          </Typography>
        </Box>
        
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowUpload(true)}
        >
          Upload Document
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 100%', md: { flex: '1 1 50%' } }}>
            <TextField
              fullWidth
              placeholder="Search modules..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ flex: '1 1 45%', md: { flex: '1 1 25%' } }}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty}
                label="Difficulty"
                onChange={(e) => setFilters({ difficulty: e.target.value })}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: '1 1 45%', md: { flex: '1 1 25%' } }}>
            <Button
              variant="outline"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Tag Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Filter by tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagFilter(tag)}
                      color={filters.tags.includes(tag) ? 'primary' : 'default'}
                      variant={filters.tags.includes(tag) ? 'filled' : 'outlined'}
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Modules Grid */}
      {isLoadingModules ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography>Loading modules...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
          <AnimatePresence>
            {modules.map((module, index) => (
              <Box sx={{ width: { xs: '100%', sm: `calc(50% - 12px)`, lg: `calc(33.333% - 16px)` } }} key={module.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModuleCard
                    module={module}
                    onClick={() => {
                      // Navigate to module detail
                      window.location.href = `/learning/${module.id}`
                    }}
                  />
                </motion.div>
              </Box>
            ))}
          </AnimatePresence>
          
          {modules.length === 0 && !isLoadingModules && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No learning modules yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload your first document to create AI-powered learning content
              </Typography>
              <Button
                variant="primary"
                onClick={() => setShowUpload(true)}
              >
                Upload Document
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <DocumentUpload
            onUploadComplete={(moduleId) => {
              setShowUpload(false)
              // Navigate to new module or refresh list
              fetchModules()
            }}
            onClose={() => setShowUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
} 