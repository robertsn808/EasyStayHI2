import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, User, Search, CheckCircle, Home, DollarSign, 
  Wrench, AlertTriangle, Calendar, Users, MessageSquare,
  TrendingUp, Activity, Clock, MapPin, Building, Mail, 
  Phone, Edit, Trash2, Plus, FileText, Package
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminTabs from "@/components/admin-tabs";
import backgroundImage from "@assets/image_1749351216300.png";

type TabType = 
  | "dashboard"
  | "inbox" 
  | "calendar"
  | "934" 
  | "949" 
  | "rent-tracker"
  | "maintenance"

  | "contacts"
  | "inventory"
  | "todos"
  | "receipts";

export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["/api/admin/guests"],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/admin/announcements"],
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["/api/admin/calendar"],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/admin/contacts"],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/admin/inventory"],
  });

  const { data: todos = [] } = useQuery({
    queryKey: ["/api/admin/todos"],
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["/api/admin/receipts"],
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/buildings"],
  });

  // Calculate metrics
  const building934Rooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 10) : [];
  const building949Rooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 11) : [];
  const occupied934 = building934Rooms.filter((r: any) => r.status === 'occupied').length;
  const occupied949 = building949Rooms.filter((r: any) => r.status === 'occupied').length;
  const pendingInquiries = Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0;
  const urgentMaintenance = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.request?.priority === 'urgent').length : 0;
  
  // Calculate real earnings from payments and room occupancy
  const calculateEarnings = () => {
    let totalEarnings = 0;
    
    // Add revenue from payments
    if (Array.isArray(payments)) {
      totalEarnings += payments.reduce((sum: number, payment: any) => {
        return sum + (parseFloat(payment.amount) || 0);
      }, 0);
    }
    
    // Estimate monthly revenue from occupied rooms
    const occupiedRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'occupied') : [];
    const estimatedMonthlyRevenue = occupiedRooms.length * 1500; // Average rent per room
    
    return Math.max(totalEarnings, estimatedMonthlyRevenue);
  };

  const totalEarnings = calculateEarnings();

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Welcome Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Good morning!</h1>
            <p className="text-sm text-gray-600">Property overview</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>This month</option>
            <option>Last month</option>
            <option>Last week</option>
          </select>
          <Button 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white px-4 text-xs"
            onClick={() => {
              toast({
                title: "Analytics Coming Soon",
                description: "Advanced analytics dashboard will be available in the next update.",
              });
            }}
          >
            Analytics
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {/* In-House */}
        <Card 
          className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("934")}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">In-House Guests</h3>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-gray-500">Daily: <span className="font-semibold">{Array.isArray(guests) ? guests.filter((g: any) => g.checkInDate && new Date(g.checkInDate).toDateString() === new Date().toDateString()).length : 0}</span></div>
              <div className="text-xs text-gray-500">Total: <span className="font-semibold">{Array.isArray(guests) ? guests.length : 0}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Open Rooms */}
        <Card 
          className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("949")}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">Open Rooms</h3>
              <Home className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">934:</span>
                <span className="font-semibold">{occupied934}/{building934Rooms.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">949:</span>
                <span className="font-semibold">{occupied949}/{building949Rooms.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card 
          className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("rent-tracker")}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">Earnings</h3>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              ${Math.floor(totalEarnings).toLocaleString()}<span className="text-xs font-normal text-gray-500">.{String(Math.floor((totalEarnings % 1) * 100)).padStart(2, '0')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders */}
        <Card 
          className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("maintenance")}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">Work Orders</h3>
              <Wrench className={`h-4 w-4 ${urgentMaintenance > 0 ? 'text-red-500' : 'text-orange-500'}`} />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-gray-600">{Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0} Maintenance</div>
              <div className="text-xs text-gray-600">{Array.isArray(todos) ? todos.filter((t: any) => !t.completed).length : 0} Tasks</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Your next steps */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Your next steps</h2>
          <div className="space-y-2">
            <Card 
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("rent-tracker")}
            >
              <CardContent className="p-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-900">Rent Due: <span className="text-red-600">{Array.isArray(guests) ? guests.filter((g: any) => g.paymentStatus === 'overdue').length : 0}</span></h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("maintenance")}
            >
              <CardContent className="p-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Home className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-900">Housekeeping: <span className="text-orange-600">{Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.request?.category === 'housekeeping').length : 0}</span></h3>
                    <p className="text-xs text-gray-500">Out of Order: <span className="text-red-600">{Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'maintenance').length : 0}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("inbox")}
            >
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-900">Inquiries</h3>
                  <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5">
                    {pendingInquiries}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {Array.isArray(inquiries) && inquiries.slice(0, 2).map((inquiry: any, index: number) => (
                    <div key={inquiry.id || index} className="flex items-center space-x-2 p-1.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {inquiry.name ? inquiry.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{inquiry.name || 'Unknown Guest'}</p>
                        <p className="text-xs text-gray-500">{inquiry.status === 'pending' ? 'Pending' : 'Processed'}</p>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(inquiries) || inquiries.length === 0) && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500">No recent inquiries</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">Recent activity</h2>
            <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5">
              {pendingInquiries}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {/* Real Activity Items from Inquiries */}
            {Array.isArray(inquiries) && inquiries.slice(0, 3).map((inquiry: any, index: number) => (
              <Card key={inquiry.id || index} className="bg-white border border-gray-200">
                <CardContent className="p-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-semibold">
                      {inquiry.id || (index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xs font-medium text-gray-900 truncate">{inquiry.name || 'New Inquiry'}</h3>
                        <Badge variant="outline" className={`text-xs px-1 py-0 ${
                          inquiry.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {inquiry.status === 'pending' ? 'Pending' : 'Done'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{inquiry.email || 'No email provided'}</p>
                      <p className="text-xs text-gray-500 truncate">{inquiry.message || 'No message'}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-xs">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Real Activity Items from Maintenance Requests */}
            {Array.isArray(maintenanceRequests) && maintenanceRequests.slice(0, 1).map((request: any, index: number) => (
              <Card key={`maintenance-${request.id || index}`} className="bg-white border border-gray-200">
                <CardContent className="p-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded text-white flex items-center justify-center">
                      <Wrench className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xs font-medium text-gray-900 truncate">{request.request?.description || 'Maintenance Request'}</h3>
                        <Badge variant="outline" className={`text-xs px-1 py-0 ${
                          request.request?.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {request.request?.priority || 'Normal'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">Room {request.room?.number || 'Unknown'} - {request.building?.name || 'Unknown Building'}</p>
                      <p className="text-xs text-gray-500">Status: {request.request?.status || 'Pending'}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Wrench className="h-3 w-3" />
                      <span className="text-xs">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Show message if no activities */}
            {(!Array.isArray(inquiries) || inquiries.length === 0) && 
             (!Array.isArray(maintenanceRequests) || maintenanceRequests.length === 0) && (
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 text-center">
                  <Activity className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No Recent Activity</h3>
                  <p className="text-xs text-gray-600">New inquiries and maintenance requests will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === "dashboard") {
      return renderDashboard();
    }

    // Convert modern tab names to AdminTabs format
    const tabMapping: Record<TabType, string> = {
      "dashboard": "quick-access",
      "inbox": "inquiries", 
      "calendar": "calendar",
      "934": "934",
      "949": "949", 
      "rent-tracker": "payment-tracker",
      "maintenance": "maintenance",
      "contacts": "contacts",
      "inventory": "inventory",
      "todos": "todos",
      "receipts": "receipts"
    };

    const adminTabName = tabMapping[activeTab] || "quick-access";

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminTabs
          activeTab={adminTabName}
          setActiveTab={() => {}} // Read-only mode from modern dashboard
        />
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      {/* Main Content with Sidebar Space */}
      <div className="lg:ml-64">
        {/* Modern Top Navigation */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo and Search Bar */}
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">EasyStay</span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-48 pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative h-7 w-7 p-0">
                  <Bell className="h-4 w-4 text-gray-600" />
                  {pendingInquiries > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {pendingInquiries}
                      </span>
                    </span>
                  )}
                </Button>
              </div>

              {/* User Profile */}
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Enhanced with All Functions */}
          <div className="flex space-x-3 border-b border-gray-200 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab("inbox")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors relative whitespace-nowrap ${
                activeTab === "inbox"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Inbox
              {pendingInquiries > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full">
                  {pendingInquiries}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "calendar"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Calendar
            </button>

            <button
              onClick={() => setActiveTab("934")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "934"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              934
            </button>

            <button
              onClick={() => setActiveTab("949")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "949"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              949
            </button>

            <button
              onClick={() => setActiveTab("rent-tracker")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "rent-tracker"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rent Tracker
            </button>

            <button
              onClick={() => setActiveTab("maintenance")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "maintenance"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Maintenance
              {urgentMaintenance > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-orange-500 rounded-full">
                  {urgentMaintenance}
                </span>
              )}
            </button>

            <button
              onClick={() => window.location.href = '/public-editor'}
              className="pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Public Editor
            </button>

            <button
              onClick={() => setActiveTab("contacts")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "contacts"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contacts
              {Array.isArray(contacts) && contacts.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-teal-500 rounded-full">
                  {contacts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "inventory"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Inventory
              {Array.isArray(inventory) && inventory.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-amber-500 rounded-full">
                  {inventory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("todos")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "todos"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tasks
              {Array.isArray(todos) && todos.filter((t: any) => !t.completed).length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-violet-500 rounded-full">
                  {todos.filter((t: any) => !t.completed).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("receipts")}
              className={`pb-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "receipts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Receipts
              {Array.isArray(receipts) && receipts.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-500 rounded-full">
                  {receipts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="relative z-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}