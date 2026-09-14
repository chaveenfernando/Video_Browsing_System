import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, ThumbsUp, Calendar, Share2, Sparkles, Tag, ArrowLeft } from 'lucide-react';
import { videoApi } from '../../../api/videoApi';
import { Video } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { VideoCard } from '../components/VideoCard';

export const VideoWatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setHasLiked(false);

    videoApi.getVideoById(Number(id))
      .then((data) => {
        setVideo(data);
        // Load related videos
        return videoApi.getAllVideos({ categoryId: data.categoryId, sort: 'views' });
      })
      .then((all) => {
        setRelatedVideos(all.filter((v) => v.id !== Number(id)).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!video || hasLiked) return;
    try {
      const updated = await videoApi.likeVideo(video.id);
      setVideo(updated);
      setHasLiked(true);
    } catch (err) {
      console.error('Failed to like video', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Video link copied to clipboard!');
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to browse</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Stream & Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* HTML5 Video Player */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
            <video
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Title & Metadata Header */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {video.title}
            </h1>

            {/* Interaction Bar */}
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

              {/* Action Buttons: Like, Share, Views */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-300">{video.viewsCount.toLocaleString()}</span>
                  <span>views</span>
                </div>

                <Button
                  variant={hasLiked ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleLike}
                  disabled={hasLiked}
                  className="gap-2"
                >
                  <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{video.likesCount.toLocaleString()}</span>
                </Button>

                <Button variant="secondary" size="sm" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
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
          </div>
        </div>

        {/* Sidebar: Related Videos */}
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
      </div>
    </div>
  );
};
