
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Redirect based on authentication status
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user?.role === "user") {
        navigate("/user", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
      <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Index;
