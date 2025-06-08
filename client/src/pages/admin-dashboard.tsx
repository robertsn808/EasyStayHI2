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
          
          {/* Mobile Overview Cards - All Management Functions */}
          <div className="lg:hidden">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Overview</h2>
            <div className="grid grid-cols-3 gap-2">
              <Card className={`${activeTab === "properties" ? "bg-green-100 border-green-300" : "bg-green-50 border-green-200"} cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("properties");
                }}
              >
                <CardContent className="p-2">
                  <div className="text-center">
                    <Home className="h-3 w-3 mx-auto text-green-500 mb-1" />
                    <h3 className="text-xs font-medium text-green-900">Properties</h3>
                    <p className="text-sm font-bold text-green-700">2</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "guests" ? "bg-blue-100 border-blue-300" : "bg-blue-50 border-blue-200"} cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("guests");
                }}
              >
                <CardContent className="p-2">
                  <div className="text-center">
                    <Users className="h-3 w-3 mx-auto text-blue-500 mb-1" />
                    <h3 className="text-xs font-medium text-blue-900">Guests</h3>
                    <p className="text-sm font-bold text-blue-700">{Array.isArray(guests) ? guests.length : 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "qr-codes" ? "bg-purple-100 border-purple-300" : "bg-purple-50 border-purple-200"} cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("qr-codes");
                }}
              >
                <CardContent className="p-2">
                  <div className="text-center">
                    <QrCode className="h-3 w-3 mx-auto text-purple-500 mb-1" />
                    <h3 className="text-xs font-medium text-purple-900">QR Codes</h3>
                    <p className="text-sm font-bold text-purple-700">18</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "maintenance" ? "bg-orange-100 border-orange-300" : "bg-orange-50 border-orange-200"} cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("maintenance");
                }}
              >
                <CardContent className="p-2">
                  <div className="text-center">
                    <Wrench className="h-3 w-3 mx-auto text-orange-500 mb-1" />
                    <h3 className="text-xs font-medium text-orange-900">Maintenance</h3>
                    <p className="text-sm font-bold text-orange-700">{Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "inquiries" ? "bg-cyan-100 border-cyan-300" : "bg-cyan-50 border-cyan-200"} cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("inquiries");
                }}
              >
                <CardContent className="p-2">
                  <div className="text-center">
                    <MessageSquare className="h-3 w-3 mx-auto text-cyan-500 mb-1" />
                    <h3 className="text-xs font-medium text-cyan-900">Inquiries</h3>
                    <p className="text-sm font-bold text-cyan-700">{Array.isArray(inquiries) ? inquiries.length : 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "payments" ? "bg-emerald-100 border-emerald-300" : "bg-emerald-50 border-emerald-200"} cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("payments");
                }}
              >
                <CardContent className="p-2">
                  <div className="text-center">
                    <DollarSign className="h-3 w-3 mx-auto text-emerald-500 mb-1" />
                    <h3 className="text-xs font-medium text-emerald-900">Payments</h3>
                    <p className="text-sm font-bold text-emerald-700">{Array.isArray(payments) ? payments.length : 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "announcements" ? "bg-gradient-to-r from-red-100 to-red-200 border-red-300" : "bg-gradient-to-r from-red-50 to-red-100 border-red-200"}`}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <Megaphone className="h-4 w-4 mx-auto text-red-500 mb-1" />
                      <h3 className="text-xs font-semibold text-red-900">Announcements</h3>
                      <p className="text-lg font-bold text-red-700">{Array.isArray(announcements) ? announcements.length : 0}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("announcements");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "calendar" ? "bg-gradient-to-r from-indigo-100 to-indigo-200 border-indigo-300" : "bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200"}`}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <Calendar className="h-4 w-4 mx-auto text-indigo-500 mb-1" />
                      <h3 className="text-xs font-semibold text-indigo-900">Calendar</h3>
                      <p className="text-lg font-bold text-indigo-700">{Array.isArray(calendarEvents) ? calendarEvents.length : 0}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("calendar");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "contacts" ? "bg-gradient-to-r from-pink-100 to-pink-200 border-pink-300" : "bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200"}`}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <Contact className="h-4 w-4 mx-auto text-pink-500 mb-1" />
                      <h3 className="text-xs font-semibold text-pink-900">Contacts</h3>
                      <p className="text-lg font-bold text-pink-700">{Array.isArray(contacts) ? contacts.length : 0}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("contacts");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "inventory" ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300" : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"}`}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <Package className="h-4 w-4 mx-auto text-yellow-600 mb-1" />
                      <h3 className="text-xs font-semibold text-yellow-900">Inventory</h3>
                      <p className="text-lg font-bold text-yellow-700">{Array.isArray(inventory) ? inventory.length : 0}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("inventory");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "receipts" ? "bg-gradient-to-r from-teal-100 to-teal-200 border-teal-300" : "bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200"}`}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <Receipt className="h-4 w-4 mx-auto text-teal-500 mb-1" />
                      <h3 className="text-xs font-semibold text-teal-900">Receipts</h3>
                      <p className="text-lg font-bold text-teal-700">{Array.isArray(receipts) ? receipts.length : 0}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("receipts");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "todos" ? "bg-gradient-to-r from-violet-100 to-violet-200 border-violet-300" : "bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200"}`}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      <CheckSquare className="h-4 w-4 mx-auto text-violet-500 mb-1" />
                      <h3 className="text-xs font-semibold text-violet-900">Todos</h3>
                      <p className="text-lg font-bold text-violet-700">{Array.isArray(todos) ? todos.length : 0}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-6"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("todos");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Desktop Sidebar with All Management Functions */}
          <div className="hidden lg:block w-80 space-y-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview - Management</h2>
            
            {/* Properties Management */}
            <Card className={`${activeTab === "properties" ? "bg-gradient-to-r from-green-100 to-green-200 border-green-300" : "bg-gradient-to-r from-green-50 to-green-100 border-green-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-green-900">Properties</h3>
                      <p className="text-2xl font-bold text-green-700">2</p>
                      <p className="text-xs text-green-600">Active buildings</p>
                    </div>
                    <Home className="h-5 w-5 text-green-500" />
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("properties");
                    }}
                  >
                    Manage Properties
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guest Profiles */}
            <Card className={`${activeTab === "guests" ? "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300" : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900">Guest Profiles</h3>
                      <p className="text-2xl font-bold text-blue-700">{Array.isArray(guests) ? guests.length : 0}</p>
                      <p className="text-xs text-blue-600">Current guests</p>
                    </div>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("guests");
                    }}
                  >
                    Manage Guests
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR Codes */}
            <Card className={`${activeTab === "qr-codes" ? "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300" : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-purple-900">QR Codes</h3>
                      <p className="text-2xl font-bold text-purple-700">18</p>
                      <p className="text-xs text-purple-600">Room access codes</p>
                    </div>
                    <QrCode className="h-5 w-5 text-purple-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("qr-codes");
                    }}
                  >
                    View QR Codes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Requests */}
            <Card className={`${activeTab === "maintenance" ? "bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300" : "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-orange-900">Maintenance</h3>
                      <p className="text-2xl font-bold text-orange-700">{Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0}</p>
                      <p className="text-xs text-orange-600">Pending requests</p>
                    </div>
                    <Wrench className="h-5 w-5 text-orange-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("maintenance");
                    }}
                  >
                    View Requests
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inquiries */}
            <Card className={`${activeTab === "inquiries" ? "bg-gradient-to-r from-cyan-100 to-cyan-200 border-cyan-300" : "bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-cyan-900">Inquiries</h3>
                      <p className="text-2xl font-bold text-cyan-700">{Array.isArray(inquiries) ? inquiries.length : 0}</p>
                      <p className="text-xs text-cyan-600">Customer inquiries</p>
                    </div>
                    <MessageSquare className="h-5 w-5 text-cyan-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("inquiries");
                    }}
                  >
                    View Inquiries
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card className={`${activeTab === "payments" ? "bg-gradient-to-r from-emerald-100 to-emerald-200 border-emerald-300" : "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-emerald-900">Payments</h3>
                      <p className="text-2xl font-bold text-emerald-700">{Array.isArray(payments) ? payments.length : 0}</p>
                      <p className="text-xs text-emerald-600">Payment records</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("payments");
                    }}
                  >
                    View Payments
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className={`${activeTab === "announcements" ? "bg-gradient-to-r from-red-100 to-red-200 border-red-300" : "bg-gradient-to-r from-red-50 to-red-100 border-red-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900">Announcements</h3>
                      <p className="text-2xl font-bold text-red-700">{Array.isArray(announcements) ? announcements.length : 0}</p>
                      <p className="text-xs text-red-600">Active announcements</p>
                    </div>
                    <Megaphone className="h-5 w-5 text-red-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("announcements");
                    }}
                  >
                    View Announcements
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Events */}
            <Card className={`${activeTab === "calendar" ? "bg-gradient-to-r from-indigo-100 to-indigo-200 border-indigo-300" : "bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-indigo-900">Calendar</h3>
                      <p className="text-2xl font-bold text-indigo-700">{Array.isArray(calendarEvents) ? calendarEvents.length : 0}</p>
                      <p className="text-xs text-indigo-600">Scheduled events</p>
                    </div>
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("calendar");
                    }}
                  >
                    View Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card className={`${activeTab === "contacts" ? "bg-gradient-to-r from-pink-100 to-pink-200 border-pink-300" : "bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-pink-900">Contacts</h3>
                      <p className="text-2xl font-bold text-pink-700">{Array.isArray(contacts) ? contacts.length : 0}</p>
                      <p className="text-xs text-pink-600">Contact directory</p>
                    </div>
                    <Contact className="h-5 w-5 text-pink-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("contacts");
                    }}
                  >
                    View Contacts
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card className={`${activeTab === "inventory" ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300" : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-yellow-900">Inventory</h3>
                      <p className="text-2xl font-bold text-yellow-700">{Array.isArray(inventory) ? inventory.length : 0}</p>
                      <p className="text-xs text-yellow-600">Items tracked</p>
                    </div>
                    <Package className="h-5 w-5 text-yellow-600" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("inventory");
                    }}
                  >
                    View Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Receipts */}
            <Card className={`${activeTab === "receipts" ? "bg-gradient-to-r from-teal-100 to-teal-200 border-teal-300" : "bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-teal-900">Receipts</h3>
                      <p className="text-2xl font-bold text-teal-700">{Array.isArray(receipts) ? receipts.length : 0}</p>
                      <p className="text-xs text-teal-600">Transaction receipts</p>
                    </div>
                    <Receipt className="h-5 w-5 text-teal-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("receipts");
                    }}
                  >
                    View Receipts
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Todos */}
            <Card className={`${activeTab === "todos" ? "bg-gradient-to-r from-violet-100 to-violet-200 border-violet-300" : "bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200"}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-violet-900">Todos</h3>
                      <p className="text-2xl font-bold text-violet-700">{Array.isArray(todos) ? todos.length : 0}</p>
                      <p className="text-xs text-violet-600">Tasks pending</p>
                    </div>
                    <CheckSquare className="h-5 w-5 text-violet-500" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("todos");
                    }}
                  >
                    View Todos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule Overview */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">Weekly Schedule</h3>
                      <p className="text-2xl font-bold text-slate-700">{Array.isArray(calendarEvents) ? calendarEvents.length : 0}</p>
                      <p className="text-xs text-slate-600">Events this week</p>
                    </div>
                    <Calendar className="h-5 w-5 text-slate-500" />
                  </div>
                  
                  {/* Quick Schedule Preview */}
                  <div className="space-y-2 text-xs">
                    {Array.isArray(calendarEvents) && calendarEvents.slice(0, 3).map((event: any, index: number) => (
                      <div key={event.id || index} className="flex justify-between items-center p-2 bg-white rounded border">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 truncate">{event.title}</p>
                          <p className="text-slate-500">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            event.type === 'cleaning' ? 'border-blue-300 text-blue-700' :
                            event.type === 'maintenance' ? 'border-orange-300 text-orange-700' :
                            event.type === 'inspection' ? 'border-purple-300 text-purple-700' :
                            'border-gray-300 text-gray-700'
                          }`}
                        >
                          {event.type}
                        </Badge>
                      </div>
                    ))}
                    
                    {(!Array.isArray(calendarEvents) || calendarEvents.length === 0) && (
                      <div className="text-center py-2 text-slate-500">
                        No events scheduled
                      </div>
                    )}
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("calendar");
                    }}
                  >
                    View Full Schedule
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