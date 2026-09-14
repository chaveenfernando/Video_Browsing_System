import api from './client';
import { ApiResponse, Video, CreatorDashboardSummary, VideoCreatePayload, VideoUpdatePayload, Category } from '../types';

export const videoApi = {
  // Public video browsing & search
  getAllVideos: async (params?: { search?: string; categoryId?: number; sort?: string }): Promise<Video[]> => {
    const res = await api.get<ApiResponse<Video[]>>('/videos', { params });
    return res.data.data;
  },

  getVideoById: async (id: number): Promise<Video> => {
    const res = await api.get<ApiResponse<Video>>(`/videos/${id}`);
    return res.data.data;
  },

  likeVideo: async (id: number): Promise<Video> => {
    const res = await api.post<ApiResponse<Video>>(`/videos/${id}/like`);
    return res.data.data;
  },

  // Content Creator Studio endpoints
  createVideo: async (payload: VideoCreatePayload): Promise<Video> => {
    const res = await api.post<ApiResponse<Video>>('/videos', payload);
    return res.data.data;
  },

  updateVideo: async (id: number, payload: VideoUpdatePayload): Promise<Video> => {
    const res = await api.put<ApiResponse<Video>>(`/videos/${id}`, payload);
    return res.data.data;
  },

  deleteVideo: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/videos/${id}`);
  },

  getMyVideos: async (): Promise<Video[]> => {
    const res = await api.get<ApiResponse<Video[]>>('/videos/creator/my-videos');
    return res.data.data;
  },

  getCreatorAnalytics: async (): Promise<CreatorDashboardSummary> => {
    const res = await api.get<ApiResponse<CreatorDashboardSummary>>('/videos/creator/analytics');
    return res.data.data;
  },

  uploadMedia: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<string>>('/videos/creator/upload-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  // Categories helper
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
};
