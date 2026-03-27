import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Desktop sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <TopBar />

        <main className="flex-1 px-4 py-6 pb-24 lg:pb-6 max-w-4xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <BottomNavigation />
      </div>
    </div>
  );
}
