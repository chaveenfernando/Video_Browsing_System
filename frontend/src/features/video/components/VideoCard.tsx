import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, Clock, Calendar } from 'lucide-react';
import { Video } from '../../../types';
import { VideoStatusBadge } from '../../../components/ui/Badge';

interface VideoCardProps {
  video: Video;
  showStatus?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, showStatus = false }) => {
  const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/watch/${video.id}`}
      className="group flex flex-col bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-indigo-500/10 hover:-translate-y-1"
    >
      {/* Thumbnail with duration badge */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        <img
          src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[11px] font-semibold text-white tracking-wider flex items-center gap-1 border border-white/10">
          <Clock className="w-3 h-3 text-indigo-400" />
          {video.formattedDuration || '00:00'}
        </div>

        {showStatus && (
          <div className="absolute top-2.5 left-2.5">
            <VideoStatusBadge status={video.status} />
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {video.categoryName && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {video.categoryName}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-100 text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors">
            {video.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate max-w-[140px]">
            <img
              src={video.creatorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${video.creatorName}`}
              alt={video.creatorName}
              className="w-5 h-5 rounded-full object-cover bg-slate-800"
            />
            <span className="truncate text-slate-300 font-medium">{video.creatorName}</span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {video.viewsCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
              {video.likesCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
