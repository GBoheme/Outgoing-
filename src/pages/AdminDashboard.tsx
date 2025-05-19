import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/admin/StatsCards";
import DocumentsTable from "@/components/admin/DocumentsTable";
import UsersManagement from "@/components/admin/UsersManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import DocumentsChart from "@/components/admin/DocumentsChart";
import UploadDocument from "@/components/user/UploadDocument";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  // Get sidebar state from localStorage if available, otherwise default to open
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarState');
    return savedState !== null ? savedState === 'open' : true;
  });
  const {
    user,
    isAuthenticated,
    isLoading
  } = useAuth();
  const {
    settings
  } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Listen for external changes to sidebar state and close events
  useEffect(() => {
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

  // Get active tab from URL or default to first tab
  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    return tab || '';
  };
  const activeTab = getActiveTab();

  // Get current time to customize greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "مساء الخير";
    if (hour < 12) return "صباح الخير";
    if (hour < 17) return "ظهيرة سعيدة";
    return "مساء الخير";
  };

  // Handle tab change with direct navigation
  const handleTabChange = (value: string) => {
    // Direct navigation using replace to avoid adding to history stack
    navigate(`/admin?tab=${value}`, { replace: true });
  };

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate, isLoading]);
  
  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] dark:bg-background transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-[#D4AF37] dark:border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }
  
  return <div className="min-h-screen bg-[#1A1F2C] dark:bg-background text-white transition-colors duration-300" dir="rtl">
      <Navbar userName={user.fullName} userRole="مدير النظام" sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} userRole="admin" toggleSidebar={toggleSidebar} />
        
        <div className={`flex-1 py-4 px-5 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:mr-64' : 'md:mr-[70px]'}`}>
          <Card className="mb-5 bg-[#221F26] dark:bg-card border-[#3A3A3C] dark:border-border">
            <CardHeader className="pb-2 py-4 px-6">
              <CardTitle className="text-[#D4AF37] dark:text-primary text-xl font-cairo">
                {getGreeting()}, <span className="font-bold">{user.fullName}</span>
              </CardTitle>
              <CardDescription className="text-gray-300 dark:text-muted-foreground font-cairo">
                مرحباً بك في لوحة تحكم مدير النظام لـ {settings?.companyName || "نظام إدارة الوثائق"}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
            <div className="lg:col-span-4 bg-[#221F26] dark:bg-card rounded-lg p-4 shadow-md border border-[#3A3A3C] dark:border-border transition-colors duration-300">
              <h2 className="text-xl font-bold mb-3 text-[#D4AF37] dark:text-primary font-cairo">توزيع الوثائق</h2>
              <DocumentsChart />
            </div>
          </div>
          
          <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 bg-[#221F26] dark:bg-secondary overflow-x-auto">
              <TabsTrigger value="inbound" className="font-cairo data-[state=active]:bg-[#D4AF37] dark:data-[state=active]:bg-primary data-[state=active]:text-black dark:data-[state=active]:text-black whitespace-nowrap">
                الوثائق الواردة
              </TabsTrigger>
              <TabsTrigger value="outbound" className="font-cairo data-[state=active]:bg-[#D4AF37] dark:data-[state=active]:bg-primary data-[state=active]:text-black dark:data-[state=active]:text-black whitespace-nowrap">
                الوثائق الصادرة
              </TabsTrigger>
              <TabsTrigger value="add-document" className="font-cairo data-[state=active]:bg-[#D4AF37] dark:data-[state=active]:bg-primary data-[state=active]:text-black dark:data-[state=active]:text-black whitespace-nowrap">
                إضافة وثيقة
              </TabsTrigger>
              <TabsTrigger value="users" className="font-cairo data-[state=active]:bg-[#D4AF37] dark:data-[state=active]:bg-primary data-[state=active]:text-black dark:data-[state=active]:text-black whitespace-nowrap">
                إدارة المستخدمين
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-cairo data-[state=active]:bg-[#D4AF37] dark:data-[state=active]:bg-primary data-[state=active]:text-black dark:data-[state=active]:text-black whitespace-nowrap">
                إعدادات النظام
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="inbound" className="transition-all duration-300 animate-fade-in">
              <DocumentsTable type="inbound" />
            </TabsContent>
            
            <TabsContent value="outbound" className="transition-all duration-300 animate-fade-in">
              <DocumentsTable type="outbound" />
            </TabsContent>
            
            <TabsContent value="add-document" className="transition-all duration-300 animate-fade-in">
              <div className="bg-[#221F26] dark:bg-card rounded-lg p-4 shadow-md border border-[#3A3A3C] dark:border-border">
                <h2 className="text-xl font-bold mb-4 text-[#D4AF37] dark:text-primary font-cairo">إضافة وثيقة جديدة</h2>
                <UploadDocument />
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="transition-all duration-300 animate-fade-in">
              <UsersManagement />
            </TabsContent>
            
            <TabsContent value="settings" className="transition-all duration-300 animate-fade-in">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};

export default AdminDashboard;
