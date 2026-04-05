import React from 'react';
import { MOCK_USER } from '../constants';

interface TopNavProps {
  onToggleTheme: () => void;
  onProfileClick?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onToggleTheme, onProfileClick }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 dark:border-accent-dark">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Hệ thống <span className="text-primary font-mono tracking-widest">NEXUS</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          HỆ THỐNG TRỰC TUYẾN • ĐỘ TRỄ: 12ms
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex relative">
          <input 
            className="pl-10 pr-4 py-2 bg-white dark:bg-surface-dark border-none ring-1 ring-gray-200 dark:ring-accent-dark rounded-xl text-sm focus:ring-2 focus:ring-primary w-64 transition-all" 
            placeholder="Tìm vận đơn, ID..." 
            type="text" 
          />
          <span className="material-icons-round absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
        </div>

        <button 
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-accent-dark text-gray-500 hover:text-primary transition-all"
          title="Chế độ tối/sáng"
        >
          <span className="material-icons-round text-lg dark:hidden">dark_mode</span>
          <span className="material-icons-round text-lg hidden dark:block">light_mode</span>
        </button>

        <div 
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-accent-dark cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{MOCK_USER.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{MOCK_USER.role}</p>
          </div>
          <div className="relative">
            <img 
              alt="Ảnh đại diện" 
              className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5" 
              src={MOCK_USER.avatar} 
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
