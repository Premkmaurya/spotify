import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { PlaylistDetails } from './pages/PlaylistDetails';
import { ArtistDashboard } from './pages/ArtistDashboard';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ArtistRoute } from './routes/ArtistRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive refetching during code focus
      retry: false,
    },
  },
});

export const App: React.FC = () => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Check user authentication token cookie on initial page load
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-mist">Initializing Spotify Mix...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme="dark" closeButton richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/playlist/:id" element={<PlaylistDetails />} />

              {/* Artist Studio Protected Subroute */}
              <Route element={<ArtistRoute />}>
                <Route path="/artist-dashboard" element={<ArtistDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Route redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
