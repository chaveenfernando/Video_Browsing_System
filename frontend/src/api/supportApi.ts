import client from './client';

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'BUG' | 'FEATURE_REQUEST' | 'PERFORMANCE' | 'ACCOUNT' | 'CONTENT' | 'OTHER';
  resolutionNotes?: string;
  userId: number;
  userName: string;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: SupportTicket['priority'];
  category: SupportTicket['category'];
}

export interface UpdateStatusRequest {
  status: SupportTicket['status'];
  resolutionNotes?: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

const supportApi = {
  createTicket: (data: CreateTicketRequest) =>
    client.post<{ data: SupportTicket }>('/support/tickets', data),

  getAllTickets: () =>
    client.get<{ data: SupportTicket[] }>('/support/tickets'),

  getMyTickets: () =>
    client.get<{ data: SupportTicket[] }>('/support/tickets/my'),

  getTicketById: (id: number) =>
    client.get<{ data: SupportTicket }>(`/support/tickets/${id}`),

  getTicketsByStatus: (status: SupportTicket['status']) =>
    client.get<{ data: SupportTicket[] }>(`/support/tickets/status/${status}`),

  updateStatus: (id: number, data: UpdateStatusRequest) =>
    client.patch<{ data: SupportTicket }>(`/support/tickets/${id}/status`, data),

  updateTicket: (id: number, data: CreateTicketRequest) =>
    client.put<{ data: SupportTicket }>(`/support/tickets/${id}`, data),

  deleteTicket: (id: number) =>
    client.delete(`/support/tickets/${id}`),

  getDashboardStats: () =>
    client.get<{ data: DashboardStats }>('/support/dashboard/stats'),
};

export default supportApi;
