import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import playlistApi, { Playlist } from '../../../api/playlistApi';
import { ListVideo, Plus, Edit2, Trash2, Globe, Lock, Play } from 'lucide-react';

const PlaylistManagerPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', isPublic: true });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await playlistApi.getMyPlaylists();
      setPlaylists(res.data.data ?? []);
    } catch {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await playlistApi.updatePlaylist(editingId, formData);
      } else {
        await playlistApi.createPlaylist(formData);
      }
      setShowModal(false);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) return;
    try {
      await playlistApi.deletePlaylist(id);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', isPublic: true });
    setShowModal(true);
  };

  const openEditModal = (p: Playlist, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(p.id);
    setFormData({ title: p.title, description: p.description || '', isPublic: p.isPublic });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-teal-950/20 to-gray-950 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
            <ListVideo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
            <p className="text-gray-400 mt-1">Organize your videos ({playlists.length})</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" /> Create Playlist
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <ListVideo className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No playlists yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first playlist to start organizing your favorite content and sharing it with others!</p>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/5">
            <Plus className="w-4 h-4" /> Create First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-teal-500/50 transition-all shadow-xl hover:shadow-teal-500/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">
                    {playlist.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                      <Play className="w-3.5 h-3.5 text-teal-400" /> {playlist.videoCount} videos
                    </span>
                    <span className="flex items-center gap-1">
                      {playlist.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {playlist.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditModal(playlist, e)} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => handleDelete(playlist.id, e)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mb-6 line-clamp-2 min-h-[40px]">
                {playlist.description || <span className="italic opacity-50">No description provided</span>}
              </p>
              
              <Link to={`/playlists/${playlist.id}`} className="block w-full text-center py-2.5 rounded-xl bg-white/5 border border-white/10 text-teal-300 font-medium hover:bg-teal-600 hover:text-white hover:border-teal-500 transition-all">
                Manage Videos
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? 'Edit Playlist' : 'Create Playlist'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                  <input
                    required minLength={2} maxLength={150}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="E.g. My Favorite Tutorials"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (Optional)</label>
                  <textarea
                    maxLength={500} rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
                    placeholder="What is this playlist about?"
                  />
                </div>
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-5 h-5 rounded border-white/10 bg-black/40 text-teal-500 focus:ring-teal-500/50"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-300 cursor-pointer select-none flex flex-col">
                    <span>Public Playlist</span>
                    <span className="text-xs text-gray-500 font-normal">Anyone can view this playlist if public.</span>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-500 transition-colors shadow-lg shadow-teal-600/20">
                    {editingId ? 'Save Changes' : 'Create Playlist'}
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

export default PlaylistManagerPage;
