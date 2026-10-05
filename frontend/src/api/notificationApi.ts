import client from './client';

export interface NotificationItem {
  id: number;
  recipientUsername?: string;
  recipientRole?: string;
  senderUsername?: string;
  senderName?: string;
  title: string;
  message: string;
  type: 'FAVOURITE' | 'LIKE' | 'COMMENT' | 'SUPPORT' | 'PLAYLIST' | 'SYSTEM';
  referenceId?: number;
  read: boolean;
  createdAt: string;
}

const notificationApi = {
  getNotifications: () =>
    client.get<{ data: NotificationItem[] }>('/notifications'),

  getUnreadCount: () =>
    client.get<{ data: { unreadCount: number } }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    client.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    client.post('/notifications/read-all'),
};

export default notificationApi;
