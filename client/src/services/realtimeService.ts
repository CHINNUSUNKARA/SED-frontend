// Real-time service for live updates when admin makes changes
class RealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Using EventSource for server-sent events
      this.eventSource = new EventSource('/api/events');
      
      this.eventSource.onopen = () => {
        console.log('Connected to real-time updates');
      };

      this.eventSource.onerror = (error) => {
        console.error('Real-time connection error:', error);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };

      // Listen for course updates
      this.eventSource?.addEventListener('course-created', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('course-created', data);
      });

      this.eventSource?.addEventListener('course-updated', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('course-updated', data);
      });

      this.eventSource?.addEventListener('course-deleted', (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners('course-deleted', data);
      });

    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
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
      callbacks.forEach(callback => callback(data));
    }
  }

  // Manual refresh trigger (fallback)
  triggerRefresh(type: 'courses' | 'reviews' | 'testimonials') {
    this.notifyListeners(`${type}-refresh`, { timestamp: Date.now() });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const realtimeService = new RealtimeService();
