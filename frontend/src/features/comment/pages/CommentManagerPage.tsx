import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import commentApi, { Comment } from '../../../api/commentApi';
import { videoApi } from '../../../api/videoApi';
import { Video } from '../../../types';
import CommentItem from '../components/CommentItem';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  EyeOff,
  User,
  Shield,
  Film,
  X,
  Send,
  RefreshCw,
} from 'lucide-react';

const POLL_INTERVAL_MS = 5000;

const CommentManagerPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchDataRef = useRef<(silent?: boolean) => Promise<void>>(() => Promise.resolve());
  const [filter, setFilter] = useState<'ALL' | 'VIEWER' | 'PINNED' | 'HIDDEN'>('ALL');
  const [selectedVideoId, setSelectedVideoId] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  // Post comment modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [postVideoId, setPostVideoId] = useState<number | ''>('');
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);

  const fetchVideos = async () => {
    try {
      setVideosLoading(true);
      const videosList = await videoApi.getAllVideos();
      setVideos(videosList ?? []);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const commentsRes = await commentApi.getAllComments();
      const list = commentsRes.data.data ?? [];
      setComments(list);
      setLastRefreshed(new Date());
      setPollError(null);
    } catch (err: any) {
      console.error('[CommentManager] fetchData error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      setPollError(`Error: ${err?.response?.status || ''} - ${errMsg}`);
      if (!silent) setComments([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Keep ref always pointing to the latest fetchData (fixes stale closure in setInterval)
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    fetchVideos();
    // Start polling — always calls fetchDataRef.current so never stale
    setIsPolling(true);
    pollTimerRef.current = setInterval(() => {
      fetchDataRef.current(true);
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setIsPolling(false);
    };
  }, []);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postVideoId || !postContent.trim()) return;
    try {
      setPosting(true);
      await commentApi.addComment({
        videoId: Number(postVideoId),
        content: postContent.trim(),
      });
      setShowPostModal(false);
      setPostContent('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  // Stats calculation
  const viewerCommentsCount = useMemo(
    () => comments.filter((c) => c.userRole === 'ROLE_GENERAL_VIEWER' || !c.userRole).length,
    [comments]
  );
  const pinnedCommentsCount = useMemo(
    () => comments.filter((c) => c.isPinned).length,
    [comments]
  );
  const hiddenCommentsCount = useMemo(
    () => comments.filter((c) => c.isHidden).length,
    [comments]
  );

  // Filtered comments
  const filteredComments = useMemo(() => {
    return comments
      .filter((c) => {
        if (filter === 'VIEWER') {
          return c.userRole === 'ROLE_GENERAL_VIEWER' || !c.userRole;
        }
        if (filter === 'PINNED') return c.isPinned;
        if (filter === 'HIDDEN') return c.isHidden;
        return true;
      })
      .filter((c) => {
        if (selectedVideoId === 'ALL') return true;
        return c.videoId === Number(selectedVideoId);
      })
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          c.content.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          (c.videoTitle && c.videoTitle.toLowerCase().includes(q))
        );
      });
  }, [comments, filter, selectedVideoId, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/20 to-gray-950 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Comment Moderation</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Comment Lead
              </span>
              {isPolling && !pollError && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  LIVE
                </span>
              )}
              {pollError && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  {pollError}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-0.5">
              Oversee, reply to, pin, and moderate viewer comments across all platform videos
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            title="Refresh now"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 hover:text-white transition-all text-sm border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => {
              setPostVideoId('');
              setPostContent('');
              fetchVideos();
              setShowPostModal(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/20 text-sm"
          >
            <Plus className="w-4 h-4" /> Post New Comment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Comments</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{comments.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all platform videos</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-indigo-300 text-xs mb-1">
            <span>Viewer Comments</span>
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{viewerCommentsCount}</p>
          <p className="text-[11px] text-indigo-300/60 mt-0.5">From registered viewers</p>
        </div>

        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
            <span>Pinned Comments</span>
            <Pin className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{pinnedCommentsCount}</p>
          <p className="text-[11px] text-amber-300/60 mt-0.5">Featured on videos</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hidden / Filtered</span>
            <EyeOff className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{hiddenCommentsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Moderated comments</p>
        </div>
      </div>

      {/* Filter Tabs & Search & Video Selector */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl flex-wrap">
            {[
              { id: 'ALL' as const, label: 'All Comments', count: comments.length },
              { id: 'VIEWER' as const, label: 'Viewer Comments', count: viewerCommentsCount, highlight: true },
              { id: 'PINNED' as const, label: 'Pinned', count: pinnedCommentsCount },
              { id: 'HIDDEN' as const, label: 'Hidden', count: hiddenCommentsCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    filter === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.highlight
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Video Filter Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex-1 lg:flex-none">
              <Film className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <select
                value={selectedVideoId}
                onChange={(e) =>
                  setSelectedVideoId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                }
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer max-w-[200px] truncate"
                style={{ backgroundColor: '#0f172a', colorScheme: 'dark' }}
              >
                <option value="ALL">All Videos ({videos.length})</option>
                {videos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search comments, users, videos..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-20 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-xl">
            <MessageSquare className="w-9 h-9 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {search ? 'No matching comments found' : 'No comments in this view'}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-6">
            {search
              ? 'Try modifying your search keywords.'
              : filter === 'VIEWER'
              ? 'No comments have been posted by viewers yet.'
              : 'Comments posted on any video will appear here in real-time.'}
          </p>
          <button
            onClick={() => {
              setPostVideoId('');
              setPostContent('');
              fetchVideos();
              setShowPostModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all text-xs"
          >
            <Plus className="w-4 h-4" /> Post Comment as Lead
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isManager={true}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      {/* Modal: Post New Comment as Comment Manager */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Post Comment as Lead</h2>
                    <p className="text-[11px] text-slate-400">Post an official comment on any video</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateComment} className="space-y-4">
                {/* Select Video */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Video to Comment On *
                  </label>
                  <select
                    required
                    value={postVideoId}
                    onChange={(e) => setPostVideoId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    style={{ backgroundColor: '#0f172a', colorScheme: 'dark' }}
                  >
                    <option value="" disabled>
                      {videosLoading ? 'Loading videos...' : videos.length === 0 ? 'No videos available' : '-- Select a video --'}
                    </option>
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comment Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Comment Content *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your comment or announcement..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={posting || !postContent.trim() || !postVideoId}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {posting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagerPage;
