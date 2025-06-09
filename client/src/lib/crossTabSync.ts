import { queryClient } from '@/lib/queryClient';

class CrossTabSyncManager {
  private channel: BroadcastChannel;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.channel = new BroadcastChannel('easystay-sync');
    this.setupListeners();
  }

  private setupListeners() {
    this.channel.addEventListener('message', (event) => {
      const { type, data } = event.data;
      this.handleMessage(type, data);
    });

    // Listen for storage events (for cross-tab communication when BroadcastChannel isn't available)
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('easystay-sync-')) {
        const type = event.key.replace('easystay-sync-', '');
        const data = event.newValue ? JSON.parse(event.newValue) : null;
        this.handleMessage(type, data);
      }
    });
  }

  private handleMessage(type: string, data: any) {
    // Invalidate relevant React Query caches
    switch (type) {
      case 'payment-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
        break;
      case 'expense-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/expenses'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/receipts'] });
        break;
      case 'receipt-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/receipts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/expenses'] });
        break;
      case 'maintenance-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/maintenance-requests'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
        break;
      case 'inquiry-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
        break;
      case 'guest-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
        break;
      case 'room-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
        break;
      case 'notification-updated':
        queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
        break;
      default:
        // For unknown updates, refresh all financial data
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/expenses'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/receipts'] });
    }

    // Notify local listeners
    const typeListeners = this.listeners.get(type) || [];
    typeListeners.forEach(listener => listener(data));
  }

  broadcast(type: string, data?: any) {
    const message = { type, data, timestamp: Date.now() };
    
    // Use BroadcastChannel
    this.channel.postMessage(message);
    
    // Fallback to localStorage for broader compatibility
    localStorage.setItem(`easystay-sync-${type}`, JSON.stringify(data));
    setTimeout(() => {
      localStorage.removeItem(`easystay-sync-${type}`);
    }, 1000);
  }

  subscribe(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type) || [];
      const index = typeListeners.indexOf(callback);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    };
  }

  // Convenience methods for common operations
  notifyPaymentUpdate(paymentData?: any) {
    this.broadcast('payment-updated', paymentData);
  }

  notifyExpenseUpdate(expenseData?: any) {
    this.broadcast('expense-updated', expenseData);
  }

  notifyReceiptUpdate(receiptData?: any) {
    this.broadcast('receipt-updated', receiptData);
  }

  notifyMaintenanceUpdate(maintenanceData?: any) {
    this.broadcast('maintenance-updated', maintenanceData);
  }

  notifyInquiryUpdate(inquiryData?: any) {
    this.broadcast('inquiry-updated', inquiryData);
  }

  notifyGuestUpdate(guestData?: any) {
    this.broadcast('guest-updated', guestData);
  }

  notifyRoomUpdate(roomData?: any) {
    this.broadcast('room-updated', roomData);
  }

  notifyNotificationUpdate(notificationData?: any) {
    this.broadcast('notification-updated', notificationData);
  }
}

export const crossTabSync = new CrossTabSyncManager();