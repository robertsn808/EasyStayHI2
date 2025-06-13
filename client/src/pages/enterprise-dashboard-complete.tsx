import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Calculator, Briefcase, CreditCard, Receipt, Menu, X,
  Megaphone
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie } from "recharts";

type TabType = 
  | "dashboard"
  | "analytics" 
  | "financial"
  | "properties"
  | "guests"
  | "maintenance"
  | "operations"
  | "marketing"
  | "security"
  | "reports"
  | "add-room";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function EnterpriseDashboardComplete() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [newRoomForm, setNewRoomForm] = useState({
    number: "",
    buildingId: "",
    status: "available",
    size: "studio",
    floor: "1",
    rentalRate: "",
    rentalPeriod: "monthly",
    accessPin: ""
  });

  const [editingProperty, setEditingProperty] = useState<{id: number, name: string} | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation('/admin-login');
  };

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('admin-authenticated');
    if (!token) {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  // API Data Fetching with proper authentication
  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/admin/buildings"],
    queryFn: async () => {
      const response = await fetch('/api/admin/buildings', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch buildings');
      return response.json();
    }
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/admin/rooms"],
    queryFn: async () => {
      const response = await fetch('/api/admin/rooms', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return response.json();
    }
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/admin/tenants"],
    queryFn: async () => {
      const response = await fetch('/api/admin/tenants', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
    queryFn: async () => {
      const response = await fetch('/api/admin/payments', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    }
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"],
    queryFn: async () => {
      const response = await fetch('/api/admin/maintenance', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch maintenance requests');
      return response.json();
    }
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
    queryFn: async () => {
      const response = await fetch('/api/admin/inquiries', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch inquiries');
      return response.json();
    }
  });

  const { data: financialSummary = {} } = useQuery({
    queryKey: ["/api/admin/financial/summary"],
    queryFn: async () => {
      const response = await fetch('/api/admin/financial/summary', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      return response.json();
    }
  });

  const { data: occupancyData = {} } = useQuery({
    queryKey: ["/api/admin/analytics/occupancy"],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/occupancy', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch occupancy data');
      return response.json();
    }
  });

  // Calculate comprehensive stats
  const roomsArray = Array.isArray(rooms) ? rooms : [];
  const totalRooms = roomsArray.length;
  const occupiedRooms = roomsArray.filter((r: any) => r.status === 'occupied').length;
  const availableRooms = roomsArray.filter((r: any) => r.status === 'available').length;
  const maintenanceRooms = roomsArray.filter((r: any) => r.status === 'needs_cleaning' || r.status === 'out_of_service').length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  const tenantsArray = Array.isArray(tenants) ? tenants : [];
  const activeTenants = tenantsArray.filter((t: any) => t.status === 'active').length;
  
  const maintenanceArray = Array.isArray(maintenanceRequests) ? maintenanceRequests : [];
  const pendingMaintenance = maintenanceArray.filter((m: any) => m.status === 'submitted').length;
  const urgentMaintenanceCount = maintenanceArray.filter((m: any) => m.priority === 'urgent').length;

  const inquiriesArray = Array.isArray(inquiries) ? inquiries : [];
  const newInquiries = inquiriesArray.filter((i: any) => i.status === 'new').length;
  
  const monthlyRevenue = (financialSummary as any)?.thisMonthRevenue || 0;
  const monthlyExpenses = (financialSummary as any)?.thisMonthExpenses || 0;
  const netIncome = monthlyRevenue - monthlyExpenses;

  // Property name update mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (data: {id: number, name: string}) => {
      const response = await fetch(`/api/admin/buildings/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify({ name: data.name })
      });
      if (!response.ok) throw new Error('Failed to update property name');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buildings"] });
      setEditingProperty(null);
      toast({
        title: "Property name updated",
        description: "The property name has been successfully changed"
      });
    },
    onError: () => {
      toast({
        title: "Failed to update property name",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(roomData)
      });
      if (!response.ok) throw new Error('Failed to add room');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/occupancy"] });
      setNewRoomForm({
        number: "",
        buildingId: "",
        status: "available",
        size: "studio",
        floor: "1",
        rentalRate: "",
        rentalPeriod: "monthly",
        accessPin: ""
      });
      setActiveTab("properties");
      toast({
        title: "Room added successfully",
        description: "The new room has been added to the property"
      });
    },
    onError: () => {
      toast({
        title: "Failed to add room",
        description: "Please check the room details and try again",
        variant: "destructive"
      });
    }
  });

  const handleAddRoom = () => {
    if (newRoomForm.number && newRoomForm.buildingId && newRoomForm.rentalRate) {
      addRoomMutation.mutate({
        number: newRoomForm.number,
        buildingId: parseInt(newRoomForm.buildingId),
        status: newRoomForm.status,
        size: newRoomForm.size,
        floor: parseInt(newRoomForm.floor),
        rentalRate: parseFloat(newRoomForm.rentalRate),
        rentalPeriod: newRoomForm.rentalPeriod,
        accessPin: newRoomForm.accessPin || Math.floor(1000 + Math.random() * 9000).toString()
      });
    }
  };

  // Room status change mutation
  const updateRoomStatusMutation = useMutation({
    mutationFn: async (data: {id: number, status: string}) => {
      const response = await fetch(`/api/admin/rooms/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify({ 
          status: data.status,
          lastCleaned: data.status === 'available' ? new Date().toISOString().split('T')[0] : undefined
        })
      });
      if (!response.ok) throw new Error('Failed to update room status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/occupancy"] });
      toast({
        title: "Room status updated",
        description: "The room status has been successfully changed"
      });
    },
    onError: () => {
      toast({
        title: "Failed to update room status",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleRoomStatusChange = (roomId: number, currentStatus: string) => {
    let nextStatus = '';
    switch (currentStatus) {
      case 'occupied':
        nextStatus = 'needs_cleaning';
        break;
      case 'needs_cleaning':
        nextStatus = 'available';
        break;
      case 'available':
        nextStatus = 'needs_cleaning';
        break;
      case 'maintenance':
        nextStatus = 'available';
        break;
      default:
        nextStatus = 'available';
    }
    updateRoomStatusMutation.mutate({ id: roomId, status: nextStatus });
  };

  const renderAddRoomTab = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline"
          onClick={() => setActiveTab("properties")}
        >
          ← Back to Properties
        </Button>
        <h2 className="text-2xl font-bold">Add New Room</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Property</label>
              <Select onValueChange={(value) => setNewRoomForm(prev => ({ ...prev, buildingId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(buildings) && buildings.map((building: any) => (
                    <SelectItem key={building.id} value={building.id.toString()}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Room Number</label>
              <Input
                placeholder="e.g., 301"
                value={newRoomForm.number}
                onChange={(e) => setNewRoomForm(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Room Type</label>
              <Select onValueChange={(value) => setNewRoomForm(prev => ({ ...prev, size: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1bed">1 Bedroom</SelectItem>
                  <SelectItem value="2bed">2 Bedroom</SelectItem>
                  <SelectItem value="3bed">3 Bedroom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Floor</label>
              <Input
                type="number"
                placeholder="Floor number"
                value={newRoomForm.floor}
                onChange={(e) => setNewRoomForm(prev => ({ ...prev, floor: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Monthly Rent</label>
              <Input
                type="number"
                placeholder="e.g., 2400"
                value={newRoomForm.rentalRate}
                onChange={(e) => setNewRoomForm(prev => ({ ...prev, rentalRate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select onValueChange={(value) => setNewRoomForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Room status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="needs_cleaning">Needs Cleaning</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Access PIN (Optional)</label>
              <Input
                placeholder="4-digit PIN (auto-generated if empty)"
                maxLength={4}
                value={newRoomForm.accessPin}
                onChange={(e) => setNewRoomForm(prev => ({ ...prev, accessPin: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rental Period</label>
              <Select onValueChange={(value) => setNewRoomForm(prev => ({ ...prev, rentalPeriod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Rental period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="outline"
              onClick={() => setActiveTab("properties")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRoom}
              disabled={addRoomMutation.isPending || !newRoomForm.number || !newRoomForm.buildingId || !newRoomForm.rentalRate}
            >
              {addRoomMutation.isPending ? "Adding..." : "Add Room"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(buildings) ? buildings.length : 0}</div>
            <p className="text-xs text-muted-foreground">Active buildings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{occupiedRooms} of {totalRooms} rooms</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Issues</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">{urgentMaintenanceCount} urgent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New tenant moved in</p>
                <p className="text-xs text-muted-foreground">Room 101 - John Smith</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Maintenance request</p>
                <p className="text-xs text-muted-foreground">AC repair needed in Room 203</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">$1,800 rent payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Tenant
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Wrench className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={[
                  { month: 'Jan', occupancy: 85 },
                  { month: 'Feb', occupancy: 88 },
                  { month: 'Mar', occupancy: 92 },
                  { month: 'Apr', occupancy: 89 },
                  { month: 'May', occupancy: 95 },
                  { month: 'Jun', occupancy: occupancyRate }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="occupancy" stroke="#8884d8" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Room Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie 
                    data={[
                      { name: 'Occupied', value: occupiedRooms },
                      { name: 'Available', value: availableRooms },
                      { name: 'Maintenance', value: maintenanceRooms }
                    ]}
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Occupied', value: occupiedRooms },
                      { name: 'Available', value: availableRooms },
                      { name: 'Maintenance', value: maintenanceRooms }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${monthlyExpenses.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: 'Rent', amount: monthlyRevenue * 0.85 },
                { category: 'Utilities', amount: monthlyRevenue * 0.10 },
                { category: 'Fees', amount: monthlyRevenue * 0.05 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPropertiesTab = () => {
    const buildingsArray = Array.isArray(buildings) ? buildings : [];
    
    // Calculate property-specific metrics
    const getPropertyStats = (buildingId: number) => {
      const propertyRooms = roomsArray.filter((r: any) => r.buildingId === buildingId);
      const occupied = propertyRooms.filter((r: any) => r.status === 'occupied').length;
      const available = propertyRooms.filter((r: any) => r.status === 'available').length;
      const maintenance = propertyRooms.filter((r: any) => r.status === 'maintenance').length;
      const needsCleaning = propertyRooms.filter((r: any) => r.status === 'needs_cleaning').length;
      const total = propertyRooms.length;
      const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
      const avgRent = propertyRooms.length > 0 
        ? propertyRooms.reduce((sum: number, room: any) => sum + (room.rentalRate || 0), 0) / propertyRooms.length 
        : 0;
      
      return { total, occupied, available, maintenance, needsCleaning, occupancyRate, avgRent, rooms: propertyRooms };
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {buildingsArray.map((building: any) => {
            const stats = getPropertyStats(building.id);
            return (
              <Card key={building.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex items-center justify-between">
                    {editingProperty?.id === building.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          value={editingProperty?.name || ''}
                          onChange={(e) => setEditingProperty(prev => prev ? {...prev, name: e.target.value} : null)}
                          className="text-xl font-semibold"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => editingProperty && updatePropertyMutation.mutate({id: building.id, name: editingProperty.name})}
                          disabled={updatePropertyMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingProperty(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <CardTitle className="text-xl">{building.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{building.address}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingProperty({id: building.id, name: building.name})}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.occupied}</div>
                      <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.needsCleaning}</div>
                      <p className="text-xs text-muted-foreground">Needs Cleaning</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
                      <p className="text-xs text-muted-foreground">Maintenance</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Occupancy Rate</span>
                      <span className="text-sm font-bold">{stats.occupancyRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${stats.occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Rent</span>
                    <span className="text-lg font-bold text-green-600">
                      ${stats.avgRent.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Room Status Grid</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setActiveTab("add-room")}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Room
                      </Button>
                    </div>
                    
                    {/* Visual Room Status Grid with Animations */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {stats.rooms.map((room: any, index: number) => (
                        <div 
                          key={room.id} 
                          className={`
                            relative p-3 rounded-xl border-2 text-center text-sm font-medium cursor-pointer 
                            transform hover:scale-105 transition-all duration-300 hover:shadow-lg
                            animate-in slide-in-from-bottom duration-500
                            ${room.status === 'occupied' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-800 hover:from-red-100 hover:to-red-200' :
                              room.status === 'available' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-800 hover:from-green-100 hover:to-green-200' :
                              room.status === 'needs_cleaning' ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300 text-orange-800 hover:from-orange-100 hover:to-orange-200' :
                              room.status === 'out_of_service' ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-800 hover:from-gray-100 hover:to-gray-200' :
                              'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800 hover:from-yellow-100 hover:to-yellow-200'
                            }
                          `}
                          title={`Room ${room.number} - ${room.status.replace('_', ' ')} - $${room.rental_rate || room.rentalRate}/month`}
                          onClick={() => handleRoomStatusChange && handleRoomStatusChange(room.id, room.status)}
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          {/* Animated Status Indicator */}
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse">
                            {room.status === 'occupied' && <div className="w-full h-full bg-red-500 rounded-full animate-ping absolute"></div>}
                            {room.status === 'available' && <div className="w-full h-full bg-green-500 rounded-full animate-pulse absolute"></div>}
                            {room.status === 'needs_cleaning' && <div className="w-full h-full bg-orange-500 rounded-full animate-bounce absolute"></div>}
                            {room.status === 'out_of_service' && <div className="w-full h-full bg-gray-500 rounded-full animate-pulse absolute"></div>}
                          </div>
                          
                          <div className="font-bold text-lg mb-1">{room.number}</div>
                          
                          {/* Status Icon with Animation */}
                          <div className="text-2xl mb-2">
                            {room.status === 'occupied' && <span className="animate-pulse">🔴</span>}
                            {room.status === 'available' && <span className="animate-bounce">🟢</span>}
                            {room.status === 'needs_cleaning' && <span className="animate-spin">🧹</span>}
                            {room.status === 'out_of_service' && <span className="animate-pulse">⚠️</span>}
                          </div>
                          
                          {/* Status Text */}
                          <div className="text-xs capitalize font-medium">
                            {room.status.replace('_', ' ')}
                          </div>
                          
                          {/* Rent Amount */}
                          <div className="text-xs text-gray-600 mt-1">
                            ${room.rental_rate || room.rentalRate}/mo
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Enhanced Room Status Legend */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center">
                          <span className="text-xs">🟢</span>
                        </div>
                        <span className="font-medium">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center">
                          <span className="text-xs">🔴</span>
                        </div>
                        <span className="font-medium">Occupied</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded-lg flex items-center justify-center">
                          <span className="text-xs">🧹</span>
                        </div>
                        <span className="font-medium">Needs Cleaning</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-xs">⚠️</span>
                        </div>
                        <span className="font-medium">Out of Service</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{occupiedRooms}</div>
                <p className="text-sm text-muted-foreground">Total Occupied</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{availableRooms}</div>
                <p className="text-sm text-muted-foreground">Total Available</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{maintenanceRooms}</div>
                <p className="text-sm text-muted-foreground">Under Maintenance</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{totalRooms}</div>
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGuestsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTenants}</div>
            <p className="text-sm text-muted-foreground">Currently residing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>New Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{newInquiries}</div>
            <p className="text-sm text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{occupancyRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Current occupancy</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingMaintenance}</div>
            <p className="text-sm text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Urgent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{urgentMaintenanceCount}</div>
            <p className="text-sm text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'financial':
        return renderFinancialTab();
      case 'properties':
        return renderPropertiesTab();
      case 'guests':
        return renderGuestsTab();
      case 'maintenance':
        return renderMaintenanceTab();
      case 'add-room':
        return renderAddRoomTab();
      default:
        return renderDashboardTab();
    }
  };

  const sideMenuItems = [
    { key: "operations", label: "Operations", icon: Workflow },
    { key: "maintenance", label: "Maintenance", icon: Wrench },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "financial", label: "Financial", icon: DollarSign },
    { key: "marketing", label: "Marketing", icon: Megaphone },
    { key: "security", label: "Security", icon: Shield },
    { key: "reports", label: "Reports", icon: FileText },
    { key: "add-room", label: "Add Room", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Expandable Side Menu */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${sideMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out bg-white shadow-lg border-r w-64`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSideMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {sideMenuItems.map((item) => (
            <Button
              key={item.key}
              variant={activeTab === item.key ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab(item.key as TabType);
                setSideMenuOpen(false);
              }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sideMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSideMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSideMenuOpen(true)}
                  className="mr-4"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Building className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">EasyStay HI</h1>
                  <p className="text-sm text-gray-500">Property Management System</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Only show tabs for dashboard, inquiries, and properties */}
          {(activeTab === "dashboard" || activeTab === "guests" || activeTab === "properties") ? (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="guests">Inquiries</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {renderContent()}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="mt-6">
              {renderContent()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}