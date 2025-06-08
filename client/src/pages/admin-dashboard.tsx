import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Users, Calendar, Wrench, MessageSquare, DollarSign, Megaphone, Contact, Package, Receipt, CheckSquare, QrCode, Home } from "lucide-react";
import { useLocation } from "wouter";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import AdminTabs from "@/components/admin-tabs";
import backgroundImage from "@assets/image_1749351216300.png";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("properties");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  // Fetch data for overview cards
  const { data: inquiries } = useQuery({
    queryKey: ["/api/admin/inquiries"],
    enabled: isAdminAuthenticated,
  });

  const { data: maintenanceRequests } = useQuery({
    queryKey: ["/api/admin/maintenance"],
    enabled: isAdminAuthenticated,
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/admin/payments"],
    enabled: isAdminAuthenticated,
  });

  const { data: announcements } = useQuery({
    queryKey: ["/api/admin/announcements"],
    enabled: isAdminAuthenticated,
  });

  const { data: calendarEvents } = useQuery({
    queryKey: ["/api/admin/calendar"],
    enabled: isAdminAuthenticated,
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: isAdminAuthenticated,
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/admin/inventory"],
    enabled: isAdminAuthenticated,
  });

  const { data: receipts } = useQuery({
    queryKey: ["/api/admin/receipts"],
    enabled: isAdminAuthenticated,
  });

  const { data: todos } = useQuery({
    queryKey: ["/api/admin/todos"],
    enabled: isAdminAuthenticated,
  });

  const { data: guests } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: isAdminAuthenticated,
  });

  // Check admin authentication on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin-authenticated');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple admin check - in production this would be more secure
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      localStorage.setItem('admin-authenticated', 'true');
      setIsAdminAuthenticated(true);
    } else {
      alert('Invalid credentials. Use username: admin, password: admin123');
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('admin-authenticated');
      setIsAdminAuthenticated(false);
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show login form if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
              <p className="text-gray-600">Enter your credentials to access the dashboard</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials(prev => ({...prev, username: e.target.value}))}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials(prev => ({...prev, password: e.target.value}))}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="text-xs text-gray-500 text-center mt-4">
                Demo credentials: admin / admin123
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="outline" onClick={handleLogout} className="text-xs sm:text-sm">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          
          {/* Mobile Overview Cards (2x2 grid on mobile) */}
          <div className="lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <Bell className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                      <h3 className="text-xs font-semibold text-blue-900">Inquiries</h3>
                      <p className="text-lg font-bold text-blue-700">3</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={() => setActiveTab("inquiries")}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <svg className="h-4 w-4 mx-auto text-green-500 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z"/>
                      </svg>
                      <h3 className="text-xs font-semibold text-green-900">Properties</h3>
                      <p className="text-lg font-bold text-green-700">2</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700 text-xs h-6"
                      onClick={() => setActiveTab("properties")}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <svg className="h-4 w-4 mx-auto text-orange-500 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <h3 className="text-xs font-semibold text-orange-900">Maintenance</h3>
                      <p className="text-lg font-bold text-orange-700">7</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={() => setActiveTab("maintenance")}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <svg className="h-4 w-4 mx-auto text-red-500 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <h3 className="text-xs font-semibold text-red-900">Payments</h3>
                      <p className="text-lg font-bold text-red-700">5</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={() => setActiveTab("guests")}
                    >
                      Track
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Desktop Sidebar with All Management Functions */}
          <div className="hidden lg:block w-80 space-y-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview - Management</h2>
            
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900">Pending Inquiries</h3>
                      <p className="text-2xl font-bold text-blue-700">3</p>
                      <p className="text-xs text-blue-600">Need attention</p>
                    </div>
                    <div className="text-blue-500">
                      <Bell className="h-5 w-5" />
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => setActiveTab("inquiries")}
                  >
                    View Inquiries
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-green-900">Active Properties</h3>
                      <p className="text-2xl font-bold text-green-700">2</p>
                      <p className="text-xs text-green-600">934 Kapahulu & 949 Kawaiahao</p>
                    </div>
                    <div className="text-green-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z"/>
                      </svg>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                    onClick={() => setActiveTab("properties")}
                  >
                    Manage Properties
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-orange-900">Maintenance Requests</h3>
                      <p className="text-2xl font-bold text-orange-700">7</p>
                      <p className="text-xs text-orange-600">Pending repairs</p>
                    </div>
                    <div className="text-orange-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => setActiveTab("maintenance")}
                  >
                    View Requests
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900">Payment Due</h3>
                      <p className="text-2xl font-bold text-red-700">5</p>
                      <p className="text-xs text-red-600">Guests pending payment</p>
                    </div>
                    <div className="text-red-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => setActiveTab("guests")}
                  >
                    Track Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-4 lg:space-y-8">
            {/* Weekly Calendar */}
            <WeeklyCalendar />
            
            <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
}