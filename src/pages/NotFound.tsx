
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#D4AF37] mb-4 font-cairo">404</h1>
        <p className="text-xl text-white mb-8 font-cairo">الصفحة غير موجودة</p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-[#D4AF37] hover:bg-[#BF9F30] text-black font-cairo"
        >
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
