import EnhancedAdminDashboard from "@/components/EnhancedAdminDashboard";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check admin authentication on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      const adminAuth = localStorage.getItem('admin-authenticated');
      const adminToken = localStorage.getItem('admin-token');
      
      if (adminAuth === 'true' && adminToken) {
        setIsAdminAuthenticated(true);
      } else {
        // Clear any partial authentication data
        localStorage.removeItem('admin-authenticated');
        localStorage.removeItem('admin-token');
        setLocation('/admin-login');
      }
      setIsLoading(false);
    };

    checkAuthentication();

    // Listen for storage changes (useful for cross-tab authentication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-authenticated' || e.key === 'admin-token') {
        checkAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, the useEffect will handle redirect
  if (!isAdminAuthenticated) {
    return null;
  }

  return <EnhancedAdminDashboard />;
}