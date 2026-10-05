import React, { useState } from 'react';
import supportApi, { CreateTicketRequest } from '../../../api/supportApi';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const CATEGORIES = ['BUG', 'FEATURE_REQUEST', 'PERFORMANCE', 'ACCOUNT', 'CONTENT', 'OTHER'] as const;

const CreateTicketModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateTicketRequest>({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    category: 'BUG',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Subject and description are required');
      return;
    }
    try {
      setLoading(true);
      await supportApi.createTicket(form);
      onSuccess();
    } catch {
      setError('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Create Support Ticket</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Brief summary of the issue..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Provide detailed information about the issue..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as CreateTicketRequest['priority'] }))}
                className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm cursor-pointer"
                style={{ backgroundColor: '#1e1b2e', colorScheme: 'dark' }}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p} style={{ backgroundColor: '#1e1b2e', color: '#fff' }}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as CreateTicketRequest['category'] }))}
                className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm cursor-pointer"
                style={{ backgroundColor: '#1e1b2e', colorScheme: 'dark' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} style={{ backgroundColor: '#1e1b2e', color: '#fff' }}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-violet-500 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
