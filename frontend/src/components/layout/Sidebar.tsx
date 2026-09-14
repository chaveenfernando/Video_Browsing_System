import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video as VideoIcon, BarChart3, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { to: '/studio', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/studio/content', label: 'Content Library', icon: VideoIcon, end: false },
    { to: '/studio/analytics', label: 'Analytics', icon: BarChart3, end: false },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/40 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Creator Identity Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Creator Studio</p>
              <h4 className="text-sm font-bold text-white truncate max-w-[120px]">{user?.fullName}</h4>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Studio Menu</p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Public Browsing Shortcut */}
        <div className="pt-4 border-t border-slate-800/80">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Public Video Feed</span>
          </NavLink>
        </div>
      </div>

      {/* Project Meta Info */}
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Module:</span>
          <span>SE2030</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Group:</span>
          <span className="text-indigo-400 font-mono text-[10px]">B5G2-03</span>
        </div>
        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          Role: Content Creator
        </div>
      </div>
    </aside>
  );
};
