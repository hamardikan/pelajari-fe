export interface QueuedMessage {
  id: string;
  scenarioId: string;
  content: string;
  timestamp: number;
  retryCount: number;
}

class OfflineQueueService {
  private readonly QUEUE_KEY = 'pelajari_offline_queue';
  private readonly MAX_RETRY_COUNT = 3;

  private getQueue(): QueuedMessage[] {
    try {
      const queue = localStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error reading offline queue:', error);
      return [];
    }
  }

  private saveQueue(queue: QueuedMessage[]): void {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  addMessage(scenarioId: string, content: string): void {
    const queue = this.getQueue();
    const message: QueuedMessage = {
      id: `offline_${Date.now()}_${Math.random()}`,
      scenarioId,
      content,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    queue.push(message);
    this.saveQueue(queue);
    
    // Notify about new offline message
    this.notifyQueueUpdate();
  }

  getMessages(scenarioId?: string): QueuedMessage[] {
    const queue = this.getQueue();
    if (scenarioId) {
      return queue.filter(msg => msg.scenarioId === scenarioId);
    }
    return queue;
  }

  removeMessage(messageId: string): void {
    const queue = this.getQueue();
    const filteredQueue = queue.filter(msg => msg.id !== messageId);
    this.saveQueue(filteredQueue);
    this.notifyQueueUpdate();
  }

  incrementRetryCount(messageId: string): void {
    const queue = this.getQueue();
    const message = queue.find(msg => msg.id === messageId);
    if (message && message.retryCount < this.MAX_RETRY_COUNT) {
      message.retryCount++;
      this.saveQueue(queue);
    }
  }

  clearExpiredMessages(): void {
    const queue = this.getQueue();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours
    
    const filteredQueue = queue.filter(msg => {
      // Remove messages older than 24 hours or with max retry count
      return (now - msg.timestamp) < oneDay && msg.retryCount < this.MAX_RETRY_COUNT;
    });
    
    if (filteredQueue.length !== queue.length) {
      this.saveQueue(filteredQueue);
      this.notifyQueueUpdate();
    }
  }

  getQueueSize(): number {
    return this.getQueue().length;
  }

  hasPendingMessages(scenarioId?: string): boolean {
    const messages = this.getMessages(scenarioId);
    return messages.length > 0;
  }

  private notifyQueueUpdate(): void {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('offlineQueueUpdate', {
      detail: { queueSize: this.getQueueSize() }
    }));
  }

  // Process queue when back online
  async processQueue(processMessage: (message: QueuedMessage) => Promise<boolean>): Promise<void> {
    const queue = this.getQueue();
    const processedMessages: string[] = [];
    
    for (const message of queue) {
      try {
        const success = await processMessage(message);
        if (success) {
          processedMessages.push(message.id);
        } else {
          this.incrementRetryCount(message.id);
        }
      } catch (error) {
        console.error('Error processing queued message:', error);
        this.incrementRetryCount(message.id);
      }
    }
    
    // Remove successfully processed messages
    processedMessages.forEach(id => this.removeMessage(id));
  }
}

export const offlineQueueService = new OfflineQueueService();

// Clean up expired messages on service initialization
offlineQueueService.clearExpiredMessages(); 