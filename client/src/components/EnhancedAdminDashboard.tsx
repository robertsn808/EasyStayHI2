import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RoomRecommendationSystem from "./RoomRecommendationSystem";
import BugReportSystem from "./BugReportSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Building2,
  Users,
  MessageSquare,
  Wrench,
  DollarSign,
  Calendar,
  Settings,
  LogOut,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Brain,
  AlertCircle,
  TrendingUp,
  Home,
  Phone,
  Mail,
  MapPin,
  Star,
  X,
  MoreHorizontal
} from "lucide-react";

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  pendingInquiries: number;
  activeMaintenanceRequests: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

interface Room {
  id: number;
  number: string;
  building: string;
  status: string;
  tenant?: string;
  rent: number;
  lastPayment?: string;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  status: string;
  message: string;
  createdAt: string;
}

interface MaintenanceRequest {
  id: number;
  roomNumber: string;
  tenant: string;
  issue: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roomNumber?: string;
  status: string;
  leaseStart?: string;
  leaseEnd?: string;
  monthlyRent?: number;
  createdAt: string;
}

export default function EnhancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddTenantDialog, setShowAddTenantDialog] = useState(false);
  const [tenantForm, setTenantForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roomId: "",
    monthlyRent: "",
    leaseStart: "",
    leaseEnd: ""
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get admin token for authentication
  const adminToken = localStorage.getItem('admin-token') || 'admin-authenticated';

  // Dashboard statistics
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
    meta: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  });

  // Rooms data
  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/admin/rooms"],
    meta: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  });

  // Inquiries data
  const { data: inquiries = [] } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
    meta: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  });

  // Maintenance requests
  const { data: maintenanceRequests = [] } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/admin/maintenance"],
    meta: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  });

  // Tenants data
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ["/api/admin/tenants"],
    meta: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  });

  // Update inquiry status mutation
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/inquiries/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({
        title: "Status Updated",
        description: "Inquiry status has been updated successfully.",
      });
    },
  });

  // Update maintenance request mutation
  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/maintenance/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/maintenance"] });
      toast({
        title: "Status Updated",
        description: "Maintenance request status has been updated successfully.",
      });
    },
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: any) => {
      console.log("Submitting tenant data:", tenantData);
      const response = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify(tenantData),
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(`Failed to create tenant: ${errorData}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rooms"] });
      setShowAddTenantDialog(false);
      setTenantForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        roomId: "",
        monthlyRent: "",
        leaseStart: "",
        leaseEnd: ""
      });
      toast({
        title: "Tenant Added",
        description: "New tenant has been successfully added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tenant",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated');
    localStorage.removeItem('admin-token');
    window.location.href = '/admin-login';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMaintenance = maintenanceRequests.filter(request => {
    const matchesSearch = request.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">EasyStay HI</h1>
                <p className="text-sm text-gray-500">Property Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm h-screen sticky top-0 border-r">
          <div className="p-4">
            <div className="space-y-2">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
              >
                <Home className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === "rooms" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("rooms")}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Rooms
              </Button>
              <Button
                variant={activeTab === "inquiries" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("inquiries")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Inquiries
                {inquiries.filter(i => i.status === 'new').length > 0 && (
                  <Badge className="ml-auto bg-red-500">
                    {inquiries.filter(i => i.status === 'new').length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === "tenants" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("tenants")}
              >
                <Users className="w-4 h-4 mr-2" />
                Tenants
              </Button>
              <Button
                variant={activeTab === "maintenance" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("maintenance")}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Maintenance
                {maintenanceRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge className="ml-auto bg-orange-500">
                    {maintenanceRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === "payments" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("payments")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Payments
              </Button>
              <Button
                variant={activeTab === "calendar" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("calendar")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={activeTab === "recommendations" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("recommendations")}
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Recommendations
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalRooms || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.occupiedRooms || 0} occupied
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.occupancyRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      +2.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'new').length}</div>
                    <p className="text-xs text-muted-foreground">
                      Requires attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats?.monthlyRevenue?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +5.2% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions {showAddTenantDialog ? "(Dialog Open)" : "(Dialog Closed)"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div 
                    className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-md text-sm font-medium transition-colors cursor-pointer"
                    onClick={() => {
                      console.log("Button clicked - setting dialog to true");
                      setShowAddTenantDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Tenant
                  </div>
                  <Button className="w-full justify-start" variant="outline">
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Inquiries</CardTitle>
                    <CardDescription>Latest property inquiries from potential tenants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inquiries.slice(0, 5).map((inquiry) => (
                        <div key={inquiry.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{inquiry.name}</p>
                              <p className="text-xs text-gray-500">{inquiry.inquiryType}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Requests</CardTitle>
                    <CardDescription>Active maintenance requests requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {maintenanceRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getPriorityIcon(request.priority)}
                            <div>
                              <p className="font-medium text-sm">Room {request.roomNumber}</p>
                              <p className="text-xs text-gray-500">{request.issue}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Property Inquiries</h2>
                  <p className="text-gray-600">Manage and respond to tenant inquiries</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search inquiries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inquiries List */}
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => (
                  <Card key={inquiry.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">{inquiry.name}</h3>
                            <Badge className={getStatusColor(inquiry.status)}>
                              {inquiry.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{inquiry.email}</span>
                            </div>
                            {inquiry.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{inquiry.phone}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700">{inquiry.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(inquiry.createdAt).toLocaleDateString()} • {inquiry.inquiryType}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Select
                            value={inquiry.status}
                            onValueChange={(status) => updateInquiryMutation.mutate({ id: inquiry.id, status })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Maintenance Requests</h2>
                  <p className="text-gray-600">Track and manage property maintenance</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search maintenance requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Maintenance Requests List */}
              <div className="space-y-4">
                {filteredMaintenance.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            {getPriorityIcon(request.priority)}
                            <h3 className="font-semibold text-lg">Room {request.roomNumber}</h3>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600">Tenant: {request.tenant}</p>
                          <p className="text-gray-700">{request.issue}</p>
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Select
                            value={request.status}
                            onValueChange={(status) => updateMaintenanceMutation.mutate({ id: request.id, status })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
                  <p className="text-gray-600">Overview of all rooms and occupancy status</p>
                </div>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">Room {room.number}</h3>
                            <p className="text-gray-600">{room.building}</p>
                          </div>
                          <Badge className={getStatusColor(room.status)}>
                            {room.status}
                          </Badge>
                        </div>
                        
                        {room.tenant && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Current Tenant</p>
                            <p className="text-gray-600">{room.tenant}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Monthly Rent</p>
                            <p className="text-lg font-semibold">${room.rent}</p>
                          </div>
                          {room.lastPayment && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-700">Last Payment</p>
                              <p className="text-sm text-gray-600">{room.lastPayment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tenants" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
                  <p className="text-gray-600">Manage tenant information and room assignments</p>
                </div>
                <Button onClick={() => {
                  console.log("Tenants tab Add New Tenant button clicked");
                  setShowAddTenantDialog(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Tenant
                </Button>
              </div>

              {/* Tenants List */}
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <Card key={tenant.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">
                              {tenant.firstName} {tenant.lastName}
                            </h3>
                            <Badge className={getStatusColor(tenant.status)}>
                              {tenant.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{tenant.email}</span>
                            </div>
                            {tenant.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{tenant.phone}</span>
                              </div>
                            )}
                            {tenant.roomNumber && (
                              <div className="flex items-center space-x-1">
                                <Home className="w-4 h-4" />
                                <span>Room {tenant.roomNumber}</span>
                              </div>
                            )}
                          </div>
                          {tenant.monthlyRent && (
                            <p className="text-sm text-gray-600">
                              Monthly Rent: ${tenant.monthlyRent}
                            </p>
                          )}
                          {tenant.leaseStart && tenant.leaseEnd && (
                            <p className="text-xs text-gray-500">
                              Lease: {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tenants.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No Tenants Yet</h3>
                        <p className="text-gray-600">Get started by adding your first tenant to the system.</p>
                        <Button onClick={() => setShowAddTenantDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Tenant
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-6">
              <RoomRecommendationSystem />
            </div>
          )}

          {(activeTab === "payments" || activeTab === "calendar" || activeTab === "settings") && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      {activeTab === "payments" && <DollarSign className="w-8 h-8 text-gray-400" />}
                      {activeTab === "calendar" && <Calendar className="w-8 h-8 text-gray-400" />}
                      {activeTab === "settings" && <Settings className="w-8 h-8 text-gray-400" />}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">{activeTab} Module</h3>
                    <p className="text-gray-600">This section is under development and will be available soon.</p>
                    <Button variant="outline">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Add New Tenant Modal */}
      {showAddTenantDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Tenant</h2>
              <button 
                onClick={() => setShowAddTenantDialog(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">Enter tenant details and assign to a room</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                firstName: tenantForm.firstName,
                lastName: tenantForm.lastName,
                email: tenantForm.email,
                phone: tenantForm.phone,
                roomId: tenantForm.roomId ? parseInt(tenantForm.roomId) : null,
                monthlyRent: tenantForm.monthlyRent ? parseFloat(tenantForm.monthlyRent) : null,
                leaseStart: tenantForm.leaseStart || null,
                leaseEnd: tenantForm.leaseEnd || null
              };
              createTenantMutation.mutate(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    value={tenantForm.firstName}
                    onChange={(e) => setTenantForm({...tenantForm, firstName: e.target.value})}
                    placeholder="John"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={tenantForm.lastName}
                    onChange={(e) => setTenantForm({...tenantForm, lastName: e.target.value})}
                    placeholder="Doe"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={tenantForm.email}
                  onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})}
                  placeholder="john.doe@example.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={tenantForm.phone}
                  onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})}
                  placeholder="(808) 555-0123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Room *</label>
                <select 
                  value={tenantForm.roomId} 
                  onChange={(e) => setTenantForm({...tenantForm, roomId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a room</option>
                  {(rooms || []).filter(room => room.status === 'available').map((room: any) => (
                    <option key={room.id} value={room.id.toString()}>
                      Room {room.number} - {room.size} (${room.rentalRate}/month)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Rent *</label>
                <input
                  type="number"
                  step="0.01"
                  value={tenantForm.monthlyRent}
                  onChange={(e) => setTenantForm({...tenantForm, monthlyRent: e.target.value})}
                  placeholder="1200.00"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lease Start</label>
                  <input
                    type="date"
                    value={tenantForm.leaseStart}
                    onChange={(e) => setTenantForm({...tenantForm, leaseStart: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lease End</label>
                  <input
                    type="date"
                    value={tenantForm.leaseEnd}
                    onChange={(e) => setTenantForm({...tenantForm, leaseEnd: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddTenantDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createTenantMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createTenantMutation.isPending ? "Adding..." : "Add Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bug Report System */}
      <BugReportSystem />
    </div>
  );
}