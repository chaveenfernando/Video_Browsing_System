import React, { useState, useEffect } from 'react';
import { Search, Upload, ExternalLink, Edit3, Trash2, Film } from 'lucide-react';
import { videoApi } from '../../../api/videoApi';
import { Video, VideoStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { VideoStatusBadge } from '../../../components/ui/Badge';
import { VideoUploadModal } from '../components/VideoUploadModal';
import { VideoEditModal } from '../components/VideoEditModal';
import { Link } from 'react-router-dom';

export const VideoLibraryPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VideoStatus>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videoApi.getMyVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to fetch creator videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    const handleUploadEvent = () => fetchVideos();
    window.addEventListener('video-uploaded', handleUploadEvent);
    return () => window.removeEventListener('video-uploaded', handleUploadEvent);
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await videoApi.deleteVideo(id);
        window.dispatchEvent(new CustomEvent('video-uploaded'));
        fetchVideos();
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || 'Failed to delete video.');
      }
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.tags && v.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Channel Content</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your entire video catalog, edit metadata, and manage visibility states.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          <span>Upload Video</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'UNLISTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search videos by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </Card>

      {/* Videos Table */}
      <Card className="overflow-hidden p-0 border-slate-800/80">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-xs text-slate-400 mt-2">Loading library...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Film className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No videos found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? 'No videos matched your search criteria.' : 'Upload your first video to start building your channel.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Video</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Likes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={video.thumbnailUrl}
                          alt=""
                          className="w-16 h-10 object-cover rounded-lg bg-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-100 truncate text-sm">{video.title}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{video.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {video.categoryName ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                          {video.categoryName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Uncategorized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <VideoStatusBadge status={video.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-200">
                      {video.viewsCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-200">
                      {video.likesCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/watch/${video.id}`}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Watch Video"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditingVideo(video)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id, video.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Video"
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

      {/* Modals */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          fetchVideos();
        }}
      />

      <VideoEditModal
        isOpen={!!editingVideo}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onSuccess={() => {
          setEditingVideo(null);
          fetchVideos();
        }}
      />
    </div>
  );
};
