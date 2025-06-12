import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AIChatBot } from "@/components/AIChatBot";
import { 
  Bell, Home, Wrench, DollarSign, 
  User, Phone, Mail, LogOut, CheckCircle2, Calendar,
  AlertTriangle, Clock, FileText, CreditCard, Receipt,
  MessageSquare, Settings, Shield, QrCode
} from "lucide-react";

interface TenantSession {
  id: number;
  roomId: number;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
}

export default function TenantPortalComplete() {
  const [, params] = useRoute("/tenant/:roomId");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatBotMode, setChatBotMode] = useState<'tenant' | 'maintenance' | 'payment'>('tenant');
  
  const [signInForm, setSignInForm] = useState({
    tenantName: "",
    tenantEmail: "",
    tenantPhone: ""
  });
  
  const [pinForm, setPinForm] = useState({
    buildingId: "",
    roomNumber: "",
    pin: ""
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    category: "",
    priority: "normal",
    description: "",
    location: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    type: "rent",
    method: "bank_transfer"
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

  // Fetch tenant data
  const { data: tenantData } = useQuery({
    queryKey: ["/api/tenant/profile", roomId],
    queryFn: async () => {
      if (!roomId || !sessionToken) return null;
      const response = await fetch(`/api/tenant/profile/${roomId}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch tenant data');
      return response.json();
    },
    enabled: !!roomId && !!sessionToken
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/tenant/payments", roomId],
    queryFn: async () => {
      if (!roomId || !sessionToken) return [];
      const response = await fetch(`/api/tenant/payments/${roomId}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    },
    enabled: !!roomId && !!sessionToken
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/tenant/maintenance", roomId],
    queryFn: async () => {
      if (!roomId || !sessionToken) return [];
      const response = await fetch(`/api/tenant/maintenance/${roomId}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch maintenance requests');
      return response.json();
    },
    enabled: !!roomId && !!sessionToken
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/tenant/announcements"],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    }
  });

  // Mutations
  const signInMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/tenant/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Sign in failed');
      return response.json();
    },
    onSuccess: (data) => {
      setSessionToken(data.token);
      setIsSignedIn(true);
      localStorage.setItem(`tenant_session_${roomId}`, data.token);
      toast({
        title: "Signed in successfully",
        description: "Welcome to your tenant portal"
      });
    },
    onError: () => {
      toast({
        title: "Sign in failed",
        description: "Please check your information and try again",
        variant: "destructive"
      });
    }
  });

  const maintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/tenant/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ ...data, roomId })
      });
      if (!response.ok) throw new Error('Failed to submit maintenance request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/maintenance", roomId] });
      setMaintenanceForm({
        category: "",
        priority: "normal",
        description: "",
        location: ""
      });
      toast({
        title: "Maintenance request submitted",
        description: "We'll address your request as soon as possible"
      });
    }
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/tenant/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ ...data, roomId })
      });
      if (!response.ok) throw new Error('Failed to submit payment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/payments", roomId] });
      setPaymentForm({
        amount: "",
        type: "rent",
        method: "bank_transfer"
      });
      toast({
        title: "Payment submitted",
        description: "Your payment is being processed"
      });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tenant/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to checkout');
      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem(`tenant_session_${roomId}`);
      setIsSignedIn(false);
      setSessionToken(null);
      toast({
        title: "Checked out successfully",
        description: "Room has been marked for housekeeping. Thank you for staying with us!"
      });
    },
    onError: () => {
      toast({
        title: "Checkout failed",
        description: "Please try again or contact management",
        variant: "destructive"
      });
    }
  });

  const handleSignIn = () => {
    if (roomId && signInForm.tenantName) {
      signInMutation.mutate({
        roomId,
        ...signInForm
      });
    }
  };

  const handlePinSignIn = () => {
    if (pinForm.buildingId && pinForm.roomNumber && pinForm.pin) {
      signInMutation.mutate({
        buildingId: parseInt(pinForm.buildingId),
        roomNumber: pinForm.roomNumber,
        pin: pinForm.pin
      });
    }
  };

  const handleMaintenanceSubmit = () => {
    if (maintenanceForm.description && maintenanceForm.category) {
      maintenanceMutation.mutate(maintenanceForm);
    }
  };

  const handlePaymentSubmit = () => {
    if (paymentForm.amount && paymentForm.type) {
      paymentMutation.mutate({
        ...paymentForm,
        amount: parseFloat(paymentForm.amount)
      });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(`tenant_session_${roomId}`);
    setIsSignedIn(false);
    setSessionToken(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Tenant Portal Access
              </CardTitle>
              <p className="text-gray-600">Sign in to access your tenant portal</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {roomId ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Sign in with Room Information</h3>
                  <Input
                    placeholder="Your full name"
                    value={signInForm.tenantName}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, tenantName: e.target.value }))}
                  />
                  <Input
                    placeholder="Email address (optional)"
                    type="email"
                    value={signInForm.tenantEmail}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, tenantEmail: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone number (optional)"
                    value={signInForm.tenantPhone}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, tenantPhone: e.target.value }))}
                  />
                  <Button 
                    onClick={handleSignIn} 
                    className="w-full"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">Sign in with PIN</h3>
                  <Select onValueChange={(value) => setPinForm(prev => ({ ...prev, buildingId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">EasyStay Downtown</SelectItem>
                      <SelectItem value="2">EasyStay Waikiki</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Room number"
                    value={pinForm.roomNumber}
                    onChange={(e) => setPinForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                  />
                  <Input
                    placeholder="Your PIN"
                    type="password"
                    maxLength={6}
                    value={pinForm.pin}
                    onChange={(e) => setPinForm(prev => ({ ...prev, pin: e.target.value }))}
                  />
                  <Button 
                    onClick={handlePinSignIn} 
                    className="w-full"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? "Signing in..." : "Sign In with PIN"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Status</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Room {tenantData?.roomNumber || roomId}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rent Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${tenantData?.monthlyRent || 1800}</div>
            <p className="text-xs text-muted-foreground">Due on 1st of each month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRequests.filter((r: any) => r.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Open requests</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                setChatBotMode('maintenance');
                setShowChatBot(true);
              }}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Ask Assistant
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">New updates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.slice(0, 3).map((announcement: any) => (
              <div key={announcement.id} className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">{announcement.title}</h4>
                  <p className="text-sm text-gray-600">{announcement.message}</p>
                  <p className="text-xs text-gray-400">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab("maintenance")}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Submit Maintenance Request
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab("payments")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab("profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Maintenance Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={(value) => setMaintenanceForm(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="appliances">Appliances</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select onValueChange={(value) => setMaintenanceForm(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Priority level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Location (e.g., Kitchen sink, Living room)"
            value={maintenanceForm.location}
            onChange={(e) => setMaintenanceForm(prev => ({ ...prev, location: e.target.value }))}
          />

          <Textarea
            placeholder="Describe the issue in detail..."
            value={maintenanceForm.description}
            onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />

          <Button 
            onClick={handleMaintenanceSubmit}
            disabled={maintenanceMutation.isPending}
            className="w-full"
          >
            {maintenanceMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceRequests.length === 0 ? (
            <p className="text-gray-500">No maintenance requests found.</p>
          ) : (
            <div className="space-y-4">
              {maintenanceRequests.map((request: any) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{request.category}</h4>
                    <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Make Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Amount"
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
          />
          
          <Select onValueChange={(value) => setPaymentForm(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Payment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="fees">Fees</SelectItem>
              <SelectItem value="deposit">Security Deposit</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="check">Check</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handlePaymentSubmit}
            disabled={paymentMutation.isPending}
            className="w-full"
          >
            {paymentMutation.isPending ? "Processing..." : "Submit Payment"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500">No payment history found.</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">${payment.amount}</h4>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{payment.type}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "maintenance":
        return renderMaintenance();
      case "payments":
        return renderPayments();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tenant Portal</h1>
                <p className="text-sm text-gray-600">Room {tenantData?.roomNumber || roomId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {tenantData?.firstName || signInForm.tenantName}
              </span>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {checkoutMutation.isPending ? "Checking out..." : "Check Out"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "maintenance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Payments
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* AI Chat Bot Assistant */}
      {showChatBot && (
        <AIChatBot
          mode={chatBotMode}
          roomNumber={roomId}
          isMinimized={false}
          onToggleMinimize={() => setShowChatBot(false)}
          onClose={() => setShowChatBot(false)}
        />
      )}

      {/* Quick Chat Access Button */}
      {!showChatBot && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={() => {
              setChatBotMode('tenant');
              setShowChatBot(true);
            }}
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}