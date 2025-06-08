import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  Trash2, 
  Users, 
  Building, 
  Wrench, 
  MessageSquare,
  DollarSign,
  Home,
  Key,
  Shield
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickAccessTabProps {
  buildings?: any[];
  rooms?: any[];
  guests?: any[];
  inquiries?: any[];
  maintenanceRequests?: any[];
}

export function QuickAccessTab({ 
  buildings = [], 
  rooms = [], 
  guests = [], 
  inquiries = [], 
  maintenanceRequests = [] 
}: QuickAccessTabProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/admin/notifications", selectedBuilding !== "all" ? selectedBuilding : undefined],
    enabled: true,
  });

  // Delete notification mutation
  const deleteNotification = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/notifications/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({ title: "Notification deleted" });
    },
  });

  // Clear all notifications mutation
  const clearAllNotifications = useMutation({
    mutationFn: () => apiRequest(`/api/admin/notifications${selectedBuilding !== "all" ? `?buildingId=${selectedBuilding}` : ""}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({ title: "All notifications cleared" });
    },
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/notifications/${id}/read`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    },
  });

  // Unlock portal mutation
  const unlockPortal = useMutation({
    mutationFn: (roomId: number) => apiRequest(`/api/admin/portal/unlock/${roomId}`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({ title: "Portal unlocked successfully" });
    },
  });

  const handleNotificationAction = (notification: any) => {
    if (notification.actionType === "unlock_portal") {
      const actionData = JSON.parse(notification.actionData || "{}");
      unlockPortal.mutate(actionData.roomId);
      markAsRead.mutate(notification.id);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === "urgent") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (type) {
      case "security_alert":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "guest_checkout":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "new_inquiry":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "maintenance_request":
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (color: string) => {
    switch (color) {
      case "red": return "border-l-red-500 bg-red-50";
      case "yellow": return "border-l-yellow-500 bg-yellow-50";
      case "green": return "border-l-green-500 bg-green-50";
      case "blue": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  // Quick overview statistics
  const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
  const availableRooms = Array.isArray(rooms) ? rooms.filter(r => r.status === "available").length : 0;
  const occupiedRooms = Array.isArray(rooms) ? rooms.filter(r => r.status === "occupied").length : 0;
  const maintenanceRooms = Array.isArray(rooms) ? rooms.filter(r => r.status === "maintenance").length : 0;
  const cleaningRooms = Array.isArray(rooms) ? rooms.filter(r => r.status === "cleaning").length : 0;
  const totalGuests = Array.isArray(guests) ? guests.length : 0;
  const activeInquiries = Array.isArray(inquiries) ? inquiries.filter(i => i.status === "pending").length : 0;
  const pendingMaintenance = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter(m => m.request?.status === "submitted").length : 0;

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead) : [];

  return (
    <div className="space-y-8">
      {/* Premium Quick Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900">{totalRooms}</p>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-900">{availableRooms}</p>
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-900">{occupiedRooms}</p>
                <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/80 to-amber-100/60 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-900">{maintenanceRooms + cleaningRooms}</p>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Active Items Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-slate-50/80 to-slate-100/60 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Active Guests</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-bold px-3 py-1">{totalGuests}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="font-medium">Pending Inquiries</span>
              </div>
              <Badge variant="secondary">{activeInquiries}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Maintenance Requests</span>
              </div>
              <Badge variant="secondary">{pendingMaintenance}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive">{unreadNotifications.length}</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Buildings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id.toString()}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAllNotifications.mutate()}
                disabled={!Array.isArray(notifications) || notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {!Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`border-l-3 p-2 rounded-r-md ${getNotificationColor(notification.color)} ${
                      !notification.isRead ? "ring-1 ring-gray-200" : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-xs">{notification.title}</h4>
                            {notification.priority === "urgent" && (
                              <Badge variant="destructive" className="text-xs py-0 px-1">!</Badge>
                            )}
                            {!notification.isRead && (
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </span>
                            {notification.actionType && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleNotificationAction(notification)}
                                className="text-xs h-5 px-2"
                              >
                                {notification.actionType === "unlock_portal" ? (
                                  <>
                                    <Key className="h-2 w-2 mr-1" />
                                    Unlock
                                  </>
                                ) : (
                                  "Action"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead.mutate(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification.mutate(notification.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}