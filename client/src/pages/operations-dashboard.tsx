import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, 
  Users, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
  Activity
} from "lucide-react";
import { format } from "date-fns";

export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch operational data
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/admin/tenants"],
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  // Calculate operational metrics
  const operationalMetrics = {
    totalRooms: Array.isArray(rooms) ? rooms.length : 0,
    occupiedRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'occupied').length : 0,
    availableRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'available').length : 0,
    maintenanceRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'maintenance').length : 0,
    pendingMaintenance: Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.request?.status === 'pending').length : 0,
    urgentMaintenance: Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.request?.priority === 'urgent').length : 0,
    completedMaintenance: Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.request?.status === 'completed').length : 0,
    activeTenants: Array.isArray(tenants) ? tenants.length : 0,
    pendingInquiries: Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0,
    overduePayments: Array.isArray(payments) ? payments.filter((p: any) => p.payment?.status === 'overdue').length : 0
  };

  const occupancyRate = operationalMetrics.totalRooms > 0 
    ? ((operationalMetrics.occupiedRooms / operationalMetrics.totalRooms) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
              <p className="text-gray-600">Real-time operational monitoring and management</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-green-600">{occupancyRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {operationalMetrics.occupiedRooms} of {operationalMetrics.totalRooms} rooms occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Maintenance</p>
                  <p className="text-3xl font-bold text-orange-600">{operationalMetrics.pendingMaintenance}</p>
                </div>
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {operationalMetrics.urgentMaintenance} urgent requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                  <p className="text-3xl font-bold text-blue-600">{operationalMetrics.activeTenants}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {operationalMetrics.pendingInquiries} pending inquiries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Issues</p>
                  <p className="text-3xl font-bold text-red-600">{operationalMetrics.overduePayments}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Overdue payments requiring attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Operational Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="rooms">Room Status</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Maintenance Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Recent Maintenance Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(maintenanceRequests) && maintenanceRequests.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.request?.description || 'Maintenance request'}</p>
                          <p className="text-xs text-gray-500">Room {item.room?.number || 'N/A'}</p>
                        </div>
                        <Badge variant={item.request?.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {item.request?.priority || 'normal'}
                        </Badge>
                      </div>
                    ))}
                    {(!Array.isArray(maintenanceRequests) || maintenanceRequests.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No maintenance requests</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Room Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Room Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Available</span>
                      </div>
                      <span className="font-medium">{operationalMetrics.availableRooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Occupied</span>
                      </div>
                      <span className="font-medium">{operationalMetrics.occupiedRooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Maintenance</span>
                      </div>
                      <span className="font-medium">{operationalMetrics.maintenanceRooms}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(maintenanceRequests) && maintenanceRequests.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{item.request?.description || 'Maintenance Request'}</h3>
                            <Badge variant={
                              item.request?.status === 'completed' ? 'default' :
                              item.request?.priority === 'urgent' ? 'destructive' : 'secondary'
                            }>
                              {item.request?.status || 'pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Room {item.room?.number || 'N/A'} - {item.request?.type || 'General'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Reported: {item.request?.createdAt ? format(new Date(item.request.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {item.request?.status !== 'completed' && (
                            <Button size="sm" variant="outline">
                              Update Status
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(maintenanceRequests) || maintenanceRequests.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No maintenance requests found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(rooms) && rooms.map((room: any) => (
                    <div key={room.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Room {room.number}</h3>
                        <Badge variant={
                          room.status === 'available' ? 'default' :
                          room.status === 'occupied' ? 'secondary' : 'destructive'
                        }>
                          {room.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Building {room.buildingId === 10 ? '934' : '949'}
                      </p>
                      {room.status === 'occupied' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tenant assigned
                        </p>
                      )}
                    </div>
                  ))}
                  {(!Array.isArray(rooms) || rooms.length === 0) && (
                    <p className="text-gray-500 text-center py-8 col-span-full">No rooms found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Operations Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-blue-700">Morning Tasks</h3>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Check overnight maintenance requests</li>
                      <li>• Review new inquiries and applications</li>
                      <li>• Verify room status and availability</li>
                      <li>• Process pending payments</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-medium text-green-700">Afternoon Tasks</h3>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Coordinate maintenance activities</li>
                      <li>• Follow up on tenant requests</li>
                      <li>• Update room status after cleanings</li>
                      <li>• Process new tenant applications</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-medium text-orange-700">Evening Tasks</h3>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Review daily occupancy report</li>
                      <li>• Close completed maintenance requests</li>
                      <li>• Prepare next day priority list</li>
                      <li>• Update financial records</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}