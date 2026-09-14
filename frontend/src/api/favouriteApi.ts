import client from './client';

export interface Favourite {
  id: number;
  videoId: number;
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  createdAt: string;
}

const favouriteApi = {
  addFavourite: (videoId: number) =>
    client.post<{ data: Favourite }>('/favourites', { videoId }),

  removeFavourite: (videoId: number) =>
    client.delete(`/favourites/video/${videoId}`),

  getFavourites: () =>
    client.get<{ data: Favourite[] }>('/favourites'),

  checkFavourite: (videoId: number) =>
    client.get<{ data: boolean }>(`/favourites/video/${videoId}/check`),
};

export default favouriteApi;
