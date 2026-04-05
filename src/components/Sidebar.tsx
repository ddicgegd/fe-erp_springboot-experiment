
import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  return (
    <aside className="w-20 lg:w-24 hidden md:flex flex-col items-center py-8 border-r border-gray-200 dark:border-accent-dark bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md z-30">
      <div 
        className="mb-10 w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-green-400 flex items-center justify-center text-black font-bold shadow-glow cursor-pointer hover:scale-105 transition-transform"
        onClick={() => onNavigate(ViewState.DASHBOARD)}
      >
        <span className="material-icons-round text-2xl">hub</span>
      </div>
      
      <nav className="flex-1 flex flex-col gap-8 w-full px-2">
        <NavIcon 
          icon="home" 
          active={currentView === ViewState.DASHBOARD} 
          onClick={() => onNavigate(ViewState.DASHBOARD)} 
          label="Bảng điều khiển"
        />
        <NavIcon 
          icon="local_shipping" 
          active={currentView === ViewState.TRACKING} 
          onClick={() => onNavigate(ViewState.TRACKING)} 
          label="Theo dõi"
        />
        <NavIcon 
          icon="inventory_2" 
          active={currentView === ViewState.PRODUCTS} 
          onClick={() => onNavigate(ViewState.PRODUCTS)} 
          label="Sản phẩm"
        />
        <NavIcon 
          icon="insights" 
          active={false} 
          onClick={() => {}} 
          label="Phân tích"
        />
        <NavIcon 
          icon="settings" 
          active={currentView === ViewState.PROFILE} 
          onClick={() => onNavigate(ViewState.PROFILE)} 
          label="Cài đặt"
        />
      </nav>

      <button 
        className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
        onClick={onLogout}
        title="Đăng xuất"
      >
        <span className="material-icons-round text-lg">logout</span>
      </button>
    </aside>
  );
};

const NavIcon: React.FC<{ icon: string; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
  <button 
    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all mx-auto group relative ${
      active 
        ? 'bg-white dark:bg-accent-dark text-primary shadow-lg shadow-primary/20' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-accent-dark'
    }`}
    onClick={onClick}
    title={label}
  >
    <span className="material-icons-round">{icon}</span>
    {active && <div className="absolute w-1 h-1 bg-primary rounded-full bottom-2 opacity-100 shadow-glow"></div>}
  </button>
);

export default Sidebar;
