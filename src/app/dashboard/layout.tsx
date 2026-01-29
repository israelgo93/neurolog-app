// src/app/dashboard/layout.tsx
// Layout del dashboard completamente responsivo

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Desktop: Flex layout, Mobile: Stacked layout */}
      <div className="flex h-screen">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Fixed at top */}
          <Header />
          
          {/* Page Content - Scrollable */}
          <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
                {/* Responsive content wrapper */}
                <div className="w-full">
                  {children}
                </div>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  );
}