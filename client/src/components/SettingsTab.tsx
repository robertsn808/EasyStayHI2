import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, Users, Shield, Key, Plus, Edit, Trash2, 
  Save, Eye, EyeOff, AlertTriangle, CheckCircle 
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
    username: "Sesa",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch current admin users
  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify(data)
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
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify(data)
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
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify(data)
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
      return await apiRequest(`/api/admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": "admin-authenticated"
        }
      });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Manage user accounts and system preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  System is secured with admin authentication tokens. Regular password changes are recommended.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-gray-600">Update your login password</p>
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
                        <Label htmlFor="new-password-change">New Password</Label>
                        <Input
                          id="new-password-change"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password-change">Confirm New Password</Label>
                        <Input
                          id="confirm-password-change"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handlePasswordChange}
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}