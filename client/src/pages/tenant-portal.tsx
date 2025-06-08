
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Wrench, CreditCard, Bell, Upload } from "lucide-react";

interface TenantSession {
  id: number;
  roomId: number;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
}

export default function TenantPortal() {
  const [, params] = useRoute("/tenant/:roomId");
  const { toast } = useToast();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [signInForm, setSignInForm] = useState({
    tenantName: "",
    tenantEmail: "",
    tenantPhone: ""
  });

  const roomId = params?.roomId ? parseInt(params.roomId) : null;

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem(`tenant_session_${roomId}`);
    if (token) {
      setSessionToken(token);
      setIsSignedIn(true);
    }
  }, [roomId]);

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/tenant/signin", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setSessionToken(data.sessionToken);
      setIsSignedIn(true);
      localStorage.setItem(`tenant_session_${roomId}`, data.sessionToken);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in to the tenant portal.",
      });
    },
    onError: () => {
      toast({
        title: "Sign In Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    }
  });

  // Dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/tenant/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/tenant/dashboard", {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      return await response.json();
    },
    enabled: isSignedIn && !!sessionToken
  });

  // Maintenance request mutation
  const maintenanceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/tenant/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to submit request");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your maintenance request has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/dashboard"] });
    }
  });

  // Payment submission mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/tenant/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to submit payment");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Submitted",
        description: "Your payment information has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/dashboard"] });
    }
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInForm.tenantName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    signInMutation.mutate({
      roomId,
      ...signInForm
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem(`tenant_session_${roomId}`);
    setIsSignedIn(false);
    setSessionToken(null);
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Room</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              The room ID in the URL is invalid. Please scan a valid QR code.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center gap-2 justify-center">
              <Home className="w-5 h-5" />
              Room {roomId} - Tenant Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="tenantName">Full Name *</Label>
                <Input
                  id="tenantName"
                  value={signInForm.tenantName}
                  onChange={(e) => setSignInForm(prev => ({ ...prev, tenantName: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tenantEmail">Email (Optional)</Label>
                <Input
                  id="tenantEmail"
                  type="email"
                  value={signInForm.tenantEmail}
                  onChange={(e) => setSignInForm(prev => ({ ...prev, tenantEmail: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="tenantPhone">Phone (Optional)</Label>
                <Input
                  id="tenantPhone"
                  value={signInForm.tenantPhone}
                  onChange={(e) => setSignInForm(prev => ({ ...prev, tenantPhone: e.target.value }))}
                  placeholder="Your phone number"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={signInMutation.isPending}
              >
                {signInMutation.isPending ? "Signing In..." : "Access Tenant Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6" />
            <h1 className="text-xl font-semibold">
              Room {roomId} - {dashboardData?.room?.room?.number || 'Loading...'}
            </h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="w-4 h-4 mr-2" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Room Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Number:</span>
                    <span className="font-medium">{dashboardData?.room?.room?.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Building:</span>
                    <span className="font-medium">{dashboardData?.room?.building?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{dashboardData?.room?.room?.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={dashboardData?.room?.room?.status === 'occupied' ? 'default' : 'secondary'}>
                      {dashboardData?.room?.room?.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Maintenance Requests:</span>
                      <span className="font-medium">{dashboardData?.maintenanceRequests?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Records:</span>
                      <span className="font-medium">{dashboardData?.payments?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unread Notices:</span>
                      <span className="font-medium">
                        {dashboardData?.notifications?.filter((n: any) => !n.isRead)?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <TenantMaintenanceTab 
              requests={dashboardData?.maintenanceRequests || []}
              onSubmit={maintenanceRequestMutation.mutate}
              isSubmitting={maintenanceRequestMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="payments">
            <TenantPaymentsTab 
              payments={dashboardData?.payments || []}
              onSubmit={paymentMutation.mutate}
              isSubmitting={paymentMutation.isPending}
              roomData={dashboardData?.room?.room}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <TenantNotificationsTab notifications={dashboardData?.notifications || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Maintenance Tab Component
function TenantMaintenanceTab({ requests, onSubmit, isSubmitting }: any) {
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    priority: "normal"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.description.trim()) return;
    
    onSubmit(newRequest);
    setNewRequest({ title: "", description: "", priority: "normal" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit New Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide detailed information about the maintenance issue"
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newRequest.priority} onValueChange={(value) => setNewRequest(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-gray-500">No maintenance requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div key={request.request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{request.request.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant={request.request.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {request.request.priority}
                      </Badge>
                      <Badge variant={request.request.status === 'completed' ? 'default' : 'outline'}>
                        {request.request.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{request.request.description}</p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(request.request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Payments Tab Component
function TenantPaymentsTab({ payments, onSubmit, isSubmitting, roomData }: any) {
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.amount || !newPayment.paymentMethod) return;
    
    onSubmit({
      ...newPayment,
      amount: parseFloat(newPayment.amount)
    });
    setNewPayment({
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      notes: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Rental Rate:</span>
              <span className="font-medium">
                ${roomData?.rentalRate || 'N/A'} / {roomData?.rentalPeriod || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Payment Due:</span>
              <span className="font-medium">
                {roomData?.nextPaymentDue ? new Date(roomData.nextPaymentDue).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional payment details"
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Payment Record"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500">No payment records yet.</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div key={payment.payment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">${payment.payment.amount}</span>
                    <Badge variant={payment.payment.status === 'completed' ? 'default' : 'outline'}>
                      {payment.payment.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Method: {payment.payment.paymentMethod}</p>
                    <p>Date: {new Date(payment.payment.paymentDate).toLocaleDateString()}</p>
                    {payment.payment.notes && <p>Notes: {payment.payment.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Notifications Tab Component
function TenantNotificationsTab({ notifications }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications & Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <div key={notification.id} className={`border rounded-lg p-4 ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{notification.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant={notification.type === 'warning' ? 'destructive' : 'secondary'}>
                      {notification.type}
                    </Badge>
                    {!notification.isRead && <Badge variant="outline">New</Badge>}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}