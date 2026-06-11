import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSearchStore } from '../../store/searchStore';
import { ChevronLeft, ChevronRight, User, LogOut, Disc, Layout, Search, X } from 'lucide-react';
import { toast } from 'sonner';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { query, setQuery } = useSearchStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSearchPage = location.pathname === '/search';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="h-[64px] bg-[#000000]/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* History Navigation chevrons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-[40px] h-[40px] rounded-full bg-black/70 text-mist hover:text-white flex items-center justify-center transition focus:outline-none hover:scale-105"
        >
          <ChevronLeft className="w-[24px] h-[24px]" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-[40px] h-[40px] rounded-full bg-black/70 text-mist hover:text-white flex items-center justify-center transition focus:outline-none hover:scale-105"
        >
          <ChevronRight className="w-[24px] h-[24px]" />
        </button>
      </div>

      {/* Search Input Bar (only on search page) */}
      {isSearchPage && (
        <div className="flex-1 max-w-[360px] mx-[24px] relative">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-mist" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full h-[40px] pl-[44px] pr-[36px] rounded-full bg-graphite border border-iron/80 focus:border-zinc-500 focus:outline-none text-white text-sm transition placeholder-zinc-500 font-semibold"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-mist hover:text-white transition"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      )}

      {/* User profile actions */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-[8px] p-[4px] pr-[12px] rounded-full bg-black/70 hover:bg-graphite transition duration-200 focus:outline-none hover:scale-102"
        >
          {/* Avatar Bubble */}
          <div className="w-[28px] h-[28px] rounded-full bg-spotify-green/20 flex items-center justify-center text-spotify-green">
            {user?.role === 'artist' ? (
              <Disc className="w-[16px] h-[16px] animate-spin-slow" />
            ) : (
              <User className="w-[16px] h-[16px]" />
            )}
          </div>
          {/* Username */}
          <span className="text-sm font-semibold text-white truncate max-w-[120px]">
            {user?.username}
          </span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-bone scale-90">
            {user?.role}
          </span>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-[190px] rounded-md bg-[#282828] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            {user?.role === 'artist' && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/artist-dashboard');
                }}
                className="w-full text-left px-[16px] py-[8px] text-sm text-white hover:bg-zinc-700/80 transition flex items-center gap-[10px]"
              >
                <Layout className="w-[16px] h-[16px] text-spotify-green" />
                Artist Studio
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-[16px] py-[8px] text-sm text-red-400 hover:bg-zinc-700/80 transition flex items-center gap-[10px] border-t border-zinc-700/50 mt-[4px]"
            >
              <LogOut className="w-[16px] h-[16px]" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
