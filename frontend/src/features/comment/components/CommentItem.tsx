import React, { useState } from 'react';
import { Comment } from '../../../api/commentApi';
import commentApi from '../../../api/commentApi';

interface Props {
  comment: Comment;
  isManager?: boolean;
  onRefresh: () => void;
}

const CommentItem: React.FC<Props> = ({ comment, isManager = false, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const act = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try { await fn(); onRefresh(); } finally { setLoading(false); }
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24);
    if (day > 0) return `${day}d ago`;
    if (h > 0) return `${h}h ago`;
    return `${m}m ago`;
  };

  return (
    <div className={`group p-4 rounded-xl border transition-all ${
      comment.isPinned ? 'bg-yellow-500/5 border-yellow-500/20' :
      comment.isHidden ? 'bg-gray-800/40 border-gray-700/30 opacity-60' :
      'bg-white/3 border-white/8 hover:bg-white/5'
    }`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {comment.userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{comment.userName}</span>
            {comment.isPinned && (
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] font-bold rounded border border-yellow-500/30">📌 PINNED</span>
            )}
            {comment.isHidden && (
              <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-400 text-[10px] font-bold rounded border border-gray-500/30">HIDDEN</span>
            )}
            {comment.isEdited && (
              <span className="text-[10px] text-gray-500">(edited)</span>
            )}
            <span className="text-xs text-gray-500 ml-auto">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-300 mt-1 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => act(() => commentApi.likeComment(comment.id))}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {comment.likeCount}
            </button>

            {isManager && (
              <>
                <button
                  onClick={() => act(() => comment.isPinned ? commentApi.unpinComment(comment.id) : commentApi.pinComment(comment.id))}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-yellow-400 transition-colors"
                >
                  {comment.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => act(() => comment.isHidden ? commentApi.unhideComment(comment.id) : commentApi.hideComment(comment.id))}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-orange-400 transition-colors"
                >
                  {comment.isHidden ? 'Unhide' : 'Hide'}
                </button>
                <button
                  onClick={() => act(() => commentApi.deleteComment(comment.id))}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-auto"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
