import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlaySquare, Upload, LogOut, Compass, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { RoleBadge } from '../ui/Badge';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  onOpenUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload }) => {
  const { user, isAuthenticated, isContentCreator, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <PlaySquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                EduStream
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Educational Video Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Browse Videos
          </Link>

          {isAuthenticated && (
            <Link
              to={
                user?.role === 'ROLE_TECHNICAL_SUPPORTER' ? '/support' :
                user?.role === 'ROLE_COMMENT_MANAGER' ? '/comments/manage' :
                user?.role === 'ROLE_CATEGORY_MANAGER' ? '/categories/manage' :
                user?.role === 'ROLE_FAVOURITE_MANAGER' ? '/favourites/manage' :
                user?.role === 'ROLE_PLAYLIST_MANAGER' ? '/playlists/manage' :
                user?.role === 'ROLE_GENERAL_VIEWER' ? '/library' :
                '/studio'
              }
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              {user?.role === 'ROLE_CONTENT_CREATOR' ? 'Creator Studio' :
               user?.role === 'ROLE_GENERAL_VIEWER' ? 'My Library' : 'My Dashboard'}
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Stakeholder In-App Notification Center */}
              <NotificationBell />

              {isContentCreator && onOpenUpload && (
                <Button size="sm" onClick={onOpenUpload} className="hidden sm:inline-flex gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Video</span>
                </Button>
              )}

              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                  alt={user?.fullName}
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 object-cover bg-slate-800"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[130px]">{user?.fullName}</div>
                  {user?.role && <RoleBadge role={user.role} />}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
