import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, User, Search, CheckCircle, Home, DollarSign, 
  Wrench, AlertTriangle, Calendar, Users, MessageSquare,
  TrendingUp, Activity, Clock, MapPin, Building, Mail, 
  Phone, Edit, Trash2, Plus, FileText, Package, LogOut,
  BarChart3, PieChart, LineChart, ArrowUpIcon, ArrowDownIcon,
  Shield, Brain, Zap, Eye, Settings, Filter, Download,
  Workflow, Target, Lightbulb, Award, Star, ChevronRight,
  Grid, List, RefreshCw, ExternalLink, Copy, Share,
  Calculator, Briefcase, CreditCard, Receipt
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function EnterpriseDashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [dateRange, setDateRange] = useState<string>("30d");
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    setLocation("/admin-login");
  };

  // Comprehensive data queries
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: buildings = [], isLoading: buildingsLoading } = useQuery({
    queryKey: ["/api/admin/buildings"],
  });

  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ["/api/admin/guests"],
  });

  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: financialSummary, isLoading: financialLoading } = useQuery({
    queryKey: ["/api/admin/financial/summary"],
  });

  const { data: occupancyAnalytics, isLoading: occupancyLoading } = useQuery({
    queryKey: ["/api/admin/analytics/occupancy"],
  });

  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery({
    queryKey: ["/api/admin/analytics/revenue"],
  });

  const { data: systemNotifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/admin/notifications"],
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/admin/vendors"],
  });

  const { data: leases = [], isLoading: leasesLoading } = useQuery({
    queryKey: ["/api/admin/leases"],
  });

  const { data: marketingCampaigns = [], isLoading: marketingLoading } = useQuery({
    queryKey: ["/api/admin/marketing/campaigns"],
  });

  // Calculate comprehensive stats
  const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
  const occupiedRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'occupied').length : 0;
  const availableRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'available').length : 0;
  const maintenanceRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'needs_cleaning' || r.status === 'out_of_service').length : 0;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  const activeGuests = Array.isArray(guests) ? guests.filter((g: any) => g.isActive && !g.hasMovedOut).length : 0;
  const pendingPayments = Array.isArray(guests) ? guests.filter((g: any) => g.paymentStatus === 'pending').length : 0;
  const overduePayments = Array.isArray(guests) ? guests.filter((g: any) => g.paymentStatus === 'overdue').length : 0;

  const pendingMaintenance = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.status === 'submitted').length : 0;
  const urgentMaintenanceCount = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.priority === 'urgent').length : 0;

  const newInquiries = Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'new').length : 0;
  const monthlyRevenue = (financialSummary as any)?.thisMonthRevenue || 0;
  const monthlyExpenses = (financialSummary as any)?.thisMonthExpenses || 0;
  const netIncome = monthlyRevenue - monthlyExpenses;

  const unreadNotifications = Array.isArray(systemNotifications) ? systemNotifications.filter((n: any) => !n.isRead).length : 0;
  const urgentNotifications = Array.isArray(systemNotifications) ? systemNotifications.filter((n: any) => n.priority === 'urgent' && !n.isRead).length : 0;

  // Generate sample data for charts
  const revenueData = [
    { name: 'Jan', revenue: 45000, expenses: 32000 },
    { name: 'Feb', revenue: 52000, expenses: 28000 },
    { name: 'Mar', revenue: 47000, expenses: 31000 },
    { name: 'Apr', revenue: 61000, expenses: 35000 },
    { name: 'May', revenue: 55000, expenses: 33000 },
    { name: 'Jun', revenue: monthlyRevenue, expenses: monthlyExpenses },
  ];

  const occupancyData = [
    { name: 'Occupied', value: occupiedRooms, color: '#00C49F' },
    { name: 'Available', value: availableRooms, color: '#0088FE' },
    { name: 'Maintenance', value: maintenanceRooms, color: '#FFBB28' },
  ];

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Key Metrics Cards */}
      <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Total Revenue</span>
              <DollarSign className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-blue-100">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Occupancy Rate</span>
              <Home className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-green-100">{occupiedRooms}/{totalRooms} rooms</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Active Guests</span>
              <Users className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGuests}</div>
            <p className="text-xs text-purple-100">{pendingPayments} pending payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Maintenance</span>
              <Wrench className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
            <p className="text-xs text-orange-100">{urgentMaintenanceCount} urgent</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revenue & Expenses</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                <Area type="monotone" dataKey="expenses" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Breakdown */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Room Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activity</span>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(systemNotifications) && systemNotifications.slice(0, 5).map((notification: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${notification.priority === 'urgent' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Bell className={`h-4 w-4 ${notification.priority === 'urgent' ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.createdAt ? format(new Date(notification.createdAt), 'MMM d, HH:mm') : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
              {(!Array.isArray(systemNotifications) || systemNotifications.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Add Guest
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Wrench className="h-6 w-6 mb-2" />
                Maintenance
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MessageSquare className="h-6 w-6 mb-2" />
                Send Notice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Properties Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(buildings) && buildings.map((building: any, index: number) => (
                <Card key={index} className="border-2 hover:border-blue-300 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{building.name}</span>
                      <Building className="h-5 w-5 text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{building.address}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rooms: {Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === building.id).length : 0}</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!Array.isArray(buildings) || buildings.length === 0) && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No buildings found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Property Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Buildings</span>
                <span className="font-semibold">{Array.isArray(buildings) ? buildings.length : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Rooms</span>
                <span className="font-semibold">{totalRooms}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Occupied</span>
                <span className="font-semibold text-green-600">{occupiedRooms}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-semibold text-blue-600">{availableRooms}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="font-semibold text-orange-600">{maintenanceRooms}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Financial KPIs */}
      <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Revenue</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Expenses</span>
              <Calculator className="h-5 w-5 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${monthlyExpenses.toLocaleString()}</div>
            <p className="text-sm text-gray-600">-5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Net Income</span>
              <Briefcase className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${netIncome.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Profit margin: {monthlyRevenue > 0 ? ((netIncome / monthlyRevenue) * 100).toFixed(1) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Chart */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
                <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <Badge variant="secondary">{pendingPayments}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue</span>
                <Badge variant="destructive">{overduePayments}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Collected</span>
                <Badge variant="default">{Array.isArray(payments) ? payments.filter((p: any) => p.status === 'completed').length : 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">EasyStay HI</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Enterprise Dashboard
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </div>
            
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Admin
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden lg:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span className="hidden lg:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden lg:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Guests</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden lg:inline">Maintenance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            {renderPropertiesTab()}
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            {renderFinancialTab()}
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Guest Management</h3>
              <p className="text-gray-600">Comprehensive guest management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance Center</h3>
              <p className="text-gray-600">Advanced maintenance management features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}