import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { BrowseVideosPage } from '../features/video/pages/BrowseVideosPage';
import { VideoWatchPage } from '../features/video/pages/VideoWatchPage';
import { CreatorDashboardPage } from '../features/video/pages/CreatorDashboardPage';
import { VideoLibraryPage } from '../features/video/pages/VideoLibraryPage';
import { VideoAnalyticsPage } from '../features/video/pages/VideoAnalyticsPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<BrowseVideosPage />} />
        <Route path="/watch/:id" element={<VideoWatchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Content Creator Studio Routes */}
        <Route element={<ProtectedRoute requiredRole="ROLE_CONTENT_CREATOR" />}>
          <Route path="/studio" element={<CreatorDashboardPage />} />
          <Route path="/studio/content" element={<VideoLibraryPage />} />
          <Route path="/studio/analytics" element={<VideoAnalyticsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
