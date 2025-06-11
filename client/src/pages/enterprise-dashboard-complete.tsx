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
  Calculator, Briefcase, CreditCard, Receipt
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
      const total = propertyRooms.length;
      const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
      const avgRent = propertyRooms.length > 0 
        ? propertyRooms.reduce((sum: number, room: any) => sum + (room.rentalRate || 0), 0) / propertyRooms.length 
        : 0;
      
      return { total, occupied, available, maintenance, occupancyRate, avgRent, rooms: propertyRooms };
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
                      <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
                      <p className="text-xs text-muted-foreground">Maintenance</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <p className="text-xs text-muted-foreground">Total Units</p>
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
                    
                    {/* Visual Room Status Grid */}
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {stats.rooms.map((room: any) => (
                        <div 
                          key={room.id} 
                          className={`
                            relative p-2 rounded-lg border-2 text-center text-xs font-medium cursor-pointer
                            ${room.status === 'occupied' ? 'bg-red-100 border-red-300 text-red-800' :
                              room.status === 'available' ? 'bg-green-100 border-green-300 text-green-800' :
                              room.status === 'maintenance' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                              'bg-gray-100 border-gray-300 text-gray-800'
                            }
                          `}
                          title={`Room ${room.number} - ${room.status} - $${room.rentalRate}/month`}
                        >
                          <div className="font-bold">{room.number}</div>
                          <div className="text-[10px] mt-1">
                            {room.status === 'occupied' ? '🔴' :
                             room.status === 'available' ? '🟢' :
                             room.status === 'maintenance' ? '🟡' : '⚪'}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Room Status Legend */}
                    <div className="flex justify-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                        <span>Occupied</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
                        <span>Maintenance</span>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">EasyStay HI</h1>
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}