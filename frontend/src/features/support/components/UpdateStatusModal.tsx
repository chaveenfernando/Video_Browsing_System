import React, { useState } from 'react';
import supportApi, { SupportTicket, UpdateStatusRequest } from '../../../api/supportApi';

interface Props {
  ticket: SupportTicket;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUSES: SupportTicket['status'][] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'];

const STATUS_COLORS: Record<SupportTicket['status'], string> = {
  OPEN: 'border-blue-500 text-blue-300 bg-blue-500/10',
  IN_PROGRESS: 'border-yellow-500 text-yellow-300 bg-yellow-500/10',
  RESOLVED: 'border-green-500 text-green-300 bg-green-500/10',
  CLOSED: 'border-gray-500 text-gray-300 bg-gray-500/10',
  REOPENED: 'border-orange-500 text-orange-300 bg-orange-500/10',
};

const UpdateStatusModal: React.FC<Props> = ({ ticket, onClose, onSuccess }) => {
  const [form, setForm] = useState<UpdateStatusRequest>({
    status: ticket.status,
    resolutionNotes: ticket.resolutionNotes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await supportApi.updateStatus(ticket.id, form);
      onSuccess();
    } catch {
      setError('Failed to update ticket status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Update Status</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ticket #{ticket.id} — {ticket.subject}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.status === s ? STATUS_COLORS[s] : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Resolution Notes</label>
            <textarea
              rows={3}
              value={form.resolutionNotes}
              onChange={e => setForm(f => ({ ...f, resolutionNotes: e.target.value }))}
              placeholder="Add notes about how this was resolved..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-violet-500 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
