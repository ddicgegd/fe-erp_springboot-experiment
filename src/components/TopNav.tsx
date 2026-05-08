import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const THEME_KEY = 'nexus_theme';

const TopNav: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Khởi tạo từ localStorage (đồng bộ với script trong index.html)
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored !== 'light'; // mặc định = dark
  });

  // Đồng bộ dark mode class + localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((p) => !p), []);

  // Display info
  const displayName = user?.username || user?.email || 'Nexus User';
  const displayRole = user?.roles?.[0] ?? 'USER';
  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=A3E635&color=000&bold=true&size=80`;

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-8 bg-white/60 dark:bg-background-dark/80 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-200/60 dark:border-accent-dark/60">
      {/* Left — Brand */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg lg:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
            Hệ thống <span className="text-primary font-mono tracking-[0.15em]">NEXUS</span>
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5 flex items-center gap-1.5 font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            Trực tuyến • Độ trễ: 12ms
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Search */}
        <div className="hidden lg:flex relative group">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-[18px] group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 bg-gray-100/80 dark:bg-accent-dark/60 border border-transparent ring-0 rounded-xl text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/30 w-56 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-800 dark:text-gray-200 outline-none"
            placeholder="Tìm vận đơn, ID..."
            type="text"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-accent-dark border border-gray-200/60 dark:border-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all cursor-pointer hover:shadow-glow/20"
          title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          <span className="material-icons-round text-[18px] dark:hidden">dark_mode</span>
          <span className="material-icons-round text-[18px] hidden dark:block">light_mode</span>
        </button>

        {/* Notification Bell */}
        <button className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-accent-dark border border-gray-200/60 dark:border-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-all cursor-pointer relative">
          <span className="material-icons-round text-[18px]">notifications_none</span>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-background-dark" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-accent-dark hidden sm:block" />

        {/* User Profile */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
              {displayName}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider">
              {displayRole}
            </p>
          </div>
          <div className="relative">
            <img
              alt="Ảnh đại diện"
              className="w-9 h-9 rounded-xl border-2 border-primary/20 object-cover"
              src={avatarUrl}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-background-dark rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
