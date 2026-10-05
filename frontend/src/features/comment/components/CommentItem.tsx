import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../../../api/commentApi';
import commentApi from '../../../api/commentApi';
import {
  Pin,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Reply,
  ThumbsUp,
  Film,
  User,
  Shield,
  Send,
  X,
  Check,
} from 'lucide-react';

interface Props {
  comment: Comment;
  isManager?: boolean;
  onRefresh: () => void;
}

const CommentItem: React.FC<Props> = ({ comment, isManager = false, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(`@${comment.userName} `);

  const act = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      await fn();
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setLoading(true);
    try {
      await commentApi.editComment(comment.id, editText.trim());
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to edit comment');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      await commentApi.addComment({
        videoId: comment.videoId,
        content: replyText.trim(),
      });
      setIsReplying(false);
      setReplyText(`@${comment.userName} `);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000),
      h = Math.floor(m / 60),
      day = Math.floor(h / 24);
    if (day > 0) return `${day}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'Just now';
  };

  const isCommentManagerRole = comment.userRole === 'ROLE_COMMENT_MANAGER';
  const isCreatorRole = comment.userRole === 'ROLE_CONTENT_CREATOR';

  return (
    <div
      className={`group p-4 rounded-2xl border transition-all shadow-md ${
        comment.isPinned
          ? 'bg-amber-950/20 border-amber-500/30'
          : comment.isHidden
          ? 'bg-slate-900/40 border-slate-800 opacity-60'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md ${
            isCommentManagerRole
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : isCreatorRole
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}
        >
          {comment.userName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-white">@{comment.userName}</span>

            {/* Role Badge */}
            {isCommentManagerRole ? (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/30 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Comment Lead
              </span>
            ) : isCreatorRole ? (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30 flex items-center gap-1">
                Creator
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-500/30 flex items-center gap-1">
                <User className="w-2.5 h-2.5" /> Viewer
              </span>
            )}

            {/* Status Badges */}
            {comment.isPinned && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] font-bold rounded-md border border-yellow-500/30 flex items-center gap-1">
                <Pin className="w-2.5 h-2.5" /> PINNED
              </span>
            )}
            {comment.isHidden && (
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-md border border-rose-500/30 flex items-center gap-1">
                <EyeOff className="w-2.5 h-2.5" /> HIDDEN
              </span>
            )}
            {comment.isEdited && (
              <span className="text-[10px] text-slate-500 italic">(edited)</span>
            )}

            <span className="text-xs text-slate-500 ml-auto">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Video Title Context (shows which video this comment was posted on!) */}
          {comment.videoTitle && (
            <div className="mb-2">
              <Link
                to={`/watch/${comment.videoId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                <Film className="w-3 h-3 text-indigo-400" />
                <span className="line-clamp-1">Video: {comment.videoTitle}</span>
                <span className="text-[10px] text-slate-500">↗</span>
              </Link>
            </div>
          )}

          {/* Comment Content / Edit Form */}
          {isEditing ? (
            <div className="space-y-2 my-2">
              <textarea
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={loading || !editText.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Inline Reply Form */}
          {isReplying && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1 text-indigo-300">
                  <Reply className="w-3.5 h-3.5" /> Reply as Comment Lead to @{comment.userName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your official response..."
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={loading || !replyText.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" /> Post Reply
                </button>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-4 mt-3 pt-2 border-t border-slate-800/60 flex-wrap text-xs text-slate-400">
            {/* Like */}
            <button
              onClick={() => act(() => commentApi.likeComment(comment.id))}
              disabled={loading}
              className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{comment.likeCount || 0}</span>
            </button>

            {/* Reply Button */}
            <button
              onClick={() => {
                setIsReplying(!isReplying);
                setIsEditing(false);
              }}
              disabled={loading}
              className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>

            {isManager && (
              <>
                {/* Edit Button */}
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setIsReplying(false);
                  }}
                  disabled={loading}
                  className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                {/* Pin/Unpin */}
                <button
                  onClick={() =>
                    act(() =>
                      comment.isPinned ? commentApi.unpinComment(comment.id) : commentApi.pinComment(comment.id)
                    )
                  }
                  disabled={loading}
                  className={`flex items-center gap-1 transition-colors ${
                    comment.isPinned
                      ? 'text-yellow-400 hover:text-yellow-300 font-semibold'
                      : 'text-slate-400 hover:text-yellow-400'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  {comment.isPinned ? 'Unpin' : 'Pin'}
                </button>

                {/* Hide/Unhide */}
                <button
                  onClick={() =>
                    act(() =>
                      comment.isHidden ? commentApi.unhideComment(comment.id) : commentApi.hideComment(comment.id)
                    )
                  }
                  disabled={loading}
                  className="flex items-center gap-1 text-slate-400 hover:text-orange-400 transition-colors"
                >
                  {comment.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {comment.isHidden ? 'Unhide' : 'Hide'}
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (window.confirm(`Delete comment by @${comment.userName}?`)) {
                      act(() => commentApi.deleteComment(comment.id));
                    }
                  }}
                  disabled={loading}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
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
