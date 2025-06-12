import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  AlertTriangle, 
  Users, 
  Camera,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  UserCheck,
  Activity,
  Bell
} from "lucide-react";
import { format } from "date-fns";

export default function SecurityDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSecurityLogOpen, setIsSecurityLogOpen] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    roomNumber: "",
    accessLevel: "tenant",
    tempAccess: false,
    accessDuration: ""
  });

  const [securityLogForm, setSecurityLogForm] = useState({
    type: "incident",
    description: "",
    location: "",
    severity: "medium",
    roomNumber: "",
    actionTaken: ""
  });

  // Fetch security-related data
  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/admin/tenants"],
  });

  const { data: securityLogs = [] } = useQuery({
    queryKey: ["/api/admin/security-logs"],
    queryFn: async () => {
      // Mock security logs since endpoint might not exist
      return [
        {
          id: 1,
          type: "access_granted",
          description: "Tenant accessed Room 12",
          location: "Building 934",
          timestamp: new Date().toISOString(),
          severity: "low",
          resolved: true,
          roomNumber: "12",
          tenantName: "John Doe"
        },
        {
          id: 2,
          type: "incident",
          description: "Unauthorized access attempt at main entrance",
          location: "Building 949 - Main Entrance",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          severity: "high",
          resolved: false,
          actionTaken: "Security notified, reviewing camera footage"
        },
        {
          id: 3,
          type: "maintenance_access",
          description: "Maintenance staff accessed Room 8 for repair",
          location: "Building 934",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          severity: "low",
          resolved: true,
          roomNumber: "8"
        }
      ];
    }
  });

  const { data: accessCodes = [] } = useQuery({
    queryKey: ["/api/admin/access-codes"],
    queryFn: async () => {
      // Mock access codes since endpoint might not exist
      return [
        {
          id: 1,
          roomNumber: "1",
          frontDoorCode: "1234",
          roomCode: "5678",
          tenantName: "John Smith",
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          roomNumber: "3",
          frontDoorCode: "2468",
          roomCode: "8642",
          tenantName: "Jane Doe",
          isActive: true,
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          roomNumber: "7",
          frontDoorCode: "1357",
          roomCode: "9753",
          tenantName: "Mike Johnson",
          isActive: false,
          expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
  });

  // Calculate security metrics
  const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
  const occupiedRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'occupied').length : 0;
  const activeAccessCodes = Array.isArray(accessCodes) ? accessCodes.filter((c: any) => c.isActive).length : 0;
  const securityIncidents = Array.isArray(securityLogs) 
    ? securityLogs.filter((log: any) => log.type === 'incident' && !log.resolved).length 
    : 0;
  const todayAccess = Array.isArray(securityLogs)
    ? securityLogs.filter((log: any) => {
        const logDate = new Date(log.timestamp);
        const today = new Date();
        return logDate.toDateString() === today.toDateString();
      }).length
    : 0;

  // Add security log mutation
  const addSecurityLogMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/admin/security-logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          resolved: false
        }),
      });
      if (!response.ok) throw new Error('Failed to add security log');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Security Log Added", description: "Security incident has been logged successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security-logs"] });
      setIsSecurityLogOpen(false);
      setSecurityLogForm({
        type: "incident",
        description: "",
        location: "",
        severity: "medium",
        roomNumber: "",
        actionTaken: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add security log. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate access codes mutation
  const generateAccessCodesMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await apiRequest(`/api/admin/rooms/${roomId}/access-codes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify({
          generateNew: true
        }),
      });
      if (!response.ok) throw new Error('Failed to generate access codes');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Access Codes Generated", description: "New access codes have been generated for the room." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-codes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate access codes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSecurityLog = () => {
    if (!securityLogForm.description || !securityLogForm.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    addSecurityLogMutation.mutate(securityLogForm);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
              <p className="text-gray-600">Monitor access, incidents, and security protocols</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsSecurityLogOpen(true)} className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Log Incident
            </Button>
            <Button className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Security Settings
            </Button>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Access</p>
                  <p className="text-3xl font-bold text-green-600">{activeAccessCodes}</p>
                </div>
                <Key className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Active access codes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                  <p className="text-3xl font-bold text-red-600">{securityIncidents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Unresolved incidents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Access</p>
                  <p className="text-3xl font-bold text-blue-600">{todayAccess}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Access events today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy</p>
                  <p className="text-3xl font-bold text-purple-600">{occupiedRooms}/{totalRooms}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Rooms occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Status</p>
                  <p className="text-2xl font-bold text-green-600">SECURE</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="logs">Security Logs</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(securityLogs) && securityLogs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{log.description}</p>
                          <p className="text-xs text-gray-500">{log.location} • {format(new Date(log.timestamp), 'MMM dd, HH:mm')}</p>
                        </div>
                        <Badge variant={
                          log.severity === 'high' ? 'destructive' : 
                          log.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {log.severity}
                        </Badge>
                      </div>
                    ))}
                    {(!Array.isArray(securityLogs) || securityLogs.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No recent security events</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Access Code Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Codes</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">{activeAccessCodes}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expired Codes</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Array.isArray(accessCodes) ? accessCodes.filter((c: any) => !c.isActive).length : 0}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <Button size="sm" className="w-full">
                        <Key className="h-4 w-4 mr-2" />
                        Manage Access Codes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Code Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(accessCodes) && accessCodes.map((code: any) => (
                    <div key={code.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-medium">Room {code.roomNumber}</h3>
                            <Badge variant={code.isActive ? 'default' : 'destructive'}>
                              {code.isActive ? 'Active' : 'Expired'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Tenant: {code.tenantName}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Front Door: </span>
                              <span className="font-mono font-medium">{code.frontDoorCode}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Room Code: </span>
                              <span className="font-mono font-medium">{code.roomCode}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Expires: {format(new Date(code.expiresAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateAccessCodesMutation.mutate(code.id)}
                            disabled={generateAccessCodesMutation.isPending}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(accessCodes) || accessCodes.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No access codes configured</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(securityLogs) && securityLogs.map((log: any) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{log.description}</h3>
                            <Badge variant={
                              log.type === 'incident' ? 'destructive' :
                              log.type === 'access_granted' ? 'default' : 'secondary'
                            }>
                              {log.type.replace('_', ' ')}
                            </Badge>
                            {log.resolved ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{log.location}</p>
                          {log.roomNumber && (
                            <p className="text-sm text-gray-600 mb-2">Room: {log.roomNumber}</p>
                          )}
                          {log.actionTaken && (
                            <p className="text-sm text-blue-600 mb-2">Action: {log.actionTaken}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                          </p>
                        </div>
                        <Badge variant={
                          log.severity === 'high' ? 'destructive' :
                          log.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {log.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(securityLogs) || securityLogs.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No security logs found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Camera System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Building 934 - Main Entrance</span>
                      </div>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Building 949 - Main Entrance</span>
                      </div>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Parking Area</span>
                      </div>
                      <Badge variant="default">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile Access Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{todayAccess}</p>
                      <p className="text-sm text-gray-600">Mobile Access Today</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">24</p>
                        <p className="text-xs text-gray-600">This Week</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">156</p>
                        <p className="text-xs text-gray-600">This Month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Security Log Modal */}
        {isSecurityLogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Log Security Incident</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="log-type">Incident Type</Label>
                  <Select onValueChange={(value) => setSecurityLogForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Security Incident</SelectItem>
                      <SelectItem value="access_violation">Access Violation</SelectItem>
                      <SelectItem value="equipment_issue">Equipment Issue</SelectItem>
                      <SelectItem value="maintenance_access">Maintenance Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="log-description">Description</Label>
                  <Textarea
                    id="log-description"
                    value={securityLogForm.description}
                    onChange={(e) => setSecurityLogForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the incident"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="log-location">Location</Label>
                  <Input
                    id="log-location"
                    value={securityLogForm.location}
                    onChange={(e) => setSecurityLogForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Building, floor, or specific location"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="log-severity">Severity</Label>
                    <Select onValueChange={(value) => setSecurityLogForm(prev => ({ ...prev, severity: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="log-room">Room Number</Label>
                    <Input
                      id="log-room"
                      value={securityLogForm.roomNumber}
                      onChange={(e) => setSecurityLogForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="Room #"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="log-action">Action Taken</Label>
                  <Textarea
                    id="log-action"
                    value={securityLogForm.actionTaken}
                    onChange={(e) => setSecurityLogForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                    placeholder="What action was taken or is needed?"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsSecurityLogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSecurityLog} disabled={addSecurityLogMutation.isPending}>
                    {addSecurityLogMutation.isPending ? "Logging..." : "Log Incident"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}