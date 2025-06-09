import { queryClient } from '@/lib/queryClient';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    try {
      this.ws = new WebSocket(`ws://${window.location.host}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    // Invalidate React Query cache based on message type
    switch (data.type) {
      case 'payment_updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
        break;
      case 'maintenance_request':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/maintenance-requests'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
        break;
      case 'inquiry_created':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
        break;
      case 'expense_updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/expenses'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/receipts'] });
        break;
      case 'notification_created':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
        break;
      case 'room_status_changed':
        queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
        break;
      default:
        // Invalidate all queries for unknown updates
        queryClient.invalidateQueries();
    }

    // Dispatch custom event for cross-tab communication
    window.dispatchEvent(new CustomEvent('dataUpdated', { 
      detail: { type: data.type, data: data.payload } 
    }));
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const wsManager = new WebSocketManager();

// Auto-connect when module loads
if (typeof window !== 'undefined') {
  wsManager.connect();
}