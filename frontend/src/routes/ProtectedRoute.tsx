import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  requiredRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-rose-400">Access Denied (403 Forbidden)</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          This area is restricted to users with role <code>{requiredRole}</code>. Your current role is <code>{user?.role}</code>.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
