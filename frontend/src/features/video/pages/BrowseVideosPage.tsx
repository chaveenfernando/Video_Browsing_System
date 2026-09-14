import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Sparkles, Compass, Film } from 'lucide-react';
import { videoApi } from '../../../api/videoApi';
import { Category, Video } from '../../../types';
import { VideoCard } from '../components/VideoCard';
import { Button } from '../../../components/ui/Button';

export const BrowseVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortStrategy, setSortStrategy] = useState<'date' | 'views' | 'title'>('date');
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await videoApi.getAllVideos({
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        sort: sortStrategy,
      });
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    videoApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, sortStrategy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Group 2026-Y2-S1-MLB-B5G2-03</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Discover Tech Lectures, Code Demos & System Tutorials
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            A high-performance video streaming platform built with Spring Boot 3, Java 21, and React 18 for the SE2030 university project.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search and Strategy Sorting Filter Controls */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by video title, keywords, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <Button type="submit" className="sm:w-auto">
            Search
          </Button>

          {/* Strategy Pattern Sorting Selector */}
          <div className="relative flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Sort Strategy:</span>
            <select
              value={sortStrategy}
              onChange={(e) => setSortStrategy(e.target.value as 'date' | 'views' | 'title')}
              className="bg-transparent text-xs font-bold text-indigo-300 focus:outline-none cursor-pointer"
            >
              <option value="date" className="bg-slate-900 text-white">Latest Uploads (SortByDateStrategy)</option>
              <option value="views" className="bg-slate-900 text-white">Most Popular (SortByViewsStrategy)</option>
              <option value="title" className="bg-slate-900 text-white">Alphabetical (SortByTitleStrategy)</option>
            </select>
          </div>
        </form>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
          <Film className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No videos found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, switching categories, or resetting filters.
          </p>
          {(searchQuery || selectedCategory) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSortStrategy('date');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
