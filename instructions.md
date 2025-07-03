# Comprehensive Guide to Implementing the New IDP Feature Flow

This document provides a step-by-step guide to integrate the new Individual Development Plan (IDP) feature into the existing application. This includes creating new components, updating the zustand store, modifying the IDP service, and adding new routes.

## 1\. Update API Endpoints

First, let's add the new API endpoints to our constants file.

**File:** `src/utils/constants.ts`

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  LEARNING: {
    MODULES: '/api/learning/modules',
    PROGRESS: '/api/learning/progress',
    ASSESSMENTS: '/api/learning/assessments',
  },
  PRACTICE: {
    SCENARIOS: '/api/roleplay/scenarios',
    SESSIONS: '/api/roleplay/sessions',
  },
  IDP: {
    FRAMEWORKS: '/api/idp/frameworks',
    FRAMEWORK_DETAILS: (id: string) => `/api/idp/frameworks/${id}`,
    GAP_ANALYSIS: '/api/idp/gap-analysis',
    GENERATE: (employeeId: string) => `/api/idp/generate/${employeeId}`,
    PLANS: (employeeId: string) => `/api/idp/employees/${employeeId}`,
    UPDATE_PROGRESS: (idpId: string) => `/api/idp/${idpId}/progress`,
    APPROVE: (idpId: string) => `/api/idp/${idpId}/approve`,
    DEVELOPMENT_PROGRAMS: '/api/idp/development-programs',
    ANALYTICS: '/api/idp/analytics',
  },
  DOCUMENTS: '/api/documents',
} as const;
```

## 2\. Update the IDP Service

Next, update the `idpService` to include the new API calls for gap analysis, IDP generation, and management.

**File:** `src/services/idp.ts`

```typescript
// ... existing code

  // Gap Analysis
  async performGapAnalysis(data: {
    frameworkFile: File
    employeeFile: File
  }) {
    try {
        const formData = new FormData()
        formData.append('frameworkFile', data.frameworkFile)
        formData.append('employeeFile', data.employeeFile)

        const response = await apiClient.post('/api/idp/gap-analysis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to perform gap analysis:', error)
      return { success: false, error }
    }
  }

  // ... existing code

  // IDP Management
  async generateIDP(employeeId: string) {
    try {
      const response = await apiClient.post(`/api/idp/generate/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to generate IDP:', error)
      return { success: false, error }
    }
  }

  async getIDP(employeeId: string) {
    try {
      const response = await apiClient.get(`/api/idp/employees/${employeeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to fetch IDP:', error)
      return { success: false, error }
    }
  }

  async approveIDP(idpId: string) {
    try {
      const response = await apiClient.put(`/api/idp/${idpId}/approve`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to approve IDP:', error)
      return { success: false, error }
    }
  }

  async updateIDPProgress(idpId: string, progress: {
    status: string
    completionPercentage: number
  }) {
    try {
      const response = await apiClient.put(`/api/idp/${idpId}/progress`, progress)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to update IDP progress:', error)
      return { success: false, error }
    }
  }

// ... existing code
```

## 3\. Update the IDP Store

Now, let's update our zustand store to manage the state for the new IDP feature.

**File:** `src/store/idpStore.ts`

```typescript
// ... existing code

  // Gap Analysis actions
    performGapAnalysis: async (data: { frameworkFile: File, employeeFile: File }) => {
      try {
        set({ isAnalyzing: true, analysisProgress: 0 })

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          set((state) => ({
            analysisProgress: Math.min(state.analysisProgress + 10, 90)
          }))
        }, 500)

        const response = await idpService.performGapAnalysis(data)

        clearInterval(progressInterval)
        set({ analysisProgress: 100 })

        if (response.success) {
          set({
            gapAnalysis: response.data.analysis,
            isAnalyzing: false
          })
        }
      } catch (error) {
        console.error('Failed to perform gap analysis:', error)
        set({ isAnalyzing: false, analysisProgress: 0 })
        throw error
      }
    },

// ... existing code
```

## 4\. Create New Components

We'll create new components to handle the UI for the IDP feature.

### 4.1. Gap Analysis Form

Create a new file `src/pages/IDP/GapAnalysis/index.tsx` for the gap analysis form.

```typescript
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography } from '@mui/material';
import { useIDPStore } from '@/store/idpStore';

export const GapAnalysisForm: React.FC = () => {
  const [frameworkFile, setFrameworkFile] = useState<File | null>(null);
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);
  const { performGapAnalysis, isAnalyzing } = useIDPStore();

  const onDropFramework = (acceptedFiles: File[]) => {
    setFrameworkFile(acceptedFiles[0]);
  };

  const onDropEmployee = (acceptedFiles: File[]) => {
    setEmployeeFile(acceptedFiles[0]);
  };

  const { getRootProps: getFrameworkRootProps, getInputProps: getFrameworkInputProps } = useDropzone({ onDrop: onDropFramework });
  const { getRootProps: getEmployeeRootProps, getInputProps: getEmployeeInputProps } = useDropzone({ onDrop: onDropEmployee });

  const handleSubmit = () => {
    if (frameworkFile && employeeFile) {
      performGapAnalysis({ frameworkFile, employeeFile });
    }
  };

  return (
    <Box>
      <Typography variant="h5">Competency Gap Analysis</Typography>
      <Box my={2}>
        <Box {...getFrameworkRootProps()} border="1px dashed grey" p={2} my={1}>
          <input {...getFrameworkInputProps()} />
          <Typography>Drag 'n' drop framework file here, or click to select file</Typography>
          {frameworkFile && <Typography>{frameworkFile.name}</Typography>}
        </Box>
        <Box {...getEmployeeRootProps()} border="1px dashed grey" p={2} my={1}>
          <input {...getEmployeeInputProps()} />
          <Typography>Drag 'n' drop employee file here, or click to select file</Typography>
          {employeeFile && <Typography>{employeeFile.name}</Typography>}
        </Box>
      </Box>
      <Button onClick={handleSubmit} disabled={isAnalyzing || !frameworkFile || !employeeFile}>
        {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
      </Button>
    </Box>
  );
};
```

### 4.2. Generate IDP Component

Create a new file `src/pages/IDP/GenerateIDP/index.tsx` for the IDP generation.

```typescript
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useIDPStore } from '@/store/idpStore';
import { useAuthStore } from '@/store/authStore';

export const GenerateIDP: React.FC = () => {
  const { generateIDP, isGeneratingIDP } = useIDPStore();
  const { user } = useAuthStore();

  const handleGenerate = () => {
    if (user) {
      generateIDP(user.id);
    }
  };

  return (
    <Box>
      <Typography variant="h5">Generate Individual Development Plan</Typography>
      <Button onClick={handleGenerate} disabled={isGeneratingIDP}>
        {isGeneratingIDP ? 'Generating...' : 'Generate IDP'}
      </Button>
    </Box>
  );
};
```

### 4.3. Manage IDP Component

Create a new file `src/pages/IDP/ManageIDP/index.tsx` for IDP management.

```typescript
import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useIDPStore } from '@/store/idpStore';
import { useAuthStore } from '@/store/authStore';

export const ManageIDP: React.FC = () => {
  const { currentIDP, fetchIDP, approveIDP, updateIDPProgress } = useIDPStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchIDP(user.id);
    }
  }, [user, fetchIDP]);

  const handleApprove = () => {
    if (currentIDP) {
      approveIDP(currentIDP.id);
    }
  };

  const handleUpdateProgress = () => {
    if (currentIDP) {
      // Example progress update
      updateIDPProgress(currentIDP.id, {
        status: 'in_progress',
        completionPercentage: 50,
      });
    }
  };

  if (!currentIDP) {
    return <Typography>No IDP found.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5">Manage Individual Development Plan</Typography>
      <Typography>Status: {currentIDP.status}</Typography>
      <Button onClick={handleApprove}>Approve Plan</Button>
      <Button onClick={handleUpdateProgress}>Update Progress</Button>
    </Box>
  );
};
```

## 5\. Update Main IDP Page

Now, let's update the main `IDPPage` to integrate these new components.

**File:** `src/pages/IDPPage.tsx`

```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { GapAnalysisForm } from './IDP/GapAnalysis';
import { GenerateIDP } from './IDP/GenerateIDP';
import { ManageIDP } from './IDP/ManageIDP';

export const IDPPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Individual Development Plan
      </Typography>
      <GapAnalysisForm />
      <GenerateIDP />
      <ManageIDP />
    </Box>
  );
};
```

## 6\. Add New Routes

Finally, let's add the new routes to our `App.tsx` file.

**File:** `src/App.tsx`

```typescript
// ... existing code

import { IDPPage } from '@/pages';

// ... existing code

          <Route path={ROUTES.IDP} element={<IDPPage />} />

// ... existing code
```

This completes the integration of the new IDP feature flow. You can now run the application to see the changes.