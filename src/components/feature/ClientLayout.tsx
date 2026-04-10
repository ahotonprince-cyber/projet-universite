import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import ClientTopBar from './ClientTopBar';

export default function ClientLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ClientSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <ClientTopBar />
        <main className="flex-1 mt-16 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
