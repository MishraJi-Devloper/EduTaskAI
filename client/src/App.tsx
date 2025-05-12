import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Calendar from "@/pages/calendar";
import Analytics from "@/pages/analytics";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MobileNav from "@/components/mobile-nav";
import ChatButton from "@/components/chat-button";
import { useState, useEffect } from "react";
import { useMedia } from "@/hooks/use-mobile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/analytics" component={Analytics} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Demo user data (in a real app, this would be fetched from an API)
  const [userData] = useState({
    id: 1,
    username: "demo_user",
    fullName: "Alex Johnson",
    fieldOfStudy: "Computer Science"
  });

  // Track mobile state
  const isMobile = useMedia("(max-width: 1024px)");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen">
          {/* Sidebar (desktop) */}
          {!isMobile && <Sidebar user={userData} />}
          
          <div className="flex flex-col flex-1">
            {/* Mobile Header */}
            {isMobile && <Header user={userData} />}
            
            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
              <Router />
            </main>
            
            {/* Mobile Bottom Nav */}
            {isMobile && <MobileNav />}
          </div>
        </div>
        
        {/* AI Chat Button */}
        <ChatButton />
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
