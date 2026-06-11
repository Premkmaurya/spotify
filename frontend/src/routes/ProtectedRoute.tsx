import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        {/* Sleek Spotify-like spinner */}
        <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-mist">Loading Spotify...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
