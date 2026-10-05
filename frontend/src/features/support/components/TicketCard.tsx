import React from 'react';
import { SupportTicket } from '../../../api/supportApi';

interface Props {
  ticket: SupportTicket;
  onClick?: () => void;
  onStatusChange?: (ticket: SupportTicket) => void;
  onDelete?: (ticket: SupportTicket) => void;
}

const STATUS_COLORS: Record<SupportTicket['status'], string> = {
  OPEN: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  RESOLVED: 'bg-green-500/20 text-green-300 border-green-500/40',
  CLOSED: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  REOPENED: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
};

const PRIORITY_COLORS: Record<SupportTicket['priority'], string> = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-blue-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
};

const PRIORITY_DOTS: Record<SupportTicket['priority'], string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-blue-400',
  HIGH: 'bg-orange-400',
  CRITICAL: 'bg-red-400',
};

const TicketCard: React.FC<Props> = ({ ticket, onClick, onStatusChange, onDelete }) => {
  const isVideoIssue = ticket.subject.startsWith('Video Issue:') || ticket.description.includes('Video ID:');

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    return `${mins}m ago`;
  };

  return (
    <div
      className={`group border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
        isVideoIssue
          ? 'bg-amber-950/15 border-amber-500/25 hover:bg-amber-950/25 hover:border-amber-500/40'
          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOTS[ticket.priority]}`} />
            <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
            <span className="text-xs text-gray-500">{ticket.category.replace('_', ' ')}</span>
            {isVideoIssue && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                🎬 Video
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {ticket.subject}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
        </div>
        <span className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[ticket.status]}`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span className="text-xs text-gray-500">by {ticket.userName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{timeAgo(ticket.createdAt)}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onStatusChange && (
              <button
                onClick={e => { e.stopPropagation(); onStatusChange(ticket); }}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                title="Update Status"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(ticket); }}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete Ticket"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
