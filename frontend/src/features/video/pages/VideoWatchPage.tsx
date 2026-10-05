import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Eye,
  ThumbsUp,
  Calendar,
  Share2,
  Tag,
  ArrowLeft,
  Heart,
  ListPlus,
  Flag,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  Send,
  X,
  Sparkles,
  Headset,
  AlertTriangle,
  Wifi,
  Monitor,
  Volume2,
  HelpCircle,
} from 'lucide-react';
import { videoApi } from '../../../api/videoApi';
import favouriteApi from '../../../api/favouriteApi';
import playlistApi, { Playlist } from '../../../api/playlistApi';
import supportApi, { CreateTicketRequest } from '../../../api/supportApi';
import commentApi, { Comment } from '../../../api/commentApi';
import { Video } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { VideoCard } from '../components/VideoCard';
import { useAuth } from '../../../context/AuthContext';

export const VideoWatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comments State
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Playlist Modal State
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [playlistLoading, setPlaylistLoading] = useState(false);

  // Report/Support Ticket Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<CreateTicketRequest['category']>('CONTENT');
  const [reportPriority, setReportPriority] = useState<CreateTicketRequest['priority']>('MEDIUM');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const isCommentManager = user?.role === 'ROLE_COMMENT_MANAGER';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchComments = async (videoId: number) => {
    try {
      const res = await commentApi.getCommentsByVideo(videoId);
      setComments(res.data.data || []);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setHasLiked(false);

    videoApi
      .getVideoById(Number(id))
      .then((data) => {
        setVideo(data);
        fetchComments(data.id);
        return videoApi.getAllVideos({ categoryId: data.categoryId, sort: 'views' });
      })
      .then((all) => {
        setRelatedVideos(all.filter((v) => v.id !== Number(id)).slice(0, 4));
        if (isAuthenticated) {
          return favouriteApi.checkFavourite(Number(id));
        }
        return { data: { data: false } };
      })
      .then((favRes) => {
        setIsFavourited(favRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const handleLike = async () => {
    if (!video || hasLiked) return;
    try {
      const updated = await videoApi.likeVideo(video.id);
      setVideo(updated);
      setHasLiked(true);
      showToast('👍 You liked this video! Content Creator has been notified.');
    } catch (err) {
      console.error('Failed to like video', err);
    }
  };

  const handleFavourite = async () => {
    if (!video || !isAuthenticated) {
      alert('Please log in to add to favourites!');
      return;
    }
    try {
      if (isFavourited) {
        await favouriteApi.removeFavourite(video.id);
        setIsFavourited(false);
        showToast('💔 Video removed from your favourites.');
      } else {
        await favouriteApi.addFavourite(video.id);
        setIsFavourited(true);
        showToast('💖 Video added to favourites! Favourite Manager & Creator have been notified.');
      }
    } catch (err: any) {
      console.error('Failed to toggle favourite', err);
      const msg = err.response?.data?.message || 'Failed to update favourite. Please restart the backend server in IntelliJ.';
      showToast('⚠️ ' + msg);
    }
  };

  // Comments Handlers
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !commentText.trim()) return;
    if (!isAuthenticated) {
      alert('Please log in to post a comment!');
      return;
    }

    try {
      setCommentSubmitting(true);
      await commentApi.addComment({ videoId: video.id, content: commentText.trim() });
      setCommentText('');
      await fetchComments(video.id);
      showToast('💬 Comment posted! Comment Manager & Creator have been notified.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      await commentApi.likeComment(commentId);
      if (video) fetchComments(video.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentApi.deleteComment(commentId);
      if (video) fetchComments(video.id);
      showToast('🗑️ Comment deleted.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editingText.trim()) return;
    try {
      await commentApi.editComment(commentId, editingText.trim());
      setEditingId(null);
      if (video) fetchComments(video.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (c: Comment) => {
    try {
      if (c.isPinned) {
        await commentApi.unpinComment(c.id);
      } else {
        await commentApi.pinComment(c.id);
      }
      if (video) fetchComments(video.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Playlist Handlers
  const openPlaylistModal = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save to playlists!');
      return;
    }
    setIsPlaylistModalOpen(true);
    try {
      setPlaylistLoading(true);
      const res = await playlistApi.getMyPlaylists();
      setMyPlaylists(res.data.data || []);
    } catch {
      setMyPlaylists([]);
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!video) return;
    try {
      await playlistApi.addVideoToPlaylist(playlistId, video.id);
      setIsPlaylistModalOpen(false);
      showToast('📑 Video added to playlist! Playlist Manager notified.');
    } catch (err: any) {
      const msg = err.response?.status === 403
        ? 'Access Denied (403): Please restart the Spring Boot backend in IntelliJ so new security permissions take effect.'
        : (err.response?.data?.message || 'Video already in this playlist');
      alert(msg);
    }
  };

  const handleCreateAndAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !newPlaylistTitle.trim()) return;
    try {
      const created = await playlistApi.createPlaylist({
        title: newPlaylistTitle.trim(),
        description: 'Created by viewer',
        isPublic: true,
      });
      await playlistApi.addVideoToPlaylist(created.data.data.id, video.id);
      setNewPlaylistTitle('');
      setIsPlaylistModalOpen(false);
      showToast('🎉 Playlist created and video added! Playlist Manager notified.');
    } catch (err: any) {
      const msg = err.response?.status === 403
        ? 'Access Denied (403): Please restart the Spring Boot backend in IntelliJ so new security permissions take effect.'
        : (err.response?.data?.message || 'Failed to create playlist');
      alert(msg);
    }
  };

  // Report/Support Handlers
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !reportDesc.trim()) return;
    if (!isAuthenticated) {
      alert('Please log in to submit a report!');
      return;
    }

    try {
      setReportSubmitting(true);
      await supportApi.createTicket({
        subject: `Video Issue: "${video.title}"`,
        description: `Video ID: ${video.id}\nURL: ${video.videoUrl}\n\nViewer Report:\n${reportDesc.trim()}`,
        priority: reportPriority,
        category: reportCategory,
      });
      setIsReportModalOpen(false);
      setReportDesc('');
      showToast('🚨 Support ticket submitted! Technical Supporter has been notified.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('🔗 Video link copied to clipboard!');
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const day = Math.floor(h / 24);
    if (day > 0) return `${day}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-white">Video not found</h2>
        <Link to="/">
          <Button variant="outline">Back to Browse</Button>
        </Link>
      </div>
    );
  }

  const uploadDate = new Date(video.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 text-white text-sm font-semibold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to browse</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Stream & Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Video Player */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
            {(() => {
              const ytMatch = video.videoUrl.match(
                /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
              );
              if (ytMatch && ytMatch[1]) {
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`}
                    title={video.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                );
              }
              return (
                <video
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              );
            })()}
          </div>

          {/* Title & Metadata Header */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {video.title}
            </h1>

            {/* YouTube-Style Viewer Interaction Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              {/* Creator details */}
              <div className="flex items-center gap-3">
                <img
                  src={video.creatorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${video.creatorName}`}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/30 bg-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{video.creatorName}</h4>
                  <p className="text-xs text-indigo-400 font-semibold">Content Creator</p>
                </div>
              </div>

              {/* Action Buttons: Like, Save to Fav, Save to Playlist, Report, Share */}
              <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-300">{video.viewsCount.toLocaleString()}</span>
                  <span className="hidden sm:inline">views</span>
                </div>

                {/* LIKE */}
                <Button
                  variant={hasLiked ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleLike}
                  disabled={hasLiked}
                  className="gap-1.5"
                  title="Like this video"
                >
                  <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{video.likesCount.toLocaleString()}</span>
                </Button>

                {/* SAVE TO FAVOURITE */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFavourite}
                  className={`gap-1.5 ${isFavourited ? 'text-pink-400 border-pink-500/30 bg-pink-950/20' : ''}`}
                  title="Save to Favourites"
                >
                  <Heart className={`w-4 h-4 ${isFavourited ? 'fill-current text-pink-500' : ''}`} />
                  <span>{isFavourited ? 'Saved' : 'Save'}</span>
                </Button>

                {/* SAVE TO PLAYLIST */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openPlaylistModal}
                  className="gap-1.5"
                  title="Add to Playlist"
                >
                  <ListPlus className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline">Playlist</span>
                </Button>

                {/* SHARE */}
                <Button variant="secondary" size="sm" onClick={handleShare} className="gap-1.5" title="Share Video">
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline">Share</span>
                </Button>

                {/* REPORT VIDEO / SUPPORT */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportModalOpen(true)}
                  className="gap-1 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10"
                  title="Report Issue to Technical Support"
                >
                  <Flag className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Video Description Box */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {uploadDate}
                </span>
                {video.categoryName && (
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {video.categoryName}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {video.description || 'No description provided for this video.'}
              </p>

              {video.tags && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {video.tags.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================== */}
            {/* YOUTUBE-STYLE COMMENTS SECTION                            */}
            {/* ========================================================== */}
            <div className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span>Comments ({comments.length})</span>
                </h3>
                <span className="text-xs text-slate-400">Join the discussion</span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'V'}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={isAuthenticated ? 'Add a comment...' : 'Log in to join the conversation...'}
                    disabled={!isAuthenticated || commentSubmitting}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                  />
                  {commentText.trim() && (
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommentText('')}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={commentSubmitting}
                        className="gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{commentSubmitting ? 'Posting...' : 'Comment'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  comments.map((c) => {
                    const isOwner = user?.username === c.userName;
                    const canModerate = isCommentManager || isOwner;

                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-xl border transition-all ${
                          c.isPinned
                            ? 'bg-yellow-500/5 border-yellow-500/25 ring-1 ring-yellow-500/20'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {c.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-bold text-white">@{c.userName}</span>
                              {c.isPinned && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                  <Pin className="w-2.5 h-2.5" /> Pinned
                                </span>
                              )}
                              {c.isEdited && (
                                <span className="text-[10px] text-slate-500">(edited)</span>
                              )}
                              <span className="text-[11px] text-slate-500 ml-auto">{timeAgo(c.createdAt)}</span>
                            </div>

                            {/* Editing mode */}
                            {editingId === c.id ? (
                              <div className="space-y-2 mt-2">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditComment(c.id)}
                                    className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[11px] font-semibold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-300 leading-relaxed break-words">{c.content}</p>
                            )}

                            {/* Comment Actions: Like, Edit, Delete, Pin */}
                            <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
                              <button
                                onClick={() => handleLikeComment(c.id)}
                                className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{c.likeCount || 0}</span>
                              </button>

                              {isOwner && (
                                <button
                                  onClick={() => {
                                    setEditingId(c.id);
                                    setEditingText(c.content);
                                  }}
                                  className="flex items-center gap-1 hover:text-white transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                              )}

                              {canModerate && (
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              )}

                              {isCommentManager && (
                                <button
                                  onClick={() => handleTogglePin(c)}
                                  className="flex items-center gap-1 hover:text-yellow-400 transition-colors ml-auto"
                                >
                                  <Pin className="w-3 h-3" /> {c.isPinned ? 'Unpin' : 'Pin'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Recommended Videos + Support Widget */}
        <div className="space-y-6">
          {/* Recommended */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white pb-2 border-b border-slate-800">
              Recommended Content
            </h3>
            <div className="space-y-4">
              {relatedVideos.map((rVideo) => (
                <VideoCard key={rVideo.id} video={rVideo} />
              ))}
            </div>
          </div>

          {/* ─── TECHNICAL SUPPORT WIDGET ─── */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-orange-950/30 to-slate-900/80 border border-amber-500/25 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-amber-500/15 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-600/30 flex-shrink-0">
                <Headset className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Having a Problem?</h4>
                <p className="text-[10px] text-amber-300/70 font-medium">Report directly to Technical Support</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Quick-select issue type chips */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">What's the issue?</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { label: 'Video not loading', icon: Monitor, cat: 'BUG' as const, pri: 'HIGH' as const },
                    { label: 'Poor quality', icon: Eye, cat: 'PERFORMANCE' as const, pri: 'MEDIUM' as const },
                    { label: 'Buffering / Lag', icon: Wifi, cat: 'PERFORMANCE' as const, pri: 'MEDIUM' as const },
                    { label: 'No audio', icon: Volume2, cat: 'BUG' as const, pri: 'HIGH' as const },
                    { label: 'Wrong content', icon: AlertTriangle, cat: 'CONTENT' as const, pri: 'HIGH' as const },
                    { label: 'Other issue', icon: HelpCircle, cat: 'OTHER' as const, pri: 'LOW' as const },
                  ] as const).map(({ label, icon: Icon, cat, pri }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setReportCategory(cat);
                        setReportPriority(pri);
                        setReportDesc((prev) => prev || label + ': ');
                        setIsReportModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-amber-500/50 hover:bg-amber-950/30 text-slate-300 hover:text-amber-300 text-[11px] font-semibold transition-all text-left"
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-600 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Full report button */}
              <button
                onClick={() => {
                  setReportCategory('OTHER');
                  setReportPriority('MEDIUM');
                  setReportDesc('');
                  setIsReportModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-900/30"
              >
                <Flag className="w-3.5 h-3.5" />
                Report a Different Issue
              </button>

              <p className="text-center text-[10px] text-slate-600 leading-relaxed">
                Your report is sent directly to the<br />
                <span className="text-amber-400/70 font-semibold">Technical Supporter</span> for review.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: SAVE TO PLAYLIST MODAL                                */}
      {/* ============================================================== */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-indigo-400" />
                <span>Save to Playlist</span>
              </h3>
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {playlistLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading playlists...</div>
            ) : myPlaylists.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                You don't have any playlists yet. Create your first playlist below:
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {myPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handleAddToPlaylist(pl.id)}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/60 hover:border-indigo-500/50 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{pl.title}</h4>
                      <p className="text-[11px] text-slate-400">{pl.videoCount} videos</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Add
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Create New Playlist Form */}
            <form onSubmit={handleCreateAndAddPlaylist} className="pt-2 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-400">Or Create New Playlist</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. My Study List"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <Button type="submit" size="sm">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: REPORT VIDEO / TECHNICAL SUPPORT TICKET               */}
      {/* ============================================================== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-950/60 to-orange-950/40 px-6 py-4 border-b border-amber-500/15 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Headset className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Report Video Issue</h3>
                  <p className="text-[10px] text-amber-300/70 font-medium mt-0.5">
                    Sent directly to Technical Supporter
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsReportModalOpen(false); setReportDesc(''); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Which video */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <Flag className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Reporting issue for</p>
                  <p className="text-xs font-bold text-white line-clamp-2">{video?.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Video ID: {video?.id}</p>
                </div>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Issue Type</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value as CreateTicketRequest['category'])}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      style={{ backgroundColor: '#0f172a', colorScheme: 'dark' }}
                    >
                      <option value="BUG" style={{ backgroundColor: '#0f172a', color: '#fff' }}>🐛 Player Bug / Glitch</option>
                      <option value="PERFORMANCE" style={{ backgroundColor: '#0f172a', color: '#fff' }}>⚡ Buffering / Lag</option>
                      <option value="CONTENT" style={{ backgroundColor: '#0f172a', color: '#fff' }}>⚠️ Wrong / Bad Content</option>
                      <option value="OTHER" style={{ backgroundColor: '#0f172a', color: '#fff' }}>❓ Other Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Severity</label>
                    <select
                      value={reportPriority}
                      onChange={(e) => setReportPriority(e.target.value as CreateTicketRequest['priority'])}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      style={{ backgroundColor: '#0f172a', colorScheme: 'dark' }}
                    >
                      <option value="LOW" style={{ backgroundColor: '#0f172a', color: '#fff' }}>🟢 Low</option>
                      <option value="MEDIUM" style={{ backgroundColor: '#0f172a', color: '#fff' }}>🟡 Medium</option>
                      <option value="HIGH" style={{ backgroundColor: '#0f172a', color: '#fff' }}>🔴 High</option>
                      <option value="CRITICAL" style={{ backgroundColor: '#0f172a', color: '#fff' }}>🚨 Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Describe the Problem *</label>
                  <textarea
                    rows={4}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="e.g. The video stops loading at the 2-minute mark. Tried refreshing multiple times..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-none placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => { setIsReportModalOpen(false); setReportDesc(''); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={reportSubmitting || !reportDesc.trim()}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold gap-1.5"
                  >
                    <Headset className="w-3.5 h-3.5" />
                    {reportSubmitting ? 'Sending...' : 'Send to Support'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
