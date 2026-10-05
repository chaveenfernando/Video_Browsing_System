import React, { useState } from 'react';
import { SupportTicket, UpdateStatusRequest } from '../../../api/supportApi';
import supportApi from '../../../api/supportApi';

interface Props {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (ticket: SupportTicket) => void;
}

const STATUS_COLORS: Record<SupportTicket['status'], string> = {
  OPEN: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  RESOLVED: 'bg-green-500/20 text-green-300 border-green-500/40',
  CLOSED: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  REOPENED: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
};

const PRIORITY_BADGES: Record<SupportTicket['priority'], string> = {
  LOW: 'bg-slate-700/50 text-slate-300 border-slate-600',
  MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const TicketDetailModal: React.FC<Props> = ({ ticket, onClose, onUpdate, onDelete }) => {
  const [status, setStatus] = useState<SupportTicket['status']>(ticket.status);
  const [notes, setNotes] = useState(ticket.resolutionNotes ?? '');
  const [updating, setUpdating] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Extract video ID and info if present
  const isVideoIssue = ticket.subject.startsWith('Video Issue:') || ticket.description.includes('Video ID:');
  const videoIdMatch = ticket.description.match(/Video ID:\s*([a-zA-Z0-9_-]+)/);
  const videoTitleMatch = ticket.description.match(/Video:\s*([^\r\n]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  const videoTitle = videoTitleMatch ? videoTitleMatch[1] : null;

  // Clean user-written description without the auto-appended video metadata
  const userDescription = ticket.description.split('---')[0].trim();

  const handleSaveStatus = async (newStatus: SupportTicket['status']) => {
    try {
      setUpdating(true);
      const req: UpdateStatusRequest = {
        status: newStatus,
        resolutionNotes: notes,
      };
      await supportApi.updateStatus(ticket.id, req);
      setStatus(newStatus);
      setSavedMsg('Status updated successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
      onUpdate();
    } catch {
      alert('Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setUpdating(true);
      const req: UpdateStatusRequest = {
        status,
        resolutionNotes: notes,
      };
      await supportApi.updateStatus(ticket.id, req);
      setSavedMsg('Resolution notes saved!');
      setTimeout(() => setSavedMsg(''), 3000);
      onUpdate();
    } catch {
      alert('Failed to save resolution notes');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                #{ticket.id}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status]}`}>
                {status.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${PRIORITY_BADGES[ticket.priority]}`}>
                {ticket.priority}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {ticket.category.replace('_', ' ')}
              </span>
              {isVideoIssue && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                  🎬 Video Report
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white break-words">{ticket.subject}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span>Reported by <strong className="text-slate-200">{ticket.userName}</strong></span>
              <span>•</span>
              <span>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {savedMsg && (
            <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{savedMsg}</span>
            </div>
          )}

          {/* Reported Video Information Card */}
          {isVideoIssue && (
            <div className="rounded-xl bg-gradient-to-r from-amber-950/40 via-orange-950/20 to-slate-900 border border-amber-500/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                    <span>🎬 Reported Video</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {videoTitle || 'Reported Video'}
                  </h4>
                  {videoId && (
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Video ID: {videoId}
                    </p>
                  )}
                </div>
                {videoId && (
                  <a
                    href={`/watch/${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <span>Inspect Video</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Viewer's Problem Description
            </label>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {userDescription || ticket.description}
            </div>
          </div>

          {/* Change Status Fast Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Update Support Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as SupportTicket['status'][]).map(s => (
                <button
                  key={s}
                  type="button"
                  disabled={updating}
                  onClick={() => handleSaveStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    status === s
                      ? `${STATUS_COLORS[s]} shadow-md scale-[1.02]`
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {s === 'IN_PROGRESS' ? '⏳ In Progress' : s === 'RESOLVED' ? '✅ Resolved' : s === 'CLOSED' ? '🔒 Closed' : '🔵 Open'}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resolution & Technical Notes
              </label>
              <button
                type="button"
                disabled={updating}
                onClick={handleSaveNotes}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Save Notes
              </button>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record technical action taken (e.g., re-encoded video, cleared CDN cache, fixed audio stream)..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-xs resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm(`Delete ticket #${ticket.id}?`)) {
                onDelete(ticket);
                onClose();
              }
            }}
            className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            Delete Ticket
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
