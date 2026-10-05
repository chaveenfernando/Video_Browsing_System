import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { videoApi } from '../../../api/videoApi';
import { Category, VideoCreatePayload, VideoStatus } from '../../../types';
import { Sparkles } from 'lucide-react';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(300);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<VideoStatus>('PUBLISHED');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await videoApi.getCategories();
      if (cats && cats.length > 0) {
        setCategories(cats);
        setCategoryId((prev) => prev || cats[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setErrors({});
    }
  }, [isOpen, fetchCategories]);

  // Auto-detect YouTube links and extract thumbnail
  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    if (!thumbnailUrl) {
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        setThumbnailUrl(`https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`);
      }
    }
  };

  const handleApplySample = (type: 'bunny' | 'tech') => {
    const defaultCatId = categories.length > 0 ? categories[0].id : 1;
    setCategoryId(defaultCatId);

    if (type === 'bunny') {
      setTitle('Next-Gen Microservices with Spring Boot 3 & Docker');
      setDescription('An in-depth architectural guide for university software engineering students demonstrating reactive streams and containerization.');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      setThumbnailUrl('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600');
      setDurationSeconds(596);
      setTags('springboot,docker,java,microservices');
    } else {
      setTitle('Mastering TypeScript Generics & React Clean Architecture');
      setDescription('Complete walkthrough of design patterns and clean architecture in modern React and TypeScript frontend applications.');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
      setThumbnailUrl('https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600');
      setDurationSeconds(653);
      setTags('react,typescript,architecture');
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (title.length > 150) errs.title = 'Title cannot exceed 150 characters';
    if (!videoUrl.trim()) errs.videoUrl = 'Video URL or stream source is required';
    if (!categoryId) errs.categoryId = 'Please select a category';
    if (durationSeconds <= 0) errs.duration = 'Duration must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const selectedCat = categoryId || (categories.length > 0 ? categories[0].id : 1);
      const payload: VideoCreatePayload = {
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        durationSeconds: Number(durationSeconds),
        categoryId: Number(selectedCat),
        tags: tags.trim() || undefined,
        status,
      };

      await videoApi.createVideo(payload);

      // Dispatch global event so BrowseVideosPage and CreatorDashboardPage refresh automatically
      window.dispatchEvent(new CustomEvent('video-uploaded'));

      // Reset form
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnailUrl('');
      setTags('');
      setDurationSeconds(300);
      setErrors({});
      onSuccess();
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        setErrors({ form: '🔐 Session expired or insufficient permissions. Please log out and log back in as a Content Creator.' });
      } else {
        const fieldErrors = err.response?.data?.data;
        if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          const msg = err.response?.data?.message || err.message || 'Failed to upload video.';
          setErrors({ form: msg });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New Video to Studio" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Viva Quick Pre-fill Banner */}
        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Quick Demo Preset for Viva:</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleApplySample('bunny')}
              className="text-xs px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-colors"
            >
              Preset 1 (Spring Boot)
            </button>
            <button
              type="button"
              onClick={() => handleApplySample('tech')}
              className="text-xs px-2.5 py-1 rounded bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/30 transition-colors"
            >
              Preset 2 (React TS)
            </button>
          </div>
        </div>

        {errors.form && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {errors.form}
          </div>
        )}

        {/* Title */}
        <Input
          label="Video Title *"
          placeholder="e.g. Building Scalable REST APIs with Java 21"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          maxLength={150}
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
            placeholder="Tell viewers what your video is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Video URL & Thumbnail URL Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Video Stream / MP4 / YouTube URL *"
            placeholder="https://.../video.mp4 or YouTube link"
            value={videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            error={errors.videoUrl}
          />
          <Input
            label="Thumbnail Image URL"
            placeholder="https://.../cover.jpg"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        {/* Category, Duration, and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Category *
            </label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCategoryId(isNaN(val) ? undefined : val);
                if (errors.categoryId) {
                  setErrors((prev) => ({ ...prev, categoryId: '' }));
                }
              }}
              className={`w-full px-3 py-2.5 bg-slate-900/80 border rounded-lg text-slate-200 text-sm focus:outline-none ${
                errors.categoryId ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/80 focus:border-indigo-500'
              }`}
            >
              <option value="" disabled>-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-rose-400 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>

          <Input
            label="Duration (Seconds) *"
            type="number"
            min={1}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Math.max(1, parseInt(e.target.value) || 0))}
            error={errors.duration}
          />

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
        </div>

        {/* Tags */}
        <Input
          label="Tags (Comma-separated)"
          placeholder="e.g. springboot, react, typescript, viva"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Publish Video
          </Button>
        </div>
      </form>
    </Modal>
  );
};
