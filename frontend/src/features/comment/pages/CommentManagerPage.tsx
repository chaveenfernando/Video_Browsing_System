import React, { useEffect, useState } from 'react';
import commentApi, { Comment } from '../../../api/commentApi';
import CommentItem from '../components/CommentItem';

const CommentManagerPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PINNED' | 'HIDDEN'>('ALL');
  const [search, setSearch] = useState('');

  // Use videoId=1 as demo; in real app this comes from route params
  const videoId = 1;

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentApi.getAllCommentsByVideo(videoId);
      setComments(res.data.data ?? []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  const filtered = comments
    .filter(c => {
      if (filter === 'PINNED') return c.isPinned;
      if (filter === 'HIDDEN') return c.isHidden;
      return true;
    })
    .filter(c => c.content.toLowerCase().includes(search.toLowerCase()) || c.userName.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: comments.length,
    pinned: comments.filter(c => c.isPinned).length,
    hidden: comments.filter(c => c.isHidden).length,
    visible: comments.filter(c => !c.isHidden).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/20 to-gray-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Comment Manager</h1>
        <p className="text-gray-400 mt-1">Moderate, pin and manage video comments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'from-indigo-600/20 to-purple-600/20', border: 'border-indigo-500/30' },
          { label: 'Visible', value: stats.visible, color: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30' },
          { label: 'Pinned', value: stats.pinned, color: 'from-yellow-600/20 to-orange-600/20', border: 'border-yellow-500/30' },
          { label: 'Hidden', value: stats.hidden, color: 'from-gray-600/20 to-slate-600/20', border: 'border-gray-500/30' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-4`}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search comments or users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PINNED', 'HIDDEN'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Comment List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500">No comments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isManager={true}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentManagerPage;
