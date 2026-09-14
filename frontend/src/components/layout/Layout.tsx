import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { VideoUploadModal } from '../../features/video/components/VideoUploadModal';

export const Layout: React.FC = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const location = useLocation();
  const isStudioRoute = location.pathname.startsWith('/studio');

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      <div className="flex-1 flex">
        {isStudioRoute && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Video Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          // Trigger refresh event
          window.dispatchEvent(new CustomEvent('video-uploaded'));
        }}
      />
    </div>
  );
};
