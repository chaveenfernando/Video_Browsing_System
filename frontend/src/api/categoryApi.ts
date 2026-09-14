import client from './client';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  colorHex: string;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  colorHex?: string;
}

export interface MergeCategoryRequest {
  sourceCategoryId: number;
  targetCategoryId: number;
}

const categoryApi = {
  createCategory: (data: CategoryRequest) =>
    client.post<{ data: Category }>('/categories', data),

  getAllCategories: () =>
    client.get<{ data: Category[] }>('/categories'),

  getActiveCategories: () =>
    client.get<{ data: Category[] }>('/categories/active'),

  getCategoryById: (id: number) =>
    client.get<{ data: Category }>(`/categories/${id}`),

  updateCategory: (id: number, data: CategoryRequest) =>
    client.put<{ data: Category }>(`/categories/${id}`, data),

  renameCategory: (id: number, name: string) =>
    client.patch<{ data: Category }>(`/categories/${id}/rename?name=${encodeURIComponent(name)}`),

  mergeCategories: (data: MergeCategoryRequest) =>
    client.post<{ data: Category }>('/categories/merge', data),

  toggleActive: (id: number) =>
    client.patch<{ data: Category }>(`/categories/${id}/toggle-active`),

  deleteCategory: (id: number) =>
    client.delete(`/categories/${id}`),
};

export default categoryApi;
