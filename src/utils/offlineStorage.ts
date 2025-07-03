import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface PelajariDB extends DBSchema {
  'learning-modules': {
    key: string
    value: {
      id: string
      data: Record<string, unknown>
      timestamp: number
      synced: boolean
    }
  }
  'user-progress': {
    key: string
    value: {
      id: string
      moduleId: string
      progress: Record<string, unknown>
      timestamp: number
      synced: boolean
    }
  }
  'practice-sessions': {
    key: string
    value: {
      id: string
      sessionData: Record<string, unknown>
      timestamp: number
      synced: boolean
    }
  }
  'offline-actions': {
    key: string
    value: {
      id: string
      action: string
      payload: Record<string, unknown>
      timestamp: number
      retryCount: number
    }
  }
}

class OfflineStorage {
  private db: IDBPDatabase<PelajariDB> | null = null

  async init() {
    if (this.db) return this.db

    this.db = await openDB<PelajariDB>('pelajari-offline', 1, {
      upgrade(db) {
        // Learning modules store
        if (!db.objectStoreNames.contains('learning-modules')) {
          db.createObjectStore('learning-modules', { keyPath: 'id' })
        }

        // User progress store
        if (!db.objectStoreNames.contains('user-progress')) {
          db.createObjectStore('user-progress', { keyPath: 'id' })
        }

        // Practice sessions store
        if (!db.objectStoreNames.contains('practice-sessions')) {
          db.createObjectStore('practice-sessions', { keyPath: 'id' })
        }

        // Offline actions queue
        if (!db.objectStoreNames.contains('offline-actions')) {
          db.createObjectStore('offline-actions', { keyPath: 'id' })
        }
      },
    })

    return this.db
  }

  // Learning Modules
  async saveLearningModule(module: Record<string, unknown>) {
    const db = await this.init()
    await db.put('learning-modules', {
      id: module.id as string,
      data: module,
      timestamp: Date.now(),
      synced: true,
    })
  }

  async getLearningModule(moduleId: string) {
    const db = await this.init()
    const result = await db.get('learning-modules', moduleId)
    return result?.data
  }

  async getAllLearningModules() {
    const db = await this.init()
    const results = await db.getAll('learning-modules')
    return results.map(r => r.data)
  }

  // User Progress
  async saveUserProgress(progressData: Record<string, unknown>) {
    const db = await this.init()
    const id = `${progressData.userId}-${progressData.moduleId}`
    
    await db.put('user-progress', {
      id,
      moduleId: progressData.moduleId as string,
      progress: progressData,
      timestamp: Date.now(),
      synced: false, // Mark as not synced initially
    })

    // Queue for background sync
    await this.queueOfflineAction('UPDATE_PROGRESS', progressData)
  }

  async getUserProgress(moduleId: string, userId: string) {
    const db = await this.init()
    const id = `${userId}-${moduleId}`
    const result = await db.get('user-progress', id)
    return result?.progress
  }

  async getAllUserProgress(userId: string) {
    const db = await this.init()
    const results = await db.getAll('user-progress')
    return results
      .filter(r => r.progress.userId === userId)
      .map(r => r.progress)
  }

  // Practice Sessions
  async savePracticeSession(sessionData: Record<string, unknown>) {
    const db = await this.init()
    
    await db.put('practice-sessions', {
      id: sessionData.id as string,
      sessionData,
      timestamp: Date.now(),
      synced: false,
    })

    // Queue for background sync
    await this.queueOfflineAction('SAVE_SESSION', sessionData)
  }

  async getPracticeSession(sessionId: string) {
    const db = await this.init()
    const result = await db.get('practice-sessions', sessionId)
    return result?.sessionData
  }

  // Offline Actions Queue
  async queueOfflineAction(action: string, payload: Record<string, unknown>) {
    const db = await this.init()
    const id = `${action}-${Date.now()}-${Math.random()}`
    
    await db.put('offline-actions', {
      id,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    })
  }

  async getOfflineActions() {
    const db = await this.init()
    return await db.getAll('offline-actions')
  }

  async removeOfflineAction(actionId: string) {
    const db = await this.init()
    await db.delete('offline-actions', actionId)
  }

  async updateActionRetryCount(actionId: string, retryCount: number) {
    const db = await this.init()
    const action = await db.get('offline-actions', actionId)
    if (action) {
      action.retryCount = retryCount
      await db.put('offline-actions', action)
    }
  }

  // Sync Management
  async markProgressAsSynced(progressId: string) {
    const db = await this.init()
    const progress = await db.get('user-progress', progressId)
    if (progress) {
      progress.synced = true
      await db.put('user-progress', progress)
    }
  }

  async getUnsyncedProgress() {
    const db = await this.init()
    const allProgress = await db.getAll('user-progress')
    return allProgress.filter(p => !p.synced)
  }

  // Cleanup old data
  async cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const db = await this.init()
    const cutoffTime = Date.now() - maxAge

    // Clean up old synced progress
    const tx = db.transaction(['user-progress', 'practice-sessions'], 'readwrite')
    
    const progressStore = tx.objectStore('user-progress')
    const allProgress = await progressStore.getAll()
    
    for (const progress of allProgress) {
      if (progress.synced && progress.timestamp < cutoffTime) {
        await progressStore.delete(progress.id)
      }
    }

    await tx.done
  }

  // Clear all data
  async clearAllData() {
    const db = await this.init()
    const tx = db.transaction(['learning-modules', 'user-progress', 'practice-sessions', 'offline-actions'], 'readwrite')
    
    await Promise.all([
      tx.objectStore('learning-modules').clear(),
      tx.objectStore('user-progress').clear(),
      tx.objectStore('practice-sessions').clear(),
      tx.objectStore('offline-actions').clear(),
    ])

    await tx.done
  }
}

export const offlineStorage = new OfflineStorage() 