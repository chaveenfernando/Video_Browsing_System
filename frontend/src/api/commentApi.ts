import client from './client';

export interface Comment {
  id: number;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  isEdited: boolean;
  likeCount: number;
  userId: number;
  userName: string;
  userRole?: string;
  videoId: number;
  videoTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  videoId: number;
  content: string;
}

const commentApi = {
  addComment: (data: CommentRequest) =>
    client.post<{ data: Comment }>('/comments', data),

  getAllComments: () =>
    client.get<{ data: Comment[] }>('/comments/all'),

  getCommentsByVideo: (videoId: number) =>
    client.get<{ data: Comment[] }>(`/comments/video/${videoId}`),

  getAllCommentsByVideo: (videoId: number) =>
    client.get<{ data: Comment[] }>(`/comments/video/${videoId}/all`),

  getPinnedComments: (videoId: number) =>
    client.get<{ data: Comment[] }>(`/comments/video/${videoId}/pinned`),

  getMyComments: () =>
    client.get<{ data: Comment[] }>('/comments/my'),

  editComment: (id: number, content: string) =>
    client.put<{ data: Comment }>(`/comments/${id}?content=${encodeURIComponent(content)}`),

  deleteComment: (id: number) =>
    client.delete(`/comments/${id}`),

  pinComment: (id: number) =>
    client.patch<{ data: Comment }>(`/comments/${id}/pin`),

  unpinComment: (id: number) =>
    client.patch<{ data: Comment }>(`/comments/${id}/unpin`),

  hideComment: (id: number) =>
    client.patch<{ data: Comment }>(`/comments/${id}/hide`),

  unhideComment: (id: number) =>
    client.patch<{ data: Comment }>(`/comments/${id}/unhide`),

  likeComment: (id: number) =>
    client.patch<{ data: Comment }>(`/comments/${id}/like`),
};

export default commentApi;
