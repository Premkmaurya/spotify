import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Music, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login, error, clearError, isAuthenticated, isLoading } = useAuthStore();
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

    if (!usernameOrEmail.trim() || !password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      // The API supports passing username OR email as fields username/email.
      // We will send it to the login API. Let's see: auth.controller.js maps request body:
      // const { username, email, password } = req.body;
      // It searches: findOne({ $or: [{ email }, { username }] })
      // So we can set both email and username to usernameOrEmail to support logging in with either.
      await login({
        username: usernameOrEmail,
        email: usernameOrEmail,
        password,
      });
      toast.success('Logged in successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="h-screen w-screen bg-black overflow-y-auto">
      <div className="min-h-full w-full flex flex-col items-center px-[16px] py-[48px]">
        <div className="my-auto flex flex-col items-center w-full max-w-[400px] flex-shrink-0">
          {/* Spotify Premium Logo/Icon Header */}
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
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-spotify-green to-promo-gradient" />

        <h2 className="text-[24px] font-bold text-white mb-[24px] text-center font-spotifymixuititle">Log in to Spotify</h2>

        {(error || formError) && (
          <div className="bg-signal-red/10 border border-signal-red/35 text-red-200 rounded-[8px] p-[16px] mb-[24px] flex items-start gap-[12px] text-sm animate-shake">
            <AlertTriangle className="w-[20px] h-[20px] text-signal-red flex-shrink-0 mt-0.5" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-bone mb-[8px]">
              Email address or username
            </label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Email address or username"
              className="w-full h-[48px] px-[16px] rounded-[6px] bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-white text-sm transition placeholder-zinc-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-[8px]">
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-bone">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] bg-[#1DB954] hover:bg-[#1fdf64] active:bg-[#1aa34a] text-black font-semibold rounded-full shadow-lg transition duration-200 hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none mt-[24px] text-sm"
          >
            {isLoading ? (
              <div className="w-[20px] h-[20px] border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="border-t border-iron/60 mt-[32px] pt-[24px] text-center text-sm text-mist">
          Don't have an account?{' '}
          <Link to="/register" className="text-spotify-green hover:underline font-semibold">
            Sign up for Spotify
          </Link>
        </div>
      </motion.div>
    </div>
  </div>
</div>
  );
};
