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
    username: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch current admin users
  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch buildings data
  const { data: buildingsData = [] } = useQuery({
    queryKey: ["/api/buildings"],
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof userData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      
      return response.json();
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": "admin-authenticated"
        },
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

  const handleCreateUser = () => {
    if (!userData.username || !userData.password) {
      toast({
        title: "Missing Information",
        description: "Please provide both username and password.",
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
      username: "",
      password: "",
      role: "maintenance"
    });
    setShowUserDialog(true);
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
          <TabsTrigger value="api">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-username">Current Username</Label>
                <Input
                  id="current-username"
                  type="text"
                  value="admin"
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                      className="w-full"
                    >
                      {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage administrator and maintenance accounts
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
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
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            type="text"
                            value={userData.username}
                            onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={userData.password}
                            onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <select
                            id="role"
                            value={userData.role}
                            onChange={(e) => setUserData(prev => ({ ...prev, role: e.target.value as "admin" | "maintenance" }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="admin">Administrator</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </div>
                        <Button 
                          onClick={handleCreateUser}
                          disabled={createUserMutation.isPending}
                          className="w-full"
                        >
                          {createUserMutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={createMaintenanceAccount}>
                    <Shield className="w-4 h-4 mr-2" />
                    Quick Maintenance Account
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminUsers.map((user: AdminUser) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${user.role === 'admin' ? 'bg-blue-500' : 'bg-orange-500'} rounded-full flex items-center justify-center`}>
                        {user.role === 'admin' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Shield className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{user.username}</h4>
                        <p className="text-sm text-gray-600">{user.role === 'admin' ? 'Administrator' : 'Maintenance'}</p>
                        {user.lastLogin && (
                          <p className="text-xs text-gray-500">Last login: {new Date(user.lastLogin).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUserMutation.mutate(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {adminUsers.length === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No user accounts configured. Create your first admin account using the button above.
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
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Integration Settings
              </CardTitle>
              <CardDescription>
                Configure external system integrations and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  External integrations are not currently configured. Contact system administrator to enable API access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}