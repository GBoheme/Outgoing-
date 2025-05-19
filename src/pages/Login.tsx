import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import GoldenLogo from "@/components/GoldenLogo";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define login form schema
const loginSchema = z.object({
  username: z.string().min(1, "يرجى إدخال اسم المستخدم"),
  password: z.string().min(1, "يرجى إدخال كلمة المرور"),
  rememberPassword: z.boolean().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();

  // Initialize form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberPassword: false
    }
  });

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    
    if (savedUsername && savedPassword) {
      form.setValue("username", savedUsername);
      form.setValue("password", savedPassword);
      form.setValue("rememberPassword", true);
    }
  }, [form]);

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  // Function to handle redirection based on user role
  const redirectBasedOnRole = (role: string) => {
    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/user", { replace: true });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: LoginFormValues) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Debug information
      console.log("Attempting login with:", { 
        username: values.username, 
        password: values.password 
      });

      // Use login function from the auth hook
      const success = await login(values.username, values.password);
      
      // Save credentials if remember password is checked
      if (values.rememberPassword) {
        localStorage.setItem("savedUsername", values.username);
        localStorage.setItem("savedPassword", values.password);
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
      }
      
      if (success && user) {
        toast.success("تم تسجيل الدخول بنجاح");
        redirectBasedOnRole(user.role);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#221F26] border-[#3A3A3C] shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GoldenLogo />
          </div>
          <CardTitle className="text-2xl font-cairo text-white">نظام إدارة الصادر والوارد</CardTitle>
          <CardDescription className="text-gray-300 font-cairo">
            الرجاء تسجيل الدخول للوصول إلى النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} dir="rtl" className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-200 font-cairo">
                      اسم المستخدم
                    </label>
                    <FormControl>
                      <Input
                        id="username"
                        type="text"
                        placeholder="أدخل اسم المستخدم"
                        className="bg-[#2A2D3A] border-[#3A3A3C] text-white placeholder:text-gray-400"
                        dir="rtl"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-200 font-cairo">
                      كلمة المرور
                    </label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور"
                          className="bg-[#2A2D3A] border-[#3A3A3C] text-white placeholder:text-gray-400 pr-10"
                          dir="rtl"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberPassword"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-x-reverse">
                    <FormControl>
                      <Checkbox 
                        id="rememberPassword" 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#D4AF37] border-[#D4AF37]"
                      />
                    </FormControl>
                    <label htmlFor="rememberPassword" className="text-sm font-medium text-gray-200 font-cairo cursor-pointer">
                      تذكر بيانات الدخول
                    </label>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#BF9F30] text-black font-cairo mt-4"
                disabled={isLoading}
              >
                {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} All Rights Reserved | Developed by Ghaith Boheme</p>
        <p>Incoming & Outgoing Documents Management System v1.0</p>
      </div>
    </div>
  );
};

export default Login;
