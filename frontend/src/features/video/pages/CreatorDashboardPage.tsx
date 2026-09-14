import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, Film, TrendingUp, Upload, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { videoApi } from '../../../api/videoApi';
import { CreatorDashboardSummary, Video } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { VideoStatusBadge } from '../../../components/ui/Badge';
import { VideoUploadModal } from '../components/VideoUploadModal';
import { VideoEditModal } from '../components/VideoEditModal';
import { Link } from 'react-router-dom';

export const CreatorDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<CreatorDashboardSummary | null>(null);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const loadData = async () => {
    try {
      const [analyticsData, videosData] = await Promise.all([
        videoApi.getCreatorAnalytics(),
        videoApi.getMyVideos(),
      ]);
      setSummary(analyticsData);
      setRecentVideos(videosData);
    } catch (err) {
      console.error('Failed to load creator dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUploadEvent = () => loadData();
    window.addEventListener('video-uploaded', handleUploadEvent);
    return () => window.removeEventListener('video-uploaded', handleUploadEvent);
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await videoApi.deleteVideo(id);
        loadData();
      } catch (err) {
        alert('Failed to delete video.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Channel Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your video publications, track audience reach, and monitor real-time engagement.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2 shadow-indigo-600/30">
          <Upload className="w-4 h-4" />
          <span>Upload Video</span>
        </Button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Videos</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{summary?.totalVideos || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Views</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{summary?.totalViews.toLocaleString() || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Likes</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{summary?.totalLikes.toLocaleString() || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Engagement</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{summary?.overallEngagementRate || 0}%</h3>
          </div>
        </Card>
      </div>

      {/* Top Videos & Recent Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Videos */}
        <Card className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Top Performing Content</h3>
            <span className="text-xs text-indigo-400 font-semibold">By Views</span>
          </div>

          <div className="space-y-3">
            {summary?.topVideos && summary.topVideos.length > 0 ? (
              summary.topVideos.map((vid, idx) => (
                <div key={vid.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                    <h4 className="text-xs font-bold text-slate-200 truncate flex-1">{vid.title}</h4>
                    <span className="text-xs font-semibold text-indigo-400">{vid.viewsCount} views</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${summary.totalViews > 0 ? Math.min(100, Math.round((vid.viewsCount / summary.totalViews) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No video analytics yet.</p>
            )}
          </div>
        </Card>

        {/* Recent Uploads Table */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Recent Uploads</h3>
            <Link to="/studio/content" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View All Videos &rarr;
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Film className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-400">You haven't uploaded any videos yet.</p>
              <Button size="sm" onClick={() => setIsUploadOpen(true)}>
                Upload First Video
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 font-semibold">Video</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Views</th>
                    <th className="pb-3 font-semibold text-right">Likes</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentVideos.slice(0, 5).map((video) => (
                    <tr key={video.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={video.thumbnailUrl}
                            alt=""
                            className="w-14 h-9 object-cover rounded bg-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                            <p className="font-bold text-slate-200 truncate">{video.title}</p>
                            <span className="text-[11px] text-slate-400">{video.formattedDuration}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <VideoStatusBadge status={video.status} />
                      </td>
                      <td className="py-3 text-right font-medium text-slate-300">
                        {video.viewsCount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-medium text-slate-300">
                        {video.likesCount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/watch/${video.id}`}
                            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                            title="Watch"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingVideo(video)}
                            className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(video.id, video.title)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Upload and Edit Modals */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          loadData();
        }}
      />

      <VideoEditModal
        isOpen={!!editingVideo}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onSuccess={() => {
          setEditingVideo(null);
          loadData();
        }}
      />
    </div>
  );
};
