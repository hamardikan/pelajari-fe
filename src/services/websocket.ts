import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

export interface WebSocketEvents {
  // Learning events
  'module:processing': (data: { moduleId: string; status: string }) => void
  'module:completed': (data: { moduleId: string }) => void
  'module:failed': (data: { moduleId: string; error: string }) => void
  
  // Practice events
  'session:message': (data: { sessionId: string; message: { id?: string; content: string; timestamp?: string } }) => void
  'session:ended': (data: { sessionId: string; evaluation: Record<string, unknown> }) => void
  
  // Progress events
  'progress:updated': (data: { userId: string; moduleId: string; progress: Record<string, unknown> }) => void
  
  // Notifications
  'notification': (data: { type: string; message: string; data?: Record<string, unknown> }) => void
}

class WebSocketService {
  private socket: Socket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private eventListeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  constructor() {
    this.url = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000'
  }

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.url, {
          auth: { token },
          transports: ['websocket', 'polling'],
          timeout: 20000,
        })

        this.setupEventHandlers()
        
        this.socket.on('connect', () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve(this.socket!)
        })

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error)
          reject(error)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  private setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect()
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts')
      toast.success('Connection restored')
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection failed:', error)
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Connection lost. Please refresh the page.')
      }
    })

    // Setup notification handler
    this.socket.on('notification', (data) => {
      this.handleNotification(data)
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.socket?.connect()
      }, Math.pow(2, this.reconnectAttempts) * 1000) // Exponential backoff
    }
  }

  private handleNotification(data: { type: string; message: string; data?: Record<string, unknown> }) {
    switch (data.type) {
      case 'success':
        toast.success(data.message)
        break
      case 'error':
        toast.error(data.message)
        break
      case 'info':
        toast(data.message)
        break
      case 'module_completed':
        toast.success('Learning module generation completed!')
        break
      case 'session_ended':
        toast.success('Practice session completed!')
        break
      default:
        toast(data.message)
    }
  }

  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.socket) return

    this.socket.on(event as string, callback as (...args: unknown[]) => void)
    
    // Store listener for cleanup
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, [])
    }
    this.eventListeners.get(event as string)!.push(callback as (...args: unknown[]) => void)
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event as string, callback as (...args: unknown[]) => void)
      
      // Remove from stored listeners
      const listeners = this.eventListeners.get(event as string) || []
      const index = listeners.indexOf(callback as (...args: unknown[]) => void)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.socket.off(event as string)
      this.eventListeners.delete(event as string)
    }
  }

  emit(event: string, data?: Record<string, unknown>) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event)
    }
  }

  disconnect() {
    if (this.socket) {
      // Clean up all listeners
      this.eventListeners.forEach((listeners, event) => {
        listeners.forEach(listener => {
          this.socket?.off(event, listener as (...args: unknown[]) => void)
        })
      })
      this.eventListeners.clear()
      
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Specific methods for app features
  joinModuleRoom(moduleId: string) {
    this.emit('join:module', { moduleId })
  }

  leaveModuleRoom(moduleId: string) {
    this.emit('leave:module', { moduleId })
  }

  joinSessionRoom(sessionId: string) {
    this.emit('join:session', { sessionId })
  }

  leaveSessionRoom(sessionId: string) {
    this.emit('leave:session', { sessionId })
  }
}

export const wsService = new WebSocketService() 