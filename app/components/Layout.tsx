import type { ReactNode } from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        className="fixed top-0 left-0 h-screen z-40"
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        } flex flex-col min-h-screen`}
      >
        <Navbar toggleSidebar={() => setIsCollapsed((v) => !v)} isCollapsed={isCollapsed} />

<main className="flex-1 p-6 bg-background pt-16">{children}</main>
      </div>
    </div>
  );
}
