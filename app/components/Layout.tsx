import type { ReactNode } from 'react';
import { useEffect, useState, useRef } from "react";
import { useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const hoverRef = useRef(false);

  useEffect(() => {
    setIsSidebarCollapsed(false);
    const timer = setTimeout(() => setIsSidebarCollapsed(true), 3000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSidebarHover = (hovered: boolean) => {
    hoverRef.current = hovered;
    if (hovered) {
      setIsSidebarCollapsed(false);
    } else {
      // when hover ends, collapse again
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='flex pt-16'>
        <Sidebar isCollapsed={isSidebarCollapsed} onHoverChange={handleSidebarHover} />
        <main
          className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-16' : 'ml-72'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
