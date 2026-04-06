// Simple read status management using localStorage
// This is a temporary solution without database changes

interface ReadStatus {
  [appointmentId: string]: number; // timestamp when last read
}

class ReadStatusManager {
  private static STORAGE_KEY = 'message_read_status';

  static markAsRead(appointmentId: string): void {
    try {
      const readStatus: ReadStatus = this.getReadStatus();
      readStatus[appointmentId] = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(readStatus));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  static getLastReadTime(appointmentId: string): number {
    try {
      const readStatus: ReadStatus = this.getReadStatus();
      return readStatus[appointmentId] || 0;
    } catch (error) {
      console.error('Failed to get read time:', error);
      return 0;
    }
  }

  static isMessageUnread(appointmentId: string, messageTimestamp: string): boolean {
    try {
      const lastReadTime = this.getLastReadTime(appointmentId);
      const messageTime = new Date(messageTimestamp).getTime();
      return messageTime > lastReadTime;
    } catch (error) {
      console.error('Failed to check message read status:', error);
      return false;
    }
  }

  private static getReadStatus(): ReadStatus {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse read status:', error);
      return {};
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear read status:', error);
    }
  }
}

export { ReadStatusManager };
