import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  practiceService, 
  RoleplayScenario, 
  RoleplaySession, 
  SessionMessage,
  SessionEvaluation 
} from '@/services/practice'
import { wsService } from '@/services/websocket'
import { offlineQueueService, QueuedMessage } from '@/services/offlineQueue'

interface PracticeState {
  // Scenarios
  scenarios: RoleplayScenario[]
  currentScenario: RoleplayScenario | null
  isLoadingScenarios: boolean
  
  // Sessions
  currentSession: RoleplaySession | null
  messages: SessionMessage[]
  isSessionActive: boolean
  isLoadingSession: boolean
  
  // Evaluation
  sessionEvaluation: SessionEvaluation | null
  
  // Offline Queue
  offlineQueueSize: number
  isOnline: boolean
  
  // Actions
  fetchScenarios: (filters?: {
    difficulty?: string
    competency?: string
    search?: string
    page?: number
    limit?: number
  }) => Promise<void>
  selectScenario: (scenarioId: string) => Promise<void>
  startSession: (scenarioId: string) => Promise<void>
  sendMessage: (message: string) => Promise<void>
  endSession: () => Promise<void>
  clearSession: () => void
  processOfflineQueue: () => Promise<void>
  updateOnlineStatus: (isOnline: boolean) => void
}

export const usePracticeStore = create<PracticeState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    scenarios: [],
    currentScenario: null,
    isLoadingScenarios: false,
    currentSession: null,
    messages: [],
    isSessionActive: false,
    isLoadingSession: false,
    sessionEvaluation: null,
    offlineQueueSize: 0,
    isOnline: navigator.onLine,

    // Actions
    fetchScenarios: async (filters = {}) => {
      try {
        set({ isLoadingScenarios: true })
        
        const response = await practiceService.getScenarios(filters) as { success: boolean; data: { scenarios: RoleplayScenario[] } }
        
        if (response.success) {
          set({ 
            scenarios: response.data.scenarios,
            isLoadingScenarios: false 
          })
        }
      } catch (error) {
        console.error('Failed to fetch scenarios:', error)
        set({ isLoadingScenarios: false })
      }
    },

    selectScenario: async (scenarioId: string) => {
      try {
        const response = await practiceService.getScenario(scenarioId) as { success: boolean; data: { scenario: RoleplayScenario } }
        
        if (response.success) {
          set({ currentScenario: response.data.scenario })
        }
      } catch (error) {
        console.error('Failed to fetch scenario:', error)
      }
    },

    startSession: async (scenarioId: string) => {
      try {
        set({ isLoadingSession: true })
        
        const response = await practiceService.startSession(scenarioId) as { 
          success: boolean; 
          data: { 
            sessionId: string
            initialMessage: string
          } 
        }
        
        if (response.success) {
          const session: RoleplaySession = {
            id: response.data.sessionId,
            userId: 'current-user',
            scenarioId,
            status: 'active',
            startedAt: new Date().toISOString()
          }
          
          set({ 
            currentSession: session,
            messages: [{
              id: 'initial',
              sessionId: response.data.sessionId,
              sender: 'ai',
              content: response.data.initialMessage,
              timestamp: new Date().toISOString()
            }],
            isSessionActive: true,
            isLoadingSession: false,
            sessionEvaluation: null
          })
          
          // Join WebSocket room for real-time updates
          wsService.joinSessionRoom(response.data.sessionId)
        }
      } catch (error) {
        console.error('Failed to start session:', error)
        set({ isLoadingSession: false })
        throw error
      }
    },

    sendMessage: async (message: string) => {
      try {
        const { currentSession, isOnline } = get()
        if (!currentSession) throw new Error('No active session')
        
        // Add user message immediately
        const userMessage: SessionMessage = {
          id: Date.now().toString(),
          sessionId: currentSession.id,
          sender: 'user',
          content: message,
          timestamp: new Date().toISOString()
        }
        
        set((state) => ({
          messages: [...state.messages, userMessage]
        }))
        
        if (isOnline) {
          // Send to server
          const response = await practiceService.sendMessage(currentSession.id, message) as { success: boolean }
          
          if (!response.success) {
            throw new Error('Failed to send message')
          }
          
          // AI response will come via WebSocket
        } else {
          // Queue message for offline processing
          offlineQueueService.addMessage(currentSession.scenarioId, message)
          set({ offlineQueueSize: offlineQueueService.getQueueSize() })
          
          // Show offline indicator
          console.log('Message queued for offline processing')
        }
      } catch (error) {
        console.error('Failed to send message:', error)
        
        // If online but failed, queue the message
        const { currentSession } = get()
        if (currentSession) {
          offlineQueueService.addMessage(currentSession.scenarioId, message)
          set({ offlineQueueSize: offlineQueueService.getQueueSize() })
        }
        
        throw error
      }
    },

    endSession: async () => {
      try {
        const { currentSession } = get()
        if (!currentSession) throw new Error('No active session')
        
        const response = await practiceService.endSession(currentSession.id) as { 
          success: boolean; 
          data: { evaluation: SessionEvaluation } 
        }
        
        if (response.success) {
          set({ 
            isSessionActive: false,
            sessionEvaluation: response.data.evaluation
          })
          
          // Leave WebSocket room
          wsService.leaveSessionRoom(currentSession.id)
        }
      } catch (error) {
        console.error('Failed to end session:', error)
        throw error
      }
    },

    clearSession: () => {
      const { currentSession } = get()
      if (currentSession) {
        wsService.leaveSessionRoom(currentSession.id)
      }
      
      set({
        currentSession: null,
        messages: [],
        isSessionActive: false,
        sessionEvaluation: null,
        currentScenario: null
      })
    },

    processOfflineQueue: async () => {
      const { currentSession } = get()
      if (!currentSession) return

      await offlineQueueService.processQueue(async (queuedMessage: QueuedMessage) => {
        try {
          const response = await practiceService.sendMessage(currentSession.id, queuedMessage.content) as { success: boolean }
          return response.success
        } catch (error) {
          console.error('Failed to process queued message:', error)
          return false
        }
      })

      set({ offlineQueueSize: offlineQueueService.getQueueSize() })
    },

    updateOnlineStatus: (isOnline: boolean) => {
      set({ isOnline })
      
      // Process offline queue when coming back online
      if (isOnline) {
        const { processOfflineQueue } = get()
        processOfflineQueue()
      }
    },
  }))
)

// Subscribe to WebSocket events
wsService.on('session:message', (data) => {
  const aiMessage: SessionMessage = {
    id: data.message.id || Date.now().toString(),
    sessionId: data.sessionId,
    sender: 'ai',
    content: data.message.content,
    timestamp: data.message.timestamp || new Date().toISOString()
  }
  
  usePracticeStore.setState((state) => ({
    messages: [...state.messages, aiMessage]
  }))
})

wsService.on('session:ended', (data) => {
  usePracticeStore.setState({
    isSessionActive: false,
    sessionEvaluation: data.evaluation as unknown as SessionEvaluation
  })
})

// Subscribe to online/offline events
window.addEventListener('online', () => {
  usePracticeStore.getState().updateOnlineStatus(true)
})

window.addEventListener('offline', () => {
  usePracticeStore.getState().updateOnlineStatus(false)
})

// Subscribe to offline queue updates
window.addEventListener('offlineQueueUpdate', () => {
  usePracticeStore.setState({ offlineQueueSize: offlineQueueService.getQueueSize() })
}) 