// Real-time service for live updates when admin makes changes
class RealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      this.eventSource = new EventSource(`${baseUrl}/events`, {
        withCredentials: true
      });
      
      this.eventSource.onopen = () => {
        console.log('✅ Connected to real-time updates');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Real-time connection error:', error);
        this.isConnecting = false;
        
        // Close the failed connection
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Attempt to reconnect with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
          
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached. Real-time updates disabled.');
        }
      };

      // Listen for course updates
      this.eventSource?.addEventListener('course-created', (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners('course-created', data);
        } catch (error) {
          console.error('Error parsing course-created event:', error);
        }
      });

      this.eventSource?.addEventListener('course-updated', (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners('course-updated', data);
        } catch (error) {
          console.error('Error parsing course-updated event:', error);
        }
      });

      this.eventSource?.addEventListener('course-deleted', (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners('course-deleted', data);
        } catch (error) {
          console.error('Error parsing course-deleted event:', error);
        }
      });

      // Heartbeat to keep connection alive
      this.eventSource?.addEventListener('heartbeat', () => {
        // Connection is alive
      });

    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
      this.isConnecting = false;
    }
  }

  // Subscribe to specific events
  subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Manual refresh trigger (fallback)
  triggerRefresh(type: 'courses' | 'reviews' | 'testimonials') {
    this.notifyListeners(`${type}-refresh`, { timestamp: Date.now() });
  }

  // Force reconnect
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Get connection status
  getStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      return 'connected';
    } else if (this.isConnecting) {
      return 'connecting';
    }
    return 'disconnected';
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnecting = false;
  }
}

export const realtimeService = new RealtimeService();
