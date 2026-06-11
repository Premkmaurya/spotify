import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ArtistRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-mist">Verifying credentials...</p>
      </div>
    );
  }

  const isArtist = isAuthenticated && user?.role === 'artist';

  return isArtist ? <Outlet /> : <Navigate to="/" replace />;
};
