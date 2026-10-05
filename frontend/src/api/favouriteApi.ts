import client from './client';

export interface Favourite {
  id: number;
  videoId: number;
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  likesCount?: number;
  viewsCount?: number;
  categoryName?: string;
  createdAt: string;
}

export interface VideoFavouriteSummary {
  videoId: number;
  videoTitle: string;
  creatorName: string;
  categoryName: string;
  thumbnailUrl: string;
  likesCount: number;
  viewsCount: number;
  totalFavourites: number;
  favouritedByUsernames: string[];
}

export interface FavouriteAnalytics {
  totalFavourites: number;
  totalVideosFavourited: number;
  uniqueUsersCount: number;
  recentFavourites: Favourite[];
  videoBreakdown: VideoFavouriteSummary[];
}

const favouriteApi = {
  addFavourite: (videoId: number) =>
    client.post<{ data: Favourite }>('/favourites', { videoId }),

  removeFavourite: (videoId: number) =>
    client.delete(`/favourites/video/${videoId}`),

  getFavourites: () =>
    client.get<{ data: Favourite[] }>('/favourites'),

  getAllFavourites: () =>
    client.get<{ data: Favourite[] }>('/favourites/management'),

  getFavouriteAnalytics: () =>
    client.get<{ data: FavouriteAnalytics }>('/favourites/analytics'),

  checkFavourite: (videoId: number) =>
    client.get<{ data: boolean }>(`/favourites/video/${videoId}/check`),
};

export default favouriteApi;
