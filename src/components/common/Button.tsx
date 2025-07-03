import React from 'react'
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material'
import { motion } from 'framer-motion'

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  loading?: boolean
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  startIcon,
  endIcon,
  ...props
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
        }
      case 'secondary':
        return {
          variant: 'contained' as const,
          color: 'secondary' as const,
        }
      case 'outline':
        return {
          variant: 'outlined' as const,
          color: 'primary' as const,
        }
      case 'ghost':
        return {
          variant: 'text' as const,
          color: 'primary' as const,
        }
      default:
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
        }
    }
  }

  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <MuiButton
        {...getVariantProps()}
        disabled={disabled || loading}
        startIcon={loading ? null : startIcon}
        endIcon={loading ? null : endIcon}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          minHeight: 44,
          position: 'relative',
          ...(loading && {
            color: 'transparent',
          }),
        }}
        {...props}
      >
        {loading && (
          <CircularProgress
            size={20}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-10px',
              marginLeft: '-10px',
            }}
          />
        )}
        {children}
      </MuiButton>
    </motion.div>
  )
} 