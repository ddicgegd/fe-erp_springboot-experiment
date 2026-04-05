import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import TrackingScreen from './components/TrackingScreen';
import ProfileScreen from './components/ProfileScreen';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import LiveFeed from './components/LiveFeed';
import ProductListScreen from './components/ProductListScreen';
import UserDetailScreen from './components/UserDetailScreen';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    return localStorage.getItem('access_token') ? ViewState.DASHBOARD : ViewState.LOGIN;
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Layout wrapper for authenticated screens
  const renderView = () => {
    switch (currentView) {
      case ViewState.LOGIN:
        return <LoginScreen onLogin={() => setCurrentView(ViewState.DASHBOARD)} />;
      default:
        return (
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar 
              currentView={currentView} 
              onNavigate={setCurrentView} 
              onLogout={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('nexus_user_info');
                setCurrentView(ViewState.LOGIN);
                window.location.hash = ''; // Clear routes if any
              }} 
            />
            <main className="flex-1 flex flex-col relative overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
              {/* Background Orbs */}
              <div className="fixed top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
              <div className="fixed bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

              <TopNav 
                onToggleTheme={toggleDarkMode} 
                onProfileClick={() => setCurrentView(ViewState.USER_DETAIL)} 
              />
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 z-10 pb-20">
                {currentView === ViewState.DASHBOARD && <DashboardScreen onTrackShipment={() => setCurrentView(ViewState.TRACKING)} />}
                {currentView === ViewState.TRACKING && <TrackingScreen />}
                {currentView === ViewState.PRODUCTS && <ProductListScreen />}
                {currentView === ViewState.PROFILE && <ProfileScreen />}
                {currentView === ViewState.USER_DETAIL && <UserDetailScreen />}
              </div>
              <LiveFeed />
            </main>
          </div>
        );
    }
  };

  return (
    <div className="font-display w-full h-full min-h-screen">
      {renderView()}
    </div>
  );
};

export default App;
