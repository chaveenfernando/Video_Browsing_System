import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, ThumbsUp, MessageSquare, AlertCircle, ListVideo, Check, Sparkles } from 'lucide-react';
import notificationApi, { NotificationItem } from '../../api/notificationApi';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(listRes.data.data || []);
      setUnreadCount(countRes.data.data?.unreadCount || 0);
    } catch {
      // Ignored if user not authenticated or network error
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (item: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await notificationApi.markAsRead(item.id);
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setIsOpen(false);

    if (item.type === 'SUPPORT') {
      navigate('/support');
    } else if (item.referenceId) {
      navigate(`/watch/${item.referenceId}`);
    } else if (item.type === 'FAVOURITE') {
      navigate('/favourites/manage');
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'FAVOURITE':
        return <Heart className="w-4 h-4 text-pink-400 fill-current" />;
      case 'LIKE':
        return <ThumbsUp className="w-4 h-4 text-blue-400 fill-current" />;
      case 'COMMENT':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'SUPPORT':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'PLAYLIST':
        return <ListVideo className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors focus:outline-none"
        title="Stakeholder Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-800/60 border-b border-slate-700/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs space-y-1">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-slate-300">No notifications yet</p>
                <p className="text-[11px] text-slate-500">
                  Viewer interactions (likes, comments, favourites, tickets) will show up here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    !item.read ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : 'opacity-85'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex-shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-white truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(item.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">{item.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-indigo-400 font-medium tracking-wide">
                        {item.senderName ? `From ${item.senderName}` : 'System Alert'}
                      </span>
                      {!item.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(item, e)}
                          title="Mark read"
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
