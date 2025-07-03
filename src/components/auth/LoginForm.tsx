import React from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  TextField,
  Typography,
  Link,
} from '@mui/material'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from '@/components/common/Button'
import { useAuthStore, LoginCredentials } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { useNavigate, Link as RouterLink } from 'react-router'

const schema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
})

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Email"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        fullWidth
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link component={RouterLink} to="/auth/forgot-password" underline="hover" variant="body2">
          Forgot Password?
        </Link>
      </Box>
      <Button type="submit" variant="primary" loading={isLoading} disabled={!isValid || isLoading} fullWidth>
        Login
      </Button>
      <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/auth/register" underline="hover">
          Register
        </Link>
      </Typography>
    </Box>
  )
} 