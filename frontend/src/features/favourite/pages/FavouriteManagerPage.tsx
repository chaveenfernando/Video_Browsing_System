import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import favouriteApi, { Favourite, FavouriteAnalytics } from '../../../api/favouriteApi';
import { useAuth } from '../../../context/AuthContext';
import { Heart, Play, Trash2, Clock, Users, Flame, BarChart3, Film, Eye, ThumbsUp } from 'lucide-react';

const FavouriteManagerPage: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'ROLE_FAVOURITE_MANAGER';

  const [activeTab, setActiveTab] = useState<'oversight' | 'personal'>(isManager ? 'oversight' : 'personal');
  const [personalFavourites, setPersonalFavourites] = useState<Favourite[]>([]);
  const [analytics, setAnalytics] = useState<FavouriteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPersonalFavourites = async () => {
    try {
      const res = await favouriteApi.getFavourites();
      setPersonalFavourites(res.data.data ?? []);
    } catch {
      setPersonalFavourites([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await favouriteApi.getFavouriteAnalytics();
      setAnalytics(res.data.data ?? null);
    } catch {
      setAnalytics(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (isManager) {
      await Promise.all([fetchAnalytics(), fetchPersonalFavourites()]);
    } else {
      await fetchPersonalFavourites();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [isManager]);

  const handleRemove = async (videoId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Remove this video from your favourites?')) return;
    try {
      await favouriteApi.removeFavourite(videoId);
      loadData();
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
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-red-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/30">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isManager ? 'Favourite Management & Insights' : 'My Saved Favourites'}
              </h1>
              {isManager && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Manager Role
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isManager
                ? 'Track which viewers favourite videos, monitor love counts, and analyze viewer engagement trends.'
                : `Videos you have saved for later (${personalFavourites.length})`}
            </p>
          </div>
        </div>

        {/* Tab switch for Manager */}
        {isManager && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('oversight')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'oversight'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Platform Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'personal'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>My Favourites ({personalFavourites.length})</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isManager && activeTab === 'oversight' ? (
        /* ============================================================ */
        /* STAKEHOLDER: FAVOURITE MANAGER PLATFORM OVERSIGHT & ANALYTICS */
        /* ============================================================ */
        <div className="space-y-8">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Favourites</span>
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white">{analytics?.totalFavourites ?? 0}</div>
              <p className="text-[11px] text-slate-500 mt-1">Platform-wide video saves across all viewers</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Videos Favourited</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white">{analytics?.totalVideosFavourited ?? 0}</div>
              <p className="text-[11px] text-slate-500 mt-1">Unique titles added to viewer collections</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Viewers</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white">{analytics?.uniqueUsersCount ?? 0}</div>
              <p className="text-[11px] text-slate-500 mt-1">Distinct users who saved favourite videos</p>
            </div>
          </div>

          {/* Section 1: "How Much Likes & Favourites Each Video Has" Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Video Popularity & Favourite Counts</span>
                  <span className="text-xs text-pink-400 font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                    Leaderboard
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  See how many likes and favourites each video has received, plus who favourited them.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Video Details</th>
                    <th className="py-3 px-4">Category & Creator</th>
                    <th className="py-3 px-4 text-center">Likes</th>
                    <th className="py-3 px-4 text-center">Total Favourites</th>
                    <th className="py-3 px-4">Favourited By Viewers</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {(!analytics?.videoBreakdown || analytics.videoBreakdown.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                        No video favourites recorded yet. When general viewers click the heart icon on videos, data appears here.
                      </td>
                    </tr>
                  ) : (
                    analytics.videoBreakdown.map((item) => (
                      <tr key={item.videoId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1516116211227-bbc13c734187?w=150'}
                              alt=""
                              className="w-14 h-9 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                            />
                            <div className="max-w-xs">
                              <span className="font-bold text-white text-xs block line-clamp-1">{item.videoTitle}</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Eye className="w-3 h-3" /> {item.viewsCount} views
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 mb-1">
                            {item.categoryName}
                          </span>
                          <span className="text-xs text-slate-400 block">by @{item.creatorName}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                            <ThumbsUp className="w-3 h-3 fill-current" />
                            {item.likesCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30 shadow-sm shadow-pink-500/10">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            {item.totalFavourites}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {item.favouritedByUsernames.slice(0, 3).map((uname, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {uname}
                              </span>
                            ))}
                            {item.favouritedByUsernames.length > 3 && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded text-pink-400 font-semibold">
                                +{item.favouritedByUsernames.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/watch/${item.videoId}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                          >
                            <Play className="w-3 h-3" /> Watch
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: "Who Favourited What" Recent Audit Stream */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Recent Viewer Favourite Activity Stream</span>
                <span className="text-xs text-rose-400 font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  Live Log
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time chronological log of individual viewers who saved videos.
              </p>
            </div>

            <div className="divide-y divide-slate-800/60">
              {(!analytics?.recentFavourites || analytics.recentFavourites.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No viewer favourite actions logged yet.
                </div>
              ) : (
                analytics.recentFavourites.map((fav) => (
                  <div key={fav.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                        {fav.userName ? fav.userName.charAt(0).toUpperCase() : 'V'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{fav.userName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                            {fav.userRole?.replace('ROLE_', '') || 'GENERAL_VIEWER'}
                          </span>
                          <span className="text-xs text-slate-500">({fav.userEmail})</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Saved <span className="font-semibold text-pink-400">"{fav.videoTitle}"</span> to favourites
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {timeAgo(fav.createdAt)}
                      </span>
                      <Link
                        to={`/watch/${fav.videoId}`}
                        className="px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white font-semibold transition-all"
                      >
                        Inspect Video
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* GENERAL VIEWER & PERSONAL FAVOURITES COLLECTION              */
        /* ============================================================ */
        <div>
          {personalFavourites.length === 0 ? (
            <div className="text-center py-20 max-w-sm mx-auto">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-xl">
                <Heart className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No favourites saved yet</h3>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                As a viewer, click the heart icon on any video while watching to add it to your personal favorites!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg shadow-pink-600/20 text-xs"
              >
                <Play className="w-4 h-4" /> Browse Videos Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {personalFavourites.map((fav) => (
                <div
                  key={fav.id}
                  className="group relative bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all shadow-xl hover:shadow-pink-500/10"
                >
                  <Link to={`/watch/${fav.videoId}`}>
                    <div className="aspect-video bg-slate-950 relative overflow-hidden">
                      {fav.thumbnailUrl ? (
                        <img
                          src={fav.thumbnailUrl}
                          alt={fav.videoTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <Play className="w-10 h-10 opacity-40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-11 h-11 rounded-full bg-pink-600 text-white flex items-center justify-center pl-0.5 shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/watch/${fav.videoId}`}>
                      <h3
                        className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-pink-400 transition-colors"
                        title={fav.videoTitle}
                      >
                        {fav.videoTitle}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 mb-3">@{fav.creatorName}</p>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Added {timeAgo(fav.createdAt)}
                      </span>
                      <button
                        onClick={(e) => handleRemove(fav.videoId, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Remove from favourites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavouriteManagerPage;
