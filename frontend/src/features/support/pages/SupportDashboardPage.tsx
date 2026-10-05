import React, { useEffect, useState } from 'react';
import supportApi, { SupportTicket, DashboardStats } from '../../../api/supportApi';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import UpdateStatusModal from '../components/UpdateStatusModal';
import TicketDetailModal from '../components/TicketDetailModal';

type FilterType = SupportTicket['status'] | 'ALL' | 'VIDEO';

const SupportDashboardPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        supportApi.getAllTickets(),
        supportApi.getDashboardStats(),
      ]);
      const list = ticketsRes.data.data ?? [];
      setTickets(list);
      setStats(statsRes.data.data ?? null);
      // If currently viewing a ticket, refresh its state
      if (viewingTicket) {
        const updated = list.find(t => t.id === viewingTicket.id);
        if (updated) setViewingTicket(updated);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (ticket: SupportTicket) => {
    if (!window.confirm(`Delete ticket #${ticket.id}?`)) return;
    await supportApi.deleteTicket(ticket.id);
    fetchData();
  };

  const handleStatusChange = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowStatusModal(true);
  };

  const videoCount = tickets.filter(t => t.subject.startsWith('Video Issue:') || t.description.includes('Video ID:')).length;

  const filtered = activeFilter === 'ALL'
    ? tickets
    : activeFilter === 'VIDEO'
    ? tickets.filter(t => t.subject.startsWith('Video Issue:') || t.description.includes('Video ID:'))
    : tickets.filter(t => t.status === activeFilter);

  const FILTERS: Array<{ label: string; value: FilterType; count?: number }> = [
    { label: 'All', value: 'ALL', count: stats?.total },
    { label: '🎬 Video Reports', value: 'VIDEO', count: videoCount },
    { label: 'Open', value: 'OPEN', count: stats?.open },
    { label: 'In Progress', value: 'IN_PROGRESS', count: stats?.inProgress },
    { label: 'Resolved', value: 'RESOLVED', count: stats?.resolved },
    { label: 'Closed', value: 'CLOSED', count: stats?.closed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Desk</h1>
          <p className="text-gray-400 mt-1">Track and manage support tickets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-900/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'from-purple-600/20 to-violet-600/20', border: 'border-purple-500/30' },
            { label: 'Open', value: stats.open, color: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/30' },
            { label: 'In Progress', value: stats.inProgress, color: 'from-yellow-600/20 to-orange-600/20', border: 'border-yellow-500/30' },
            { label: 'Resolved', value: stats.resolved, color: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30' },
            { label: 'Closed', value: stats.closed, color: 'from-gray-600/20 to-slate-600/20', border: 'border-gray-500/30' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-4`}>
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === f.value
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f.label} {f.count !== undefined && <span className="ml-1 opacity-70">({f.count})</span>}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => setViewingTicket(ticket)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {viewingTicket && (
        <TicketDetailModal
          ticket={viewingTicket}
          onClose={() => setViewingTicket(null)}
          onUpdate={fetchData}
          onDelete={handleDelete}
        />
      )}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchData(); }}
        />
      )}
      {showStatusModal && selectedTicket && (
        <UpdateStatusModal
          ticket={selectedTicket}
          onClose={() => { setShowStatusModal(false); setSelectedTicket(null); }}
          onSuccess={() => { setShowStatusModal(false); setSelectedTicket(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default SupportDashboardPage;
