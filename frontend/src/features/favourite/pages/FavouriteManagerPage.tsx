import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import favouriteApi, { Favourite } from '../../../api/favouriteApi';
import { Heart, Play, Trash2, Clock } from 'lucide-react';

const FavouriteManagerPage: React.FC = () => {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await favouriteApi.getFavourites();
      setFavourites(res.data.data ?? []);
    } catch {
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavourites(); }, []);

  const handleRemove = async (videoId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm("Remove this video from your favourites?")) return;
    try {
      await favouriteApi.removeFavourite(videoId);
      fetchFavourites();
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/20 to-gray-950 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Your Favourites</h1>
            <p className="text-gray-400 mt-1">Videos you've loved ({favourites.length})</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favourites.length === 0 ? (
        <div className="text-center py-20 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Heart className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No favourites yet</h3>
          <p className="text-gray-400 text-sm mb-6">You haven't added any videos to your favourites list. Browse around and click the heart icon on videos you like!</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/5">
            <Play className="w-4 h-4" /> Browse Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favourites.map((fav) => (
            <Link key={fav.id} to={`/watch/${fav.videoId}`} className="group block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-rose-500/50 transition-all shadow-xl hover:shadow-rose-500/10">
              <div className="aspect-video bg-gray-900 relative overflow-hidden">
                {fav.thumbnailUrl ? (
                  <img src={fav.thumbnailUrl} alt={fav.videoTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Play className="w-12 h-12 opacity-50" />
                  </div>
                )}
                {/* Overlay play button */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center pl-1 shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                    <Play className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold line-clamp-2 mb-1 group-hover:text-rose-400 transition-colors" title={fav.videoTitle}>
                  {fav.videoTitle}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{fav.creatorName}</p>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Added {timeAgo(fav.createdAt)}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemove(fav.videoId, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Remove from favourites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouriteManagerPage;
