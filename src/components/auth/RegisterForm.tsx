import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import {
  Box,
  TextField,
  Typography,
  Link,
  Stepper,
  Step,
  StepLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from '@/components/common/Button'
import { useAuthStore, RegisterData } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { useNavigate, Link as RouterLink } from 'react-router'

const steps = ['Basic Info', 'Role Selection']

interface FormData extends RegisterData {
  confirmPassword: string
}

const schemaStep1 = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password'),
})

export const RegisterForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const methods = useForm<FormData>({
    resolver: yupResolver(schemaStep1),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  })

  const { register, handleSubmit, formState, trigger } = methods
  const { errors, isValid } = formState

  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const next = async () => {
    // Validate current step before proceeding
    const valid = await trigger()
    if (!valid) return
    setActiveStep((prev) => prev + 1)
  }

  const prev = () => {
    setActiveStep((prev) => prev - 1)
  }

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(message)
    }
  }

  return (
    <FormProvider {...methods}>
      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activeStep === 0 && (
          <>
            <TextField
              label="Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
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
            <TextField
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              fullWidth
            />
          </>
        )}

        {activeStep === 1 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select Your Role
            </Typography>
            <ToggleButtonGroup
              exclusive
              {...register('role')}
              value={methods.getValues('role')}
              onChange={(_, value) => {
                methods.setValue('role', value as 'user' | 'manager')
              }}
              fullWidth
            >
              <ToggleButton value="user" sx={{ flex: 1 }}>
                Employee
              </ToggleButton>
              <ToggleButton value="manager" sx={{ flex: 1 }}>
                Manager
              </ToggleButton>
            </ToggleButtonGroup>
            {errors.role && (
              <Typography variant="caption" color="error">
                {errors.role.message}
              </Typography>
            )}
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {activeStep > 0 && (
            <Button variant="outline" onClick={prev} fullWidth>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button onClick={next} variant="primary" disabled={!isValid} fullWidth>
              Next
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading} fullWidth>
              Register
            </Button>
          )}
        </Box>
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/auth/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Box>
    </FormProvider>
  )
} 