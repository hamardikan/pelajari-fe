import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { wsService } from '@/services/websocket'

export const useWebSocket = () => {
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      wsService.connect(token).catch(console.error)
    } else {
      wsService.disconnect()
    }

    return () => {
      wsService.disconnect()
    }
  }, [isAuthenticated, token])

  return {
    isConnected: wsService.isConnected(),
    emit: wsService.emit.bind(wsService),
    on: wsService.on.bind(wsService),
    off: wsService.off.bind(wsService),
  }
} 