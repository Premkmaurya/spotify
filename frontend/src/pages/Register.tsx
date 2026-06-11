import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Music, Eye, EyeOff, AlertTriangle, UserCheck, Headset } from 'lucide-react';
import { toast } from 'sonner';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'listener' | 'artist'>('listener');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, error, clearError, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    setFormError(null);
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await register({
        username,
        email,
        password,
        role,
      });
      toast.success('Account registered successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="h-screen w-screen bg-black overflow-y-auto">
      <div className="min-h-full w-full flex flex-col items-center px-[16px] py-[48px]">
        <div className="my-auto flex flex-col items-center w-full max-w-[400px] flex-shrink-0">
          {/* Header */}
          <div className="flex items-center gap-[8px] mb-[32px] flex-shrink-0">
            <div className="w-[48px] h-[48px] bg-[#1DB954] rounded-full flex items-center justify-center text-black shadow-lg">
              <Music className="w-[28px] h-[28px] fill-current" />
            </div>
            <span className="font-spotifymixuititle text-[30px] font-bold tracking-tight text-white">Spotify</span>
          </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full bg-carbon border border-zinc-800/50 rounded-[16px] p-[32px] shadow-2xl relative overflow-hidden flex-shrink-0"
        >
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-spotify-green to-promo-gradient" />

          <h2 className="text-[24px] font-bold text-white mb-[24px] text-center font-spotifymixuititle">Sign up for Spotify</h2>

          {(error || formError) && (
            <div className="bg-signal-red/10 border border-signal-red/35 text-red-200 rounded-[8px] p-[16px] mb-[24px] flex items-start gap-[12px] text-sm animate-shake">
              <AlertTriangle className="w-[20px] h-[20px] text-signal-red flex-shrink-0 mt-0.5" />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[16px]">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-bone mb-[8px]">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick a username"
                className="w-full h-[48px] px-[16px] rounded-[6px] bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-white text-sm transition placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-bone mb-[8px]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full h-[48px] px-[16px] rounded-[6px] bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-white text-sm transition placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-bone mb-[8px]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full h-[48px] pl-[16px] pr-[48px] rounded-[6px] bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-white text-sm transition placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 text-mist hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-[20px] h-[20px]" /> : <Eye className="w-[20px] h-[20px]" />}
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-bone mb-[8px]">
                I want to sign up as an
              </label>
              <div className="grid grid-cols-2 gap-[16px]">
                <button
                  type="button"
                  onClick={() => setRole('listener')}
                  className={`h-[56px] rounded-[8px] border flex flex-col items-center justify-center gap-[4px] transition ${
                    role === 'listener'
                      ? 'border-spotify-green bg-spotify-green/5 text-white'
                      : 'border-iron bg-graphite hover:border-zinc-600 text-mist'
                  }`}
                >
                  <Headset className={`w-[20px] h-[20px] ${role === 'listener' ? 'text-spotify-green' : ''}`} />
                  <span className="text-xs font-medium">Listener</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('artist')}
                  className={`h-[56px] rounded-[8px] border flex flex-col items-center justify-center gap-[4px] transition ${
                    role === 'artist'
                      ? 'border-spotify-green bg-spotify-green/5 text-white'
                      : 'border-iron bg-graphite hover:border-zinc-600 text-mist'
                  }`}
                >
                  <UserCheck className={`w-[20px] h-[20px] ${role === 'artist' ? 'text-spotify-green' : ''}`} />
                  <span className="text-xs font-medium">Artist</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] bg-[#1DB954] hover:bg-[#1fdf64] active:bg-[#1aa34a] text-black font-semibold rounded-full shadow-lg transition duration-200 hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none mt-[24px] text-sm"
            >
              {isLoading ? (
                <div className="w-[20px] h-[20px] border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="border-t border-iron/60 mt-[32px] pt-[24px] text-center text-sm text-mist">
            Already have an account?{' '}
            <Link to="/login" className="text-spotify-green hover:underline font-semibold">
              Log in here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);
};
