import type { ReactNode } from 'react';
import { useState } from "react";
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface LayoutProps {
	children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='flex pt-16'>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        <main
          className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
