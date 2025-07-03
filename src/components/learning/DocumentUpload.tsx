import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  TextField,
  Button as MuiButton,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { useLearningStore } from '@/store/learningStore'
import toast from 'react-hot-toast'

interface DocumentUploadProps {
  onUploadComplete?: (moduleId: string) => void
  onClose?: () => void
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const { uploadDocument, isUploading, uploadProgress } = useLearningStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setMetadata(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }))
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploadStatus('uploading')
      setError(null)

      const result = await uploadDocument(selectedFile, metadata)
      
      setUploadStatus('processing')
      
      // Listen for completion via WebSocket
      // The actual completion will be handled by the store
      toast.success('Document uploaded! AI is processing your content...')
      
      // For demo purposes, simulate processing completion
      setTimeout(() => {
        setUploadStatus('completed')
        onUploadComplete?.(result.moduleId)
      }, 3000)
      
    } catch (err: unknown) {
      setUploadStatus('error')
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      toast.error('Upload failed. Please try again.')
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setError(null)
    setMetadata({ title: '', description: '', tags: [] })
  }

  const getDropzoneColor = () => {
    if (isDragReject) return 'error.main'
    if (isDragActive) return 'primary.main'
    return 'grey.300'
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'completed':
        return <CheckIcon sx={{ color: 'success.main', fontSize: 48 }} />
      case 'uploading':
      case 'processing':
        return <UploadIcon sx={{ color: 'primary.main', fontSize: 48 }} />
      case 'error':
        return <UploadIcon sx={{ color: 'error.main', fontSize: 48 }} />
      default:
        return <UploadIcon sx={{ color: 'grey.400', fontSize: 48 }} />
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Upload Learning Material
        </Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <AnimatePresence mode="wait">
        {uploadStatus === 'idle' || uploadStatus === 'error' ? (
          <motion.div
            key="upload-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Dropzone */}
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                border: `2px dashed ${getDropzoneColor()}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                mb: 3,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              
              {selectedFile ? (
                <Box>
                  <FileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </Typography>
                  <MuiButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                    sx={{ mt: 1 }}
                  >
                    Choose Different File
                  </MuiButton>
                </Box>
              ) : (
                <Box>
                  <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {isDragActive
                      ? 'Drop your file here'
                      : 'Drag & drop your document here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    or click to browse files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports PDF, DOCX, TXT • Max 10MB
                  </Typography>
                </Box>
              )}
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {selectedFile && (
              <Box sx={{ space: 3 }}>
                {/* Metadata Form */}
                <TextField
                  fullWidth
                  label="Module Title"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                {/* Tags */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Tags
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    {metadata.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      sx={{ flexGrow: 1 }}
                    />
                    <MuiButton
                      variant="outlined"
                      size="small"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </MuiButton>
                  </Box>
                </Box>

                {/* Upload Button */}
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleUpload}
                  disabled={!selectedFile || !metadata.title.trim() || isUploading}
                  loading={isUploading}
                >
                  Create Learning Module
                </Button>
              </Box>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload-status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <motion.div
                animate={{ 
                  rotate: uploadStatus === 'processing' ? 360 : 0,
                  scale: uploadStatus === 'completed' ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: uploadStatus === 'processing' ? Infinity : 0 },
                  scale: { duration: 0.6 }
                }}
              >
                {getStatusIcon()}
              </motion.div>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {uploadStatus === 'uploading' ? 'Uploading Document...' :
                 uploadStatus === 'processing' ? 'AI is Processing Your Content...' :
                 uploadStatus === 'completed' ? 'Learning Module Created!' : 'Upload Failed'}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {uploadStatus === 'uploading' ? 'Please wait while we upload your file.' :
                 uploadStatus === 'processing' ? 'Our AI is analyzing your document and creating interactive learning content.' :
                 uploadStatus === 'completed' ? 'Your learning module is ready! You can now start learning.' : 'Something went wrong. Please try again.'}
              </Typography>

              {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant={uploadStatus === 'uploading' ? 'determinate' : 'indeterminate'}
                    value={uploadStatus === 'uploading' ? uploadProgress : undefined}
                    sx={{ mb: 1 }}
                  />
                  {uploadStatus === 'uploading' && (
                    <Typography variant="caption" color="text.secondary">
                      {uploadProgress}% uploaded
                    </Typography>
                  )}
                </Box>
              )}

              {uploadStatus === 'completed' && (
                <Button
                  variant="primary"
                  onClick={() => onUploadComplete?.(selectedFile?.name || 'module')}
                >
                  View Module
                </Button>
              )}

              {uploadStatus !== 'completed' && uploadStatus !== 'uploading' && uploadStatus !== 'processing' && (
                <Button
                  variant="outline"
                  onClick={resetUpload}
                >
                  Try Again
                </Button>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
} 