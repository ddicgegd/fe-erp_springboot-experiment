import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ─── Route config ──────────────────────────────────────────────────────────────
interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',         icon: 'home',           label: 'Bảng điều khiển' },
  { to: '/tracking', icon: 'local_shipping', label: 'Theo dõi' },
  { to: '/products', icon: 'inventory_2',    label: 'Sản phẩm' },
  { to: '/orders',   icon: 'receipt_long',   label: 'Đơn hàng' },
  { to: '/settings', icon: 'settings',       label: 'Cài đặt' },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-[72px] hidden md:flex flex-col items-center py-6 bg-white/40 dark:bg-surface-dark/40 backdrop-blur-xl z-30 border-r border-gray-200/40 dark:border-accent-dark/60">
      {/* Logo */}
      <NavLink
        to="/"
        className="mb-8 w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-lime-400 to-emerald-400 flex items-center justify-center text-black font-black shadow-glow hover:scale-110 transition-all duration-300 active:scale-95"
      >
        <span className="material-icons-round text-xl">hub</span>
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 w-full px-2.5">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Logout */}
      <button
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent border-none"
        onClick={handleLogout}
        title="Đăng xuất"
      >
        <span className="material-icons-round text-lg">logout</span>
      </button>
    </aside>
  );
};

// ─── NavLink Item ──────────────────────────────────────────────────────────────
const SidebarNavLink: React.FC<NavItem> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === '/'}
    title={label}
    className={({ isActive }) =>
      `w-full h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative group ${
        isActive
          ? 'bg-primary/15 dark:bg-primary/10 text-primary shadow-[0_0_20px_rgba(163,230,53,0.08)]'
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-accent-dark/60'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-glow" />
        )}
        <span className={`material-icons-round text-xl ${isActive ? 'drop-shadow-[0_0_8px_rgba(163,230,53,0.4)]' : ''}`}>
          {icon}
        </span>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-surface-dark text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl z-50 translate-x-1 group-hover:translate-x-0">
          {label}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-surface-dark rotate-45" />
        </div>
      </>
    )}
  </NavLink>
);

export default Sidebar;
