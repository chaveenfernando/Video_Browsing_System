import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, TrendingUp, BarChart2, Award, Info } from 'lucide-react';
import { videoApi } from '../../../api/videoApi';
import { CreatorDashboardSummary } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Link } from 'react-router-dom';

export const VideoAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CreatorDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videoApi.getCreatorAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Channel Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Real-time performance metrics and audience engagement analysis.
        </p>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-500/20">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Lifetime Views</span>
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-black text-white">{analytics?.totalViews.toLocaleString() || 0}</h3>
          <p className="text-xs text-slate-400 mt-2">Across all published video content</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-900 to-emerald-950/40 border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Likes</span>
            <ThumbsUp className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-black text-white">{analytics?.totalLikes.toLocaleString() || 0}</h3>
          <p className="text-xs text-slate-400 mt-2">Community positive feedback</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-900 to-violet-950/40 border-violet-500/20">
          <div className="flex items-center justify-between text-violet-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Engagement Ratio</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-black text-white">{analytics?.overallEngagementRate || 0}%</h3>
          <p className="text-xs text-slate-400 mt-2">Likes / Views percentage</p>
        </Card>
      </div>

      {/* Detailed Top Performance Breakdown */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Top Performing Videos Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400">Ranked by audience reach</span>
        </div>

        {analytics?.topVideos && analytics.topVideos.length > 0 ? (
          <div className="space-y-4">
            {analytics.topVideos.map((video, idx) => {
              const viewShare = analytics.totalViews > 0
                ? Math.round((video.viewsCount / analytics.totalViews) * 100)
                : 0;

              return (
                <div key={video.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <Link to={`/watch/${video.id}`} className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition-colors truncate max-w-md">
                        {video.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                      <span>{video.viewsCount.toLocaleString()} views</span>
                      <span className="text-emerald-400">{video.likesCount.toLocaleString()} likes</span>
                      <span className="text-indigo-400">{viewShare}% channel share</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, viewShare)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 py-8">No video data available yet.</p>
        )}
      </Card>

      {/* Viva Explanation Callout */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-indigo-300">Viva Insight: Real-time Analytics Architecture</p>
          <p className="text-slate-400 leading-relaxed">
            The analytics metrics are generated on-demand by Spring Data JPA using native aggregation queries (<code>COALESCE(SUM(v.viewsCount), 0)</code>, <code>COUNT(v)</code>, and custom JPQL). This eliminates redundant data transfer over the network while avoiding table scanning bottlenecks.
          </p>
        </div>
      </div>
    </div>
  );
};
