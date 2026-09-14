import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { videoApi } from '../../../api/videoApi';
import { Category, Video, VideoStatus, VideoUpdatePayload } from '../../../types';

interface VideoEditModalProps {
  isOpen: boolean;
  video: Video | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VideoEditModal: React.FC<VideoEditModalProps> = ({
  isOpen,
  video,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<VideoStatus>('PUBLISHED');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && video) {
      setTitle(video.title);
      setDescription(video.description || '');
      setThumbnailUrl(video.thumbnailUrl || '');
      setDurationSeconds(video.durationSeconds || 0);
      setCategoryId(video.categoryId);
      setTags(video.tags || '');
      setStatus(video.status);

      videoApi.getCategories().then(setCategories).catch(console.error);
    }
  }, [isOpen, video]);

  if (!video) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (title.length > 150) errs.title = 'Title cannot exceed 150 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: VideoUpdatePayload = {
        title: title.trim(),
        description: description.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        durationSeconds: Number(durationSeconds),
        categoryId: categoryId ? Number(categoryId) : undefined,
        tags: tags.trim() || undefined,
        status,
      };

      await videoApi.updateVideo(video.id, payload);
      onSuccess();
    } catch (err: any) {
      setErrors({ form: err.response?.data?.message || 'Failed to update video.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Video: ${video.title}`} maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {errors.form}
          </div>
        )}

        <Input
          label="Video Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          maxLength={150}
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Thumbnail Image URL"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg text-slate-200 text-sm focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Publish Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VideoStatus)}
              className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg text-slate-200 text-sm focus:outline-none"
            >
              <option value="PUBLISHED">Published (Public)</option>
              <option value="DRAFT">Draft (Creator Only)</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </div>

          <Input
            label="Tags (Comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
