# Frontend Update Guide - IDP One-Shot Generation

## 🚨 Backend Changes Summary

The IDP gap analysis endpoint now performs **one-shot generation** - it automatically creates gap analysis, 9-box mapping, AND the complete IDP in a single API call.

---

## 📡 API Changes Required

### 1. **Updated Response Format**

The `POST /api/idp/gap-analysis` endpoint now returns **both IDs**:

**Before:**
```json
{
  "success": true,
  "message": "Gap analysis initiated successfully",
  "data": {
    "analysisId": "uuid",
    "status": "completed",
    "message": "Gap analysis completed successfully"
  }
}
```

**After:**
```json
{
  "success": true,
  "message": "Gap analysis and IDP generation initiated successfully",
  "data": {
    "analysisId": "uuid",
    "idpId": "uuid",          // ← NEW! 
    "status": "completed",
    "message": "Gap analysis and IDP generation completed successfully"
  }
}
```

### 2. **Update Your API Service**

```javascript
// Update your gap analysis service to expect both IDs
export const analyzeCompetencyGaps = async (frameworkFile, employeeFile, employeeId) => {
  // ... existing FormData logic ...
  
  const result = await response.json();
  
  return {
    analysisId: result.data.analysisId,
    idpId: result.data.idpId,        // ← Handle this new field
    status: result.data.status,
    message: result.data.message
  };
};
```

---

## 🔄 Flow Changes Required

### 1. **Simplified User Flow**

**Old Flow:**
```
Upload Files → Gap Analysis → 9-Box Mapping → IDP Generation
    ↓              ↓              ↓              ↓
  Step 1         Step 2         Step 3         Step 4
```

**New Flow:**
```
Upload Files → Complete IDP Generated ✅
    ↓              ↓
  Step 1      Everything Done!
```

### 2. **Remove These API Calls**

You **no longer need** to call these endpoints after gap analysis:
- ❌ `POST /api/idp/employees/{employeeId}/nine-box` 
- ❌ `POST /api/idp/generate/{employeeId}`

They happen automatically now!

### 3. **Update UI States**

```javascript
// Instead of managing 3 separate states:
const [gapAnalysisState, setGapAnalysisState] = useState();
const [nineBoxState, setNineBoxState] = useState();
const [idpState, setIdpState] = useState();

// Just manage one:
const [idpGenerationState, setIdpGenerationState] = useState({
  status: 'idle', // 'idle' | 'processing' | 'completed' | 'error'
  analysisId: null,
  idpId: null
});
```

---

## ✅ What You Need to Change

### 1. **Update Gap Analysis Handler**
```javascript
const handleGapAnalysis = async (frameworkFile, employeeFile) => {
  setIdpGenerationState({ status: 'processing' });
  
  try {
    const result = await analyzeCompetencyGaps(frameworkFile, employeeFile);
    
    // Now you get BOTH IDs immediately!
    setIdpGenerationState({
      status: 'completed',
      analysisId: result.analysisId,
      idpId: result.idpId           // ← Use this to navigate to IDP
    });
    
    // Navigate to IDP view or show success message
    navigate(`/idp/view/${result.idpId}`);
    
  } catch (error) {
    setIdpGenerationState({ status: 'error', error });
  }
};
```

### 2. **Update Success UI**
```jsx
{status === 'completed' && (
  <div className="success-summary">
    <h3>🎉 Complete IDP Generated!</h3>
    <div className="action-buttons">
      <button onClick={() => navigate(`/gap-analysis/${analysisId}`)}>
        View Gap Analysis
      </button>
      <button onClick={() => navigate(`/idp/${idpId}`)} className="primary">
        View Development Plan
      </button>
    </div>
  </div>
)}
```

### 3. **Update Loading Messages**
```jsx
{status === 'processing' && (
  <div className="loading">
    <h3>Generating Complete IDP...</h3>
    <p>Creating gap analysis, 9-box mapping, and development plan...</p>
    {/* Show unified progress instead of separate steps */}
  </div>
)}
```

---

## 🎯 Benefits for Users

- **Faster**: One upload vs. multiple steps
- **Simpler**: No workflow management needed
- **Consistent**: All data generated together
- **Reliable**: No partial states or failures between steps

---

## 🚨 Migration Notes

- **Existing IDPs**: Still work the same way
- **Standalone endpoints**: `POST /idp/generate/{employeeId}` still exists for edge cases
- **Backward compatibility**: All existing read endpoints unchanged

---

## ❓ Questions?

The backend changes are **live and ready**. Test the endpoint and you'll see it now returns both `analysisId` and `idpId` in a single call! 