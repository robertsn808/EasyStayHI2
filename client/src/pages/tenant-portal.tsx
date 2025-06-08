import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, Home, Wrench, DollarSign, 
  User, Phone, Mail, LogOut, CheckCircle2, Calendar
} from "lucide-react";

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
  
  const [pinForm, setPinForm] = useState({
    buildingId: "",
    roomNumber: "",
    pin: ""
  });

  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

  const roomId = params?.roomId ? parseInt(params.roomId) : null;

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem(`tenant_session_${roomId}`);
    if (token) {
      setSessionToken(token);
      setIsSignedIn(true);
    }
  }, [roomId]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/tenant/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          ...signInForm
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(`tenant_session_${roomId}`, data.token);
        setSessionToken(data.token);
        setIsSignedIn(true);
        toast({
          title: "Welcome!",
          description: "You have successfully signed in to your tenant portal.",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: "Unable to sign in. Please check your information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    }
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

  const handlePinAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/tenant/auth/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber: pinForm.roomNumber,
          pin: pinForm.pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store session token and redirect to room portal
        localStorage.setItem(`tenant_session_${data.roomId}`, data.sessionToken);
        window.location.href = `/tenant/${data.roomId}`;
      } else {
        toast({
          title: "Authentication Failed",
          description: data.error || "Invalid room number or PIN",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900 mb-4">EasyStay Hawaii</CardTitle>
            <p className="text-gray-600">Tenant Portal Access</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">#</span>
              </div>
              <p className="text-gray-600 mb-4">
                Enter your room number and 4-digit PIN to access the tenant portal
              </p>
            </div>
            
            <form onSubmit={handlePinAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={pinForm.roomNumber}
                  onChange={(e) => setPinForm(prev => ({...prev, roomNumber: e.target.value}))}
                  placeholder="e.g., 001, A01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinForm.pin}
                  onChange={(e) => setPinForm(prev => ({...prev, pin: e.target.value.replace(/\D/g, '')}))}
                  placeholder="Enter PIN"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={pinForm.pin.length !== 4 || !pinForm.roomNumber}
              >
                Access Room Portal
              </Button>
            </form>
            
            <div className="text-center text-xs text-gray-500 mt-4">
              <p>Need help? Contact the property management for your room PIN.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render tenant sign-in form for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900 mb-2">Room {roomId}</CardTitle>
            <p className="text-gray-600">Tenant Portal Sign In</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={signInForm.tenantName}
                  onChange={(e) => setSignInForm(prev => ({...prev, tenantName: e.target.value}))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address (Optional)
                </label>
                <Input
                  type="email"
                  value={signInForm.tenantEmail}
                  onChange={(e) => setSignInForm(prev => ({...prev, tenantEmail: e.target.value}))}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  value={signInForm.tenantPhone}
                  onChange={(e) => setSignInForm(prev => ({...prev, tenantPhone: e.target.value}))}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Sign In to Portal
              </Button>
            </form>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>By signing in, you agree to use this portal responsibly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main tenant portal interface for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Room {roomId}</h1>
              <p className="text-sm text-gray-600">Tenant Portal</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <User className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Your Portal</h2>
                <p className="text-blue-100">
                  Access all your tenant services and submit requests below
                </p>
              </div>
              <Home className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Wrench className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h3 className="font-semibold text-gray-900 mb-1">Maintenance</h3>
              <p className="text-sm text-gray-600">Report issues</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold text-gray-900 mb-1">Payments</h3>
              <p className="text-sm text-gray-600">View & pay rent</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Bell className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold text-gray-900 mb-1">Notifications</h3>
              <p className="text-sm text-gray-600">Important updates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-semibold text-gray-900 mb-1">Check Out</h3>
              <p className="text-sm text-gray-600">End tenancy</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display</p>
              <p className="text-sm">Your requests and notifications will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Room Management Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-700">(808) 555-0123</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-700">support@easystayhi.com</span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM HST
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}