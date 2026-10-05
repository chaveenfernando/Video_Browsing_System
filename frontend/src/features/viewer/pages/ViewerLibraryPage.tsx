import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import favouriteApi, { Favourite } from '../../../api/favouriteApi';
import playlistApi, { Playlist, PlaylistVideo } from '../../../api/playlistApi';
import {
  Heart,
  ListVideo,
  Play,
  Trash2,
  Clock,
  ChevronDown,
  ChevronRight,
  Globe,
  Lock,
  Plus,
  Film,
  BookMarked,
  Search,
  X,
} from 'lucide-react';

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

interface PlaylistRowProps {
  playlist: Playlist;
  onDelete: (id: number) => void;
}

const PlaylistRow: React.FC<PlaylistRowProps> = ({ playlist, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchVideos = useCallback(async () => {
    if (loaded) return;
    setLoadingVideos(true);
    try {
      const res = await playlistApi.getVideosInPlaylist(playlist.id);
      setVideos(res.data.data ?? []);
      setLoaded(true);
    } catch {
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }, [playlist.id, loaded]);

  const handleToggle = () => {
    if (!open) fetchVideos();
    setOpen((v) => !v);
  };

  const handleRemoveVideo = async (videoId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Remove this video from the playlist?')) return;
    try {
      await playlistApi.removeVideoFromPlaylist(playlist.id, videoId);
      setVideos((v) => v.filter((vid) => vid.videoId !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-teal-500/30 shadow-lg">
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="relative w-28 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50">
          {loaded && videos.length > 0 && videos[0].thumbnailUrl ? (
            <img src={videos[0].thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ListVideo className="w-6 h-6 text-slate-600" />
            </div>
          )}
          <div className="absolute bottom-0 right-0 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded-tl-lg">
            {playlist.videoCount}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-bold text-sm truncate">{playlist.title}</h3>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              playlist.isPublic
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-700 text-slate-300 border-slate-600'
            }`}>
              {playlist.isPublic ? <><Globe className="w-2.5 h-2.5" /> Public</> : <><Lock className="w-2.5 h-2.5" /> Private</>}
            </span>
          </div>
          {playlist.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{playlist.description}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Play className="w-3 h-3" />
            {playlist.videoCount} video{playlist.videoCount !== 1 ? 's' : ''}
            <span className="mx-1">·</span>
            <Clock className="w-3 h-3" />
            Created {timeAgo(playlist.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete playlist "${playlist.title}"?`)) onDelete(playlist.id);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {open ? (
            <ChevronDown className="w-5 h-5 text-teal-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-800">
          {loadingVideos ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <div className="py-10 text-center">
              <Film className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No videos in this playlist yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                While watching a video, click <span className="text-teal-400 font-semibold">+ Add to Playlist</span>.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {videos.map((vid, idx) => (
                <div key={vid.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors group">
                  <span className="text-xs text-slate-600 font-mono w-5 text-center flex-shrink-0">{idx + 1}</span>
                  <Link to={`/watch/${vid.videoId}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700/50">
                      {vid.thumbnailUrl ? (
                        <img src={vid.thumbnailUrl} alt={vid.videoTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-5 h-5 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold line-clamp-1 group-hover:text-teal-400 transition-colors">{vid.videoTitle}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">by @{vid.creatorName}</p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleRemoveVideo(vid.videoId, e)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from playlist"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreate: () => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', description: '', isPublic: true });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await playlistApi.createPlaylist(form);
      onCreate();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Create New Playlist</h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Playlist Title *</label>
              <input
                required minLength={2} maxLength={150}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                placeholder="e.g. My Favourite Tutorials"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (optional)</label>
              <textarea
                maxLength={500} rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm resize-none"
                placeholder="What is this playlist about?"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-black/40 text-teal-500 focus:ring-teal-500/50"
              />
              <span className="text-sm text-slate-300 font-medium">
                Public playlist <span className="text-xs text-slate-500 font-normal">(others can discover it)</span>
              </span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-colors text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-colors shadow-lg shadow-teal-600/20 text-sm disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Playlist'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

type Tab = 'saved' | 'playlists';

const ViewerLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [favRes, plRes] = await Promise.all([
        favouriteApi.getFavourites(),
        playlistApi.getMyPlaylists(),
      ]);
      setFavourites(favRes.data.data ?? []);
      setPlaylists(plRes.data.data ?? []);
    } catch {
      /* silently handle */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRemoveFavourite = async (videoId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Remove this video from your saved collection?')) return;
    try {
      await favouriteApi.removeFavourite(videoId);
      setFavourites((prev) => prev.filter((f) => f.videoId !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    try {
      await playlistApi.deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFavourites = favourites.filter((f) =>
    f.videoTitle.toLowerCase().includes(search.toLowerCase()) ||
    (f.creatorName?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  const filteredPlaylists = playlists.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'saved' as Tab, label: 'Saved Videos', icon: Heart, count: favourites.length, color: 'from-pink-600 to-rose-600' },
    { id: 'playlists' as Tab, label: 'My Playlists', icon: ListVideo, count: playlists.length, color: 'from-teal-600 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-600/30">
            <BookMarked className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Library</h1>
            <p className="text-sm text-slate-400 mt-0.5">Your saved videos and personal playlists</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {activeTab === 'playlists' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> New Playlist
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'saved' ? (
        filteredFavourites.length === 0 ? (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-xl">
              <Heart className="w-9 h-9 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {search ? 'No matches found' : 'No saved videos yet'}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              {search
                ? 'Try a different search term.'
                : 'Click the heart icon on any video while watching to save it here.'}
            </p>
            {!search && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-pink-600/20 text-xs"
              >
                <Play className="w-4 h-4" /> Browse Videos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredFavourites.map((fav) => (
              <div
                key={fav.id}
                className="group relative bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-pink-500/40 transition-all shadow-xl hover:shadow-pink-500/10"
              >
                <Link to={`/watch/${fav.videoId}`}>
                  <div className="aspect-video bg-slate-950 relative overflow-hidden">
                    {fav.thumbnailUrl ? (
                      <img src={fav.thumbnailUrl} alt={fav.videoTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-10 h-10 text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-11 h-11 rounded-full bg-pink-600 flex items-center justify-center pl-0.5 shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/watch/${fav.videoId}`}>
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-pink-400 transition-colors leading-snug">{fav.videoTitle}</h3>
                  </Link>
                  <p className="text-xs text-slate-400 mb-3">@{fav.creatorName}</p>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(fav.createdAt)}
                    </span>
                    <button
                      onClick={(e) => handleRemoveFavourite(fav.videoId, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredPlaylists.length === 0 ? (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-xl">
              <ListVideo className="w-9 h-9 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {search ? 'No matching playlists' : 'No playlists yet'}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              {search
                ? 'Try a different search term.'
                : 'Create a playlist to organise your favourite videos into collections.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-teal-600/20 text-xs"
              >
                <Plus className="w-4 h-4" /> Create First Playlist
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlaylists.map((playlist) => (
              <PlaylistRow
                key={playlist.id}
                playlist={playlist}
                onDelete={handleDeletePlaylist}
              />
            ))}
          </div>
        )
      )}

      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={fetchAll}
        />
      )}
    </div>
  );
};

export default ViewerLibraryPage;
