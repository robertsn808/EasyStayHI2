
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Clock, AlertTriangle, Eye, Plus, X, Copy } from "lucide-react";

export default function SecurityTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");

  // Fetch data
  const { data: rooms } = useQuery({ queryKey: ["/api/rooms"] });
  const { data: accessCodes } = useQuery({ queryKey: ["/api/admin/access-codes"] });
  const { data: accessLogs } = useQuery({ queryKey: ["/api/admin/access-logs"] });
  const { data: securityAlerts } = useQuery({ queryKey: ["/api/admin/security-alerts"] });

  // Create temporary access code
  const createCodeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-authenticated"
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-codes"] });
      setShowCreateCode(false);
      toast({
        title: "Access Code Created",
        description: "Temporary access code generated successfully"
      });
    }
  });

  // Deactivate access code
  const deactivateCodeMutation = useMutation({
    mutationFn: async (codeId: number) => {
      const response = await fetch(`/api/admin/access-codes/${codeId}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer admin-authenticated" }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-codes"] });
      toast({ title: "Access Code Deactivated" });
    }
  });

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    createCodeMutation.mutate({
      roomId: parseInt(formData.get("roomId") as string),
      purpose: formData.get("purpose"),
      expiresIn: parseInt(formData.get("expiresIn") as string),
      maxUsage: parseInt(formData.get("maxUsage") as string) || 1,
      guestId: formData.get("guestId") ? parseInt(formData.get("guestId") as string) : null
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getStatusColor = (success: boolean) => success ? "green" : "red";
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "red";
      case "high": return "orange";
      default: return "blue";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security & Access Management</h2>
        <Dialog open={showCreateCode} onOpenChange={setShowCreateCode}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Access Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Temporary Access Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div>
                <Label htmlFor="roomId">Room</Label>
                <Select name="roomId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms?.map((room: any) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        Room {room.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Select name="purpose" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkin">Guest Check-in</SelectItem>
                    <SelectItem value="maintenance">Maintenance Access</SelectItem>
                    <SelectItem value="cleaning">Cleaning Service</SelectItem>
                    <SelectItem value="guest_access">Guest Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiresIn">Expires In (hours)</Label>
                  <Input name="expiresIn" type="number" defaultValue="24" min="1" max="168" />
                </div>
                <div>
                  <Label htmlFor="maxUsage">Max Uses</Label>
                  <Input name="maxUsage" type="number" defaultValue="1" min="1" max="100" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateCode(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCodeMutation.isPending}>
                  Create Code
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes">Access Codes</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          <div className="grid gap-4">
            {accessCodes?.map((code: any) => (
              <Card key={code.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-lg font-bold">{code.accessCode}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(code.accessCode)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Room {code.roomId} • {code.purpose}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Expires {new Date(code.expiresAt).toLocaleDateString()}
                          </Badge>
                          <Badge variant="secondary">
                            {code.usageCount}/{code.maxUsage === -1 ? '∞' : code.maxUsage} uses
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deactivateCodeMutation.mutate(code.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-2">
            {accessLogs?.map((log: any) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${log.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Shield className={`h-4 w-4 ${log.success ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Room {log.roomId}</span>
                          <Badge variant={log.success ? "default" : "destructive"}>
                            {log.success ? "Success" : "Failed"}
                          </Badge>
                          <Badge variant="outline">{log.accessType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {log.failureReason && `Failed: ${log.failureReason} • `}
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Code: {log.accessCode}</div>
                      <div>IP: {log.ipAddress}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-2">
            {securityAlerts?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">All Clear</h3>
                  <p className="text-green-600">No security alerts in the last 24 hours</p>
                </CardContent>
              </Card>
            ) : (
              securityAlerts?.map((alert: any) => (
                <Card key={alert.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Failed Access Attempt</span>
                          <Badge variant="destructive">Room {alert.roomId}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {alert.failureReason} • {new Date(alert.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          IP: {alert.ipAddress} • Code attempted: {alert.accessCode}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
