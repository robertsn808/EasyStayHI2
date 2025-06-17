import EnhancedAdminDashboard from "@/components/EnhancedAdminDashboard";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check admin authentication on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin-authenticated');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // If not authenticated, redirect to login
  if (!isAdminAuthenticated) {
    window.location.href = '/admin-login';
    return null;
  }

  return <EnhancedAdminDashboard />;
}