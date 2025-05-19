import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure default users are set in localStorage on application start
const initializeDefaultUsers = () => {
  if (!localStorage.getItem("app-users")) {
    const initialMockUsers = [
      { 
        username: "admin", 
        fullName: "مدير النظام", 
        role: "admin", 
        passwordHash: "hashed_admin123",
        permissions: ["create_user", "edit_user", "delete_user", "view_documents", "edit_documents"]
      },
      { 
        username: "user", 
        fullName: "مستخدم النظام", 
        role: "user", 
        passwordHash: "hashed_user123",
        permissions: ["view_documents"]
      }
    ];
    localStorage.setItem("app-users", JSON.stringify(initialMockUsers));
    console.log("Default users initialized in localStorage");
  }
};

// Initialize default users
initializeDefaultUsers();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
