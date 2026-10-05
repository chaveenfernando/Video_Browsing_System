import client from './client';

export interface Playlist {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  userId: number;
  creatorName: string;
  creatorRole?: string;
  videoCount: number;
  createdAt: string;
}

export interface PlaylistVideo {
  id: number;
  playlistId: number;
  videoId: number;
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  displayOrder: number;
  addedAt: string;
}

const playlistApi = {
  createPlaylist: (data: { title: string; description?: string; isPublic?: boolean }) =>
    client.post<{ data: Playlist }>('/playlists', data),

  getMyPlaylists: () =>
    client.get<{ data: Playlist[] }>('/playlists'),

  getAllPlaylists: () =>
    client.get<{ data: Playlist[] }>('/playlists/all'),

  getPublicPlaylists: () =>
    client.get<{ data: Playlist[] }>('/playlists/public'),

  getPlaylist: (id: number) =>
    client.get<{ data: Playlist }>(`/playlists/${id}`),

  updatePlaylist: (id: number, data: { title: string; description?: string; isPublic?: boolean }) =>
    client.put<{ data: Playlist }>(`/playlists/${id}`, data),

  deletePlaylist: (id: number) =>
    client.delete(`/playlists/${id}`),

  addVideoToPlaylist: (playlistId: number, videoId: number) =>
    client.post<{ data: PlaylistVideo }>(`/playlists/${playlistId}/videos/${videoId}`),

  removeVideoFromPlaylist: (playlistId: number, videoId: number) =>
    client.delete(`/playlists/${playlistId}/videos/${videoId}`),

  getVideosInPlaylist: (playlistId: number) =>
    client.get<{ data: PlaylistVideo[] }>(`/playlists/${playlistId}/videos`),
};

export default playlistApi;
