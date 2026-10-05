import React from 'react';
import { VideoStatus, Role } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const VideoStatusBadge: React.FC<{ status: VideoStatus }> = ({ status }) => {
  switch (status) {
    case 'PUBLISHED':
      return <Badge variant="success">Published</Badge>;
    case 'DRAFT':
      return <Badge variant="warning">Draft</Badge>;
    case 'UNLISTED':
      return <Badge variant="default">Unlisted</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const map: Record<Role, { text: string; variant: BadgeProps['variant'] }> = {
    ROLE_CONTENT_CREATOR: { text: 'Content Creator', variant: 'purple' },
    ROLE_CATEGORY_MANAGER: { text: 'Category Admin', variant: 'info' },
    ROLE_PLAYLIST_MANAGER: { text: 'Playlist Lead', variant: 'success' },
    ROLE_FAVOURITE_MANAGER: { text: 'Favourite Curator', variant: 'warning' },
    ROLE_COMMENT_MANAGER: { text: 'Comment Moderator', variant: 'default' },
    ROLE_TECHNICAL_SUPPORTER: { text: 'Tech Supporter', variant: 'danger' },
    ROLE_GENERAL_VIEWER: { text: 'Viewer', variant: 'default' },
  };

  const item = map[role] || { text: role, variant: 'default' };
  return <Badge variant={item.variant}>{item.text}</Badge>;
};
