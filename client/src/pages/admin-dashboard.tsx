import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Home, Users, QrCode, Wrench, MessageSquare, Calendar, 
  DollarSign, Megaphone, Contact, Package, Receipt, Bell,
  CheckCircle, AlertTriangle, Clock, User, Settings, Building, LogOut
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import backgroundImage from "@assets/image_1749351216300.png";
import AdminTabs from "@/components/admin-tabs";

type TabType = 
  | "quick-access"
  | "934" 
  | "949"
  | "payment-tracker" 
  | "maintenance" 
  | "inquiries" 
  | "payments" 
  | "announcements" 
  | "calendar" 
  | "contacts" 
  | "inventory" 
  | "receipts" 
  | "todos"
  | "settings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("quick-access");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [, setLocation] = useLocation();

  // Check admin authentication on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin-authenticated');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Fetch all data - only when authenticated
  const { data: rooms } = useQuery({ 
    queryKey: ["/api/rooms"],
    enabled: isAdminAuthenticated
  });
  const { data: guests } = useQuery({ 
    queryKey: ["/api/admin/guests"],
    enabled: isAdminAuthenticated
  });
  const { data: maintenanceRequests } = useQuery({ 
    queryKey: ["/api/admin/maintenance"],
    enabled: isAdminAuthenticated
  });
  const { data: inquiries } = useQuery({ 
    queryKey: ["/api/admin/inquiries"],
    enabled: isAdminAuthenticated
  });
  const { data: payments } = useQuery({ 
    queryKey: ["/api/admin/payments"],
    enabled: isAdminAuthenticated
  });
  const { data: announcements } = useQuery({ 
    queryKey: ["/api/admin/announcements"],
    enabled: isAdminAuthenticated
  });
  const { data: calendarEvents } = useQuery({ 
    queryKey: ["/api/admin/calendar"],
    enabled: isAdminAuthenticated
  });
  const { data: contacts } = useQuery({ 
    queryKey: ["/api/admin/contacts"],
    enabled: isAdminAuthenticated
  });
  const { data: inventory } = useQuery({ 
    queryKey: ["/api/admin/inventory"],
    enabled: isAdminAuthenticated
  });
  const { data: receipts } = useQuery({ 
    queryKey: ["/api/admin/receipts"],
    enabled: isAdminAuthenticated
  });
  const { data: todos } = useQuery({ 
    queryKey: ["/api/admin/todos"],
    enabled: isAdminAuthenticated
  });

  // Calculate room statistics
  const roomStats = rooms ? {
    total: rooms.length,
    occupied: rooms.filter((room: any) => room.status === 'occupied').length,
    available: rooms.filter((room: any) => room.status === 'available').length,
    maintenance: rooms.filter((room: any) => room.status === 'maintenance').length,
    cleaning: rooms.filter((room: any) => room.status === 'needs cleaning').length
  } : { total: 0, occupied: 0, available: 0, maintenance: 0, cleaning: 0 };

  // Count today's payment due guests
  const todaysPaymentDue = guests ? guests.filter((guest: any) => {
    if (!guest.nextPaymentDue) return false;
    const today = new Date().toDateString();
    const paymentDue = new Date(guest.nextPaymentDue).toDateString();
    return today === paymentDue && guest.paymentStatus !== 'paid';
  }).length : 0;

  // Count incomplete todos
  const incompleteTodos = todos ? todos.filter((todo: any) => !todo.isCompleted).length : 0;

  // Admin login handlers
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple admin check - matches server credentials
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

  // If loading initial data, show loading state
  if (!rooms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96 p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Please wait while we load your property data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Premium Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 animate-pulse"></div>
                <img 
                  src={backgroundImage} 
                  alt="EasyStay HI" 
                  className="relative h-10 w-10 rounded-xl object-cover shadow-lg ring-2 ring-white"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  EasyStay HI
                </h1>
                <p className="text-sm text-slate-500 font-medium">Property Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-4 mr-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-white text-xs font-semibold">LIVE</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Revenue</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    $15,240
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-slate-100">
                <Bell className="h-4 w-4 text-slate-600" />
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></div>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-slate-100"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4 text-slate-600" />
              </Button>
              
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="relative">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full w-3 h-3 border-2 border-white"></div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">Admin</p>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Overview Cards */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className={`${activeTab === "quick-access" ? "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-300 shadow-md" : "bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-md"} cursor-pointer transition-all duration-200`}
            onClick={() => setActiveTab("quick-access")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto mb-2 w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-900">Quick</p>
                <p className="text-xs text-slate-500">Access</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${activeTab === "934" ? "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300 shadow-md" : "bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-md"} cursor-pointer transition-all duration-200`}
            onClick={() => setActiveTab("934")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto mb-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-blue-900">934</p>
                <p className="text-sm font-bold text-blue-700">{Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 10).length : 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${activeTab === "949" ? "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300 shadow-md" : "bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-md"} cursor-pointer transition-all duration-200`}
            onClick={() => setActiveTab("949")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto mb-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-purple-900">949</p>
                <p className="text-sm font-bold text-purple-700">{Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 11).length : 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${activeTab === "maintenance" ? "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-300 shadow-md" : "bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-md"} cursor-pointer transition-all duration-200`}
            onClick={() => setActiveTab("maintenance")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto mb-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-orange-900">Maintenance</p>
                <p className="text-sm font-bold text-orange-700">{Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${activeTab === "inquiries" ? "bg-gradient-to-br from-cyan-100 to-cyan-50 border-cyan-300 shadow-md" : "bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-md"} cursor-pointer transition-all duration-200`}
            onClick={() => setActiveTab("inquiries")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto mb-2 w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-cyan-900">Inquiries</p>
                <p className="text-sm font-bold text-cyan-700">{Array.isArray(inquiries) ? inquiries.length : 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Premium Desktop Sidebar */}
          <div className="hidden lg:block w-80 space-y-6 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Property Overview</h2>
            </div>
            
            {/* Quick Access */}
            <div className="mb-6">
              <Card className={`${activeTab === "quick-access" ? "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-300 shadow-lg" : "bg-white/90 backdrop-blur-sm border-slate-200/60 hover:shadow-lg"} cursor-pointer transition-all duration-300 group`}
                onClick={() => setActiveTab("quick-access")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Quick Access</h3>
                      <p className="text-xs text-slate-500 font-medium">Dashboard & Notifications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Building Management Grid */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Card className={`${activeTab === "934" ? "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300 shadow-lg" : "bg-white/90 backdrop-blur-sm border-slate-200/60 hover:shadow-lg"} cursor-pointer transition-all duration-300 group`}
                onClick={() => setActiveTab("934")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-blue-900">934 Kapahulu Ave</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xl font-bold text-blue-700">{Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 10).length : 0}</p>
                        <span className="text-xs text-blue-600 font-medium">rooms</span>
                      </div>
                      <p className="text-xs text-blue-500 mt-1">{Array.isArray(inquiries) ? inquiries.filter((i: any) => i.message?.toLowerCase().includes('934') || i.message?.toLowerCase().includes('kapahulu') || (!i.message?.toLowerCase().includes('949') && !i.message?.toLowerCase().includes('kawaiahao'))).length : 0} inquiries pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "949" ? "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300 shadow-lg" : "bg-white/90 backdrop-blur-sm border-slate-200/60 hover:shadow-lg"} cursor-pointer transition-all duration-300 group`}
                onClick={() => setActiveTab("949")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-purple-900">949 Kawaiahao St</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xl font-bold text-purple-700">{Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 11).length : 0}</p>
                        <span className="text-xs text-purple-600 font-medium">suites</span>
                      </div>
                      <p className="text-xs text-purple-500 mt-1">{Array.isArray(inquiries) ? inquiries.filter((i: any) => i.message?.toLowerCase().includes('949') || i.message?.toLowerCase().includes('kawaiahao')).length : 0} inquiries pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "payment-tracker" ? "bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-300 shadow-lg" : "bg-white/90 backdrop-blur-sm border-slate-200/60 hover:shadow-lg"} cursor-pointer transition-all duration-300 group`}
                onClick={() => setActiveTab("payment-tracker")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-emerald-900">Payment Tracker</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xl font-bold text-emerald-700">{Array.isArray(payments) ? payments.length : 0}</p>
                        <span className="text-xs text-emerald-600 font-medium">active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "maintenance" ? "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-300 shadow-lg" : "bg-white/90 backdrop-blur-sm border-slate-200/60 hover:shadow-lg"} cursor-pointer transition-all duration-300 group`}
                onClick={() => setActiveTab("maintenance")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-orange-900">Maintenance</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xl font-bold text-orange-700">{Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0}</p>
                        <span className="text-xs text-orange-600 font-medium">requests</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "inquiries" ? "bg-gradient-to-br from-cyan-100 to-cyan-50 border-cyan-300 shadow-lg" : "bg-white/90 backdrop-blur-sm border-slate-200/60 hover:shadow-lg"} cursor-pointer transition-all duration-300 group`}
                onClick={() => setActiveTab("inquiries")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-cyan-900">Inquiries</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xl font-bold text-cyan-700">{Array.isArray(inquiries) ? inquiries.length : 0}</p>
                        <span className="text-xs text-cyan-600 font-medium">pending</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "calendar" ? "bg-indigo-100 border-indigo-300" : "bg-indigo-50 border-indigo-200"} cursor-pointer`}
                onClick={() => setActiveTab("calendar")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-indigo-900">Calendar</h3>
                      <p className="text-lg font-bold text-indigo-700">{Array.isArray(calendarEvents) ? calendarEvents.length : 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Buttons */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Quick Access</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("payments")}
                >
                  <DollarSign className="h-3 w-3 mr-2" />
                  Payments ({Array.isArray(payments) ? payments.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("announcements")}
                >
                  <Megaphone className="h-3 w-3 mr-2" />
                  Announcements ({Array.isArray(announcements) ? announcements.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("contacts")}
                >
                  <Contact className="h-3 w-3 mr-2" />
                  Contacts ({Array.isArray(contacts) ? contacts.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("inventory")}
                >
                  <Package className="h-3 w-3 mr-2" />
                  Inventory ({Array.isArray(inventory) ? inventory.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("receipts")}
                >
                  <Receipt className="h-3 w-3 mr-2" />
                  Receipts ({Array.isArray(receipts) ? receipts.length : 0})
                </Button>
              </div>
            </div>

            {/* Today's Overview */}
            <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-3">Today's Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-800">Payment Due</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">{todaysPaymentDue}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-800">Pending Tasks</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">{incompleteTodos}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-800">Available Rooms</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">{roomStats.available}</span>
                  </div>

                  {calendarEvents && calendarEvents.length > 0 && (
                    <div className="pt-2 border-t border-amber-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-amber-800">Today's Events</span>
                      </div>
                      {calendarEvents.slice(0, 2).map((event: any) => (
                        <div key={event.id} className="text-xs text-amber-700 mb-1">
                          • {event.title}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => setActiveTab("calendar")}
                  >
                    View Full Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Main Content Area */}
          <div className="flex-1 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm shadow-xl border border-slate-200/60 rounded-2xl ring-1 ring-slate-200/50 overflow-hidden">
              <div className="p-8">
                <AdminTabs activeTab={activeTab} setActiveTab={(tab: string) => setActiveTab(tab as TabType)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}