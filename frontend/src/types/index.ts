export type Role =
  | 'ROLE_CONTENT_CREATOR'
  | 'ROLE_CATEGORY_MANAGER'
  | 'ROLE_PLAYLIST_MANAGER'
  | 'ROLE_FAVOURITE_MANAGER'
  | 'ROLE_COMMENT_MANAGER'
  | 'ROLE_TECHNICAL_SUPPORTER';

export type VideoStatus = 'DRAFT' | 'PUBLISHED' | 'UNLISTED';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  formattedDuration: string;
  viewsCount: number;
  likesCount: number;
  status: VideoStatus;
  tags?: string;
  creatorId: number;
  creatorName: string;
  creatorAvatar?: string;
  categoryId?: number;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorDashboardSummary {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  overallEngagementRate: number;
  topVideos: Video[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface VideoCreatePayload {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  categoryId?: number;
  tags?: string;
  status?: VideoStatus;
}

export interface VideoUpdatePayload {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  categoryId?: number;
  tags?: string;
  status?: VideoStatus;
}
