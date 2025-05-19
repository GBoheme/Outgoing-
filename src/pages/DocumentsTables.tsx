
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentsTableWithDetails from "@/components/documents/DocumentsTableWithDetails";
import { useIsMobile } from "@/hooks/useIsMobile";

// Helper function for conditional class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const DocumentsTables = () => {
  // Get sidebar state from localStorage if available, otherwise default to open
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarState');
    return savedState !== null ? savedState === 'open' : true;
  });
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Listen for sidebar state changes
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sidebarState') {
        setSidebarOpen(e.newValue === 'open');
      }
    };
    
    const handleSidebarClose = () => {
      setSidebarOpen(false);
    };
    
    const handleSidebarStateChanged = () => {
      const currentState = localStorage.getItem('sidebarState');
      setSidebarOpen(currentState === 'open');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('closeSidebar', handleSidebarClose);
    window.addEventListener('sidebarStateChanged', handleSidebarStateChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('closeSidebar', handleSidebarClose);
      window.removeEventListener('sidebarStateChanged', handleSidebarStateChanged);
    };
  }, []);

  // Toggle sidebar function
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarState', newState ? 'open' : 'closed');
    
    // Dispatch custom event to notify other components
    const event = new CustomEvent('sidebarStateChanged');
    window.dispatchEvent(event);
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] dark:bg-background transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-[#D4AF37] dark:border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1F2C] dark:bg-background text-white transition-colors duration-300" dir="rtl">
      <Navbar
        userName={user.fullName}
        userRole={user.role === "admin" ? "مدير النظام" : "مستخدم النظام"}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-1">
        <Sidebar 
          isOpen={sidebarOpen} 
          userRole={user.role}
          toggleSidebar={toggleSidebar} 
        />
        
        <div 
          className={cn(
            "flex-1 p-4 transition-all duration-300 flex flex-col",
            isMobile ? "w-full" : (sidebarOpen ? 'md:mr-64' : 'md:mr-[70px]')
          )}
        >
          <Card className="mb-6 bg-[#221F26] dark:bg-card border-[#3A3A3C] dark:border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#D4AF37] dark:text-primary text-xl font-cairo">
                جدول الوثائق
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue="inbound" className="w-full flex-1">
            <TabsList className="w-full mb-6 bg-[#221F26] dark:bg-secondary">
              <TabsTrigger 
                value="inbound" 
                className="flex-1 data-[state=active]:bg-[#D4AF37] dark:data-[state=active]:bg-primary data-[state=active]:text-black dark:data-[state=active]:text-black"
              >
                الوثائق الواردة
              </TabsTrigger>
              <TabsTrigger 
                value="outbound" 
                className="flex-1 data-[state=active]:bg-[#D4AF37] dark:data-[state=active]:bg-primary data-[state=active]:text-black dark:data-[state=active]:text-black"
              >
                الوثائق الصادرة
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="inbound" className="transition-all duration-300 animate-fade-in">
              <DocumentsTableWithDetails type="inbound" />
            </TabsContent>
            
            <TabsContent value="outbound" className="transition-all duration-300 animate-fade-in">
              <DocumentsTableWithDetails type="outbound" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DocumentsTables;
