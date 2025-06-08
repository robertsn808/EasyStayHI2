import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, Users, Shield, Key, Plus, Edit, Trash2, 
  Save, Eye, EyeOff, AlertTriangle, CheckCircle, Home 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'maintenance';
  createdAt: string;
  lastLogin?: string;
}

export function SettingsTab() {
  const { toast } = useToast();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<any | null>(null);
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);
  const [showRoomsDialog, setShowRoomsDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  
  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    role: "admin" as "admin" | "maintenance"
  });
  
  const [profileData, setProfileData] = useState({
    username: "Sesa",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch current admin users
  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch buildings data
  const { data: buildingsData = [] } = useQuery({
    queryKey: ["/api/admin/buildings"],
  });

  // Fetch rooms data
  const { data: roomsData = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/change-password", {
        method: "POST",
        body: data,
        headers: {
          "x-admin-token": "admin-authenticated"
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/update-profile", {
        method: "POST",
        body: data,
        headers: {
          "x-admin-token": "admin-authenticated"
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setProfileData({ username: profileData.username, newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/create-user", {
        method: "POST",
        body: data,
        headers: {
          "x-admin-token": "admin-authenticated"
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user account has been created successfully.",
      });
      setUserData({ username: "", password: "", role: "admin" });
      setShowUserDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": "admin-authenticated"
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User account has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate(passwordData);
  };

  const handleProfileUpdate = () => {
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate(profileData);
  };

  const handleCreateUser = () => {
    if (!userData.username || !userData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (userData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    createUserMutation.mutate(userData);
  };

  const createMaintenanceAccount = () => {
    setUserData({
      username: "webmaster",
      password: "Camputer69!",
      role: "maintenance"
    });
    createUserMutation.mutate({
      username: "webmaster",
      password: "Camputer69!",
      role: "maintenance"
    });
  };

  // Room management mutations
  const updateRoomMutation = useMutation({
    mutationFn: async ({ roomId, data }: { roomId: number; data: any }) => {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update room');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: "Success", description: "Room updated successfully" });
      setEditingRoom(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update room", variant: "destructive" });
    }
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create room');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: "Success", description: "Room created successfully" });
      setShowAddRoomDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create room", variant: "destructive" });
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': 'admin-authenticated'
        }
      });
      if (!response.ok) throw new Error('Failed to delete room');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: "Success", description: "Room deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete room", variant: "destructive" });
    }
  });

  // Handler functions
  const handleEditRooms = (building: any) => {
    setSelectedBuilding(building);
    setShowRoomsDialog(true);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
  };

  const handleAddRoom = () => {
    setShowAddRoomDialog(true);
  };

  const handleDeleteRoom = (roomId: number) => {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      deleteRoomMutation.mutate(roomId);
    }
  };

  const handleEditBuilding = (building: any) => {
    setEditingBuilding(building);
    setShowBuildingDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Manage user accounts and system preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="properties">Property Management</TabsTrigger>
          <TabsTrigger value="api">Public API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value="Administrator"
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">New Password (optional)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleProfileUpdate}
                disabled={updateProfileMutation.isPending}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  System Users
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={createMaintenanceAccount}
                    disabled={createUserMutation.isPending}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Create Maintenance Account
                  </Button>
                  <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-username">Username</Label>
                          <Input
                            id="new-username"
                            value={userData.username}
                            onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password">Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={userData.password}
                            onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role-select">Role</Label>
                          <select
                            id="role-select"
                            value={userData.role}
                            onChange={(e) => setUserData(prev => ({ ...prev, role: e.target.value as "admin" | "maintenance" }))}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="admin">Administrator</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateUser}
                            disabled={createUserMutation.isPending}
                          >
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Admin */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Sesa (You)</h4>
                      <p className="text-sm text-gray-600">Administrator</p>
                    </div>
                  </div>
                  <Badge variant="default">Current User</Badge>
                </div>

                {/* Maintenance Account */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">webmaster</h4>
                      <p className="text-sm text-gray-600">Maintenance Account</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Maintenance</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUserMutation.mutate("webmaster")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {adminUsers.length === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No additional users found. You can create user accounts using the buttons above.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Property Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Buildings Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Buildings</h3>
                  <div className="space-y-4">
                    {Array.isArray(buildingsData) && buildingsData.map((building: any) => (
                      <div key={building.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{building.name}</h4>
                          <p className="text-sm text-gray-600">{building.address}</p>
                          <p className="text-xs text-gray-500">Building ID: {building.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditBuilding(building)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditRooms(building)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Rooms
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Building
                  </Button>
                </div>

                {/* Global Settings */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Global Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        defaultValue="EasyStay Hawaii"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Contact Phone</Label>
                      <Input
                        id="contact-phone"
                        defaultValue="(808) 555-0123"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        defaultValue="support@easystayhi.com"
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="office-hours">Office Hours</Label>
                      <Input
                        id="office-hours"
                        defaultValue="Monday - Friday, 9:00 AM - 5:00 PM HST"
                        placeholder="Office hours"
                      />
                    </div>
                  </div>
                  
                  <Button className="mt-4">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Public API Access
              </CardTitle>
              <CardDescription>
                Manage API keys and integrations for custom applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="api-key" 
                    type="text" 
                    value="easystay_api_key_2024_..." 
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">Copy</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this key to authenticate API requests to the EasyStay system
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>API Endpoints</Label>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>GET /api/public/rooms - List available rooms</div>
                  <div>GET /api/public/buildings - List properties</div>
                  <div>POST /api/public/inquiries - Submit inquiry</div>
                  <div>GET /api/public/announcements - Get announcements</div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button>Generate New Key</Button>
                <Button variant="outline">View Documentation</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Settings</CardTitle>
              <CardDescription>
                Configure webhooks for real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input 
                  id="webhook-url" 
                  type="url" 
                  placeholder="https://your-app.com/webhook/easystay" 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="new-inquiry" className="rounded" />
                    <Label htmlFor="new-inquiry">New Inquiry Received</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="room-booked" className="rounded" />
                    <Label htmlFor="room-booked">Room Booking Confirmed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="payment-received" className="rounded" />
                    <Label htmlFor="payment-received">Payment Received</Label>
                  </div>
                </div>
              </div>
              
              <Button>Save Webhook Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Room Management Dialog */}
      <Dialog open={showRoomsDialog} onOpenChange={setShowRoomsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Rooms - {selectedBuilding?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Rooms ({Array.isArray(roomsData) ? roomsData.filter(room => room.buildingId === selectedBuilding?.id).length : 0})
              </h3>
              <Button onClick={handleAddRoom}>
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
            
            <div className="grid gap-4">
              {Array.isArray(roomsData) && roomsData
                .filter(room => room.buildingId === selectedBuilding?.id)
                .map((room: any) => (
                  <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      {editingRoom?.id === room.id ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const updateData = {
                            number: formData.get('number'),
                            size: formData.get('size'),
                            floor: parseInt(formData.get('floor') as string)
                          };
                          updateRoomMutation.mutate({ roomId: room.id, data: updateData });
                        }} className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="number">Room Number</Label>
                            <Input
                              name="number"
                              defaultValue={room.number}
                              placeholder="Room number"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="size">Size</Label>
                            <Input
                              name="size"
                              defaultValue={room.size || ''}
                              placeholder="Room size"
                            />
                          </div>
                          <div>
                            <Label htmlFor="floor">Floor</Label>
                            <Input
                              name="floor"
                              type="number"
                              defaultValue={room.floor || ''}
                              placeholder="Floor number"
                            />
                          </div>
                          <div className="flex gap-2 col-span-3">
                            <Button type="submit" size="sm" disabled={updateRoomMutation.isPending}>
                              <Save className="w-4 h-4 mr-1" />
                              {updateRoomMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditingRoom(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="grid grid-cols-4 gap-4 items-center">
                          <div>
                            <strong>Room {room.number}</strong>
                          </div>
                          <div className="text-sm text-gray-600">
                            {room.size || 'No size specified'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Floor {room.floor || 'N/A'}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteRoom(room.id)}
                              disabled={deleteRoomMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {Array.isArray(roomsData) && roomsData.filter(room => room.buildingId === selectedBuilding?.id).length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No rooms found for this building. Click "Add Room" to create the first room.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const roomData = {
              buildingId: selectedBuilding?.id,
              number: formData.get('number'),
              size: formData.get('size'),
              floor: parseInt(formData.get('floor') as string) || 1,
              status: 'available'
            };
            createRoomMutation.mutate(roomData);
          }} className="space-y-4">
            <div>
              <Label htmlFor="number">Room Number *</Label>
              <Input
                name="number"
                placeholder="e.g., 101, A1, Suite 1"
                required
              />
            </div>
            <div>
              <Label htmlFor="size">Room Size</Label>
              <Input
                name="size"
                placeholder="e.g., 1 bedroom, Studio, 2BR/1BA"
              />
            </div>
            <div>
              <Label htmlFor="floor">Floor Number</Label>
              <Input
                name="floor"
                type="number"
                placeholder="1"
                defaultValue="1"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createRoomMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createRoomMutation.isPending ? "Creating..." : "Create Room"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddRoomDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}