import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlaySquare, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      await login({ usernameOrEmail, password });
      navigate('/studio');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    }
  };

  const handleQuickFill = (userType: 'creator' | 'category' | 'playlist') => {
    if (userType === 'creator') {
      setUsernameOrEmail('creator@sliit.lk');
      setPassword('password123');
    } else if (userType === 'category') {
      setUsernameOrEmail('category@sliit.lk');
      setPassword('password123');
    } else {
      setUsernameOrEmail('playlist@sliit.lk');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-slate-900/90 border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <PlaySquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In to Studio</h2>
          <p className="text-xs text-slate-400">
            Web-Based Video Browsing System (SE2030)
          </p>
        </div>

        {/* Demo Fast Login Helpers for Viva */}
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Viva Quick Sign-In:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('creator')}
              className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-[11px] font-medium border border-indigo-500/30 transition-colors truncate"
            >
              Creator
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('category')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors truncate"
            >
              Category
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('playlist')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors truncate"
            >
              Playlist
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Username or Email"
            type="text"
            placeholder="e.g. creator@sliit.lk"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" isLoading={loading} className="w-full gap-2">
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
};
