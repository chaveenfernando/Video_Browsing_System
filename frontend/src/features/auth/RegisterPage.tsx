import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlaySquare, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Role } from '../../types';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('ROLE_CONTENT_CREATOR');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        role,
      });
      navigate(role === 'ROLE_CONTENT_CREATOR' ? '/studio' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 sm:p-8 bg-slate-900/90 border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <PlaySquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-400">
            Choose your group project domain role to get started.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Chaveen Fernando"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Username *"
              placeholder="e.g. chaveen_creator"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              placeholder="user@sliit.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password *"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Assigned Project Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-lg text-slate-100 text-sm focus:outline-none"
            >
              <option value="ROLE_CONTENT_CREATOR">1. Content Creator (Upload, Edit, Delete Videos & Analytics)</option>
              <option value="ROLE_CATEGORY_MANAGER">2. Category Manager (Manage Categories & Tags)</option>
              <option value="ROLE_PLAYLIST_MANAGER">3. Playlist Manager (Create & Order Playlists)</option>
              <option value="ROLE_FAVOURITE_MANAGER">4. Favourite Manager (Manage Bookmarks)</option>
              <option value="ROLE_COMMENT_MANAGER">5. Comment Manager (Moderate & Pin Comments)</option>
              <option value="ROLE_TECHNICAL_SUPPORTER">6. Technical Supporter (Tickets & Bug Logging)</option>
            </select>
          </div>

          <Button type="submit" isLoading={loading} className="w-full gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Complete Registration</span>
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
