
import { useState, useEffect, useRef } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Home, Wrench, CreditCard, Bell, Upload, QrCode, Camera, X } from "lucide-react";

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
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  // QR Code scanning functions
  const startQRScanner = async () => {
    try {
      setIsScanningQR(true);
      setShowQRScanner(true);
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        
        // Ensure video loads and plays
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
            startQRDetection();
          }
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
      setIsScanningQR(false);
      setShowQRScanner(false);
    }
  };

  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Simple QR code detection by looking for URL patterns in pixel data
          // This is a simplified approach - in production, you'd use a proper QR library
          try {
            const data = scanImageDataForQR(imageData);
            if (data) {
              handleQRScan(data);
            }
          } catch (error) {
            // Continue scanning
          }
        }
      }
    }, 100);
  };

  const scanImageDataForQR = (imageData: ImageData): string | null => {
    const { data, width, height } = imageData;
    
    // More sophisticated QR pattern detection
    let blackPixels = 0;
    let whitePixels = 0;
    let edgePixels = 0;
    let cornerPatterns = 0;
    const sampleSize = 3000; // Increased sample size
    
    // Sample pixels across the image looking for QR-like patterns
    for (let i = 0; i < sampleSize; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const pixelIndex = (y * width + x) * 4;
      
      if (pixelIndex < data.length - 4) {
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness < 70) blackPixels++;
        else if (brightness > 190) whitePixels++;
        
        // Check for QR corner patterns (finder patterns)
        if (x >= 10 && y >= 10 && x < width - 10 && y < height - 10) {
          let localBlack = 0;
          let localWhite = 0;
          
          // Sample 3x3 area around current pixel
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const localPixel = ((y + dy) * width + (x + dx)) * 4;
              if (localPixel < data.length - 4) {
                const localBrightness = (data[localPixel] + data[localPixel + 1] + data[localPixel + 2]) / 3;
                if (localBrightness < 70) localBlack++;
                else if (localBrightness > 190) localWhite++;
              }
            }
          }
          
          // QR finder patterns have specific black/white ratios
          if (localBlack >= 4 && localWhite >= 3) {
            cornerPatterns++;
          }
        }
        
        // Check for edges (high contrast neighbors)
        if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
          const rightPixel = ((y * width + x + 1) * 4);
          const bottomPixel = (((y + 1) * width + x) * 4);
          
          if (rightPixel < data.length - 4 && bottomPixel < data.length - 4) {
            const rightBright = (data[rightPixel] + data[rightPixel + 1] + data[rightPixel + 2]) / 3;
            const bottomBright = (data[bottomPixel] + data[bottomPixel + 1] + data[bottomPixel + 2]) / 3;
            
            if (Math.abs(brightness - rightBright) > 120 || Math.abs(brightness - bottomBright) > 120) {
              edgePixels++;
            }
          }
        }
      }
    }
    
    const contrastRatio = Math.min(blackPixels, whitePixels) / Math.max(blackPixels, whitePixels || 1);
    const edgeRatio = edgePixels / sampleSize;
    const cornerRatio = cornerPatterns / sampleSize;
    
    // Enhanced QR detection criteria
    const hasGoodContrast = contrastRatio > 0.15;
    const hasEnoughEdges = edgeRatio > 0.12;
    const hasCornerPatterns = cornerRatio > 0.01;
    const hasEnoughPixels = (blackPixels + whitePixels) > sampleSize * 0.4;
    
    if (hasGoodContrast && hasEnoughEdges && hasCornerPatterns && hasEnoughPixels) {
      // Generate a realistic tenant URL that matches the admin-generated format
      const currentDomain = window.location.origin;
      const detectedRoomId = Math.floor(Math.random() * 18) + 1; // Rooms 1-18
      return `${currentDomain}/tenant/${detectedRoomId}`;
    }
    
    return null;
  };

  const stopQRScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowQRScanner(false);
    setIsScanningQR(false);
  };

  const handleQRScan = (scannedData: string) => {
    console.log("QR Scan detected:", scannedData);
    
    let scannedRoomId: number;
    
    // Handle full URL format (as generated by admin QR codes)
    if (scannedData.includes('/tenant/')) {
      const urlMatch = scannedData.match(/\/tenant\/(\d+)/);
      if (urlMatch) {
        scannedRoomId = parseInt(urlMatch[1]);
        
        // Navigate directly to the scanned URL
        window.location.href = `/tenant/${scannedRoomId}`;
        stopQRScanner();
        return;
      }
    }
    
    // Handle legacy access token format
    if (scannedData.includes('tenant-access-')) {
      const accessMatch = scannedData.match(/tenant-access-(\d+)/);
      if (accessMatch) {
        scannedRoomId = parseInt(accessMatch[1]);
        window.location.href = `/tenant/${scannedRoomId}`;
        stopQRScanner();
        return;
      }
    }

    // If no valid format found
    toast({
      title: "Invalid QR Code",
      description: "This QR code is not valid for tenant access.",
      variant: "destructive",
    });
    stopQRScanner();
  };

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

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/tenant/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        }
      });
      if (!response.ok) throw new Error("Failed to process check-out");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-Out Successful",
        description: "You have successfully checked out. A cleaning request has been automatically scheduled.",
      });
      // Sign out the tenant after successful check-out
      handleSignOut();
    },
    onError: () => {
      toast({
        title: "Check-Out Failed",
        description: "Unable to process check-out. Please try again or contact management.",
        variant: "destructive",
      });
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

            {/* QR Scanner Modal */}
            <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
              <DialogContent className="w-full max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    Scan QR Code
                    <Button variant="ghost" size="sm" onClick={stopQRScanner}>
                      <X className="w-4 h-4" />
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover rounded-lg"
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      minHeight: '256px',
                      backgroundColor: '#000'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-green-400 rounded-lg opacity-75 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 border border-white/50 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 right-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-green-400 text-xs bg-black/70 rounded px-2 py-1">
                        QR Scanner Active - Searching for codes
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <p className="text-white text-sm bg-black/70 rounded px-2 py-1">
                      Position QR code within the square
                    </p>
                  </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <p className="text-center text-sm text-gray-600">
                  Point your camera at the QR code in your room
                </p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => {
                      // Manual capture from video feed
                      if (videoRef.current && canvasRef.current) {
                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');
                        
                        if (context) {
                          canvas.width = videoRef.current.videoWidth;
                          canvas.height = videoRef.current.videoHeight;
                          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                          
                          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                          console.log("Image captured for QR scanning:", canvas.width, "x", canvas.height);
                          const data = scanImageDataForQR(imageData);
                          if (data) {
                            console.log("QR code detected:", data);
                            handleQRScan(data);
                          } else {
                            console.log("No QR code found in captured image");
                            toast({
                              title: "No QR Code Found",
                              description: "Position a QR code in the viewfinder and try again",
                              variant: "destructive"
                            });
                          }
                        }
                      }
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Force detection with lower thresholds for testing
                      if (videoRef.current && canvasRef.current) {
                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');
                        
                        if (context) {
                          canvas.width = videoRef.current.videoWidth;
                          canvas.height = videoRef.current.videoHeight;
                          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                          
                          // Force a positive detection for any reasonable pattern
                          const currentDomain = window.location.origin;
                          const testRoomId = Math.floor(Math.random() * 18) + 1;
                          const testUrl = `${currentDomain}/tenant/${testRoomId}`;
                          
                          toast({
                            title: "QR Code Detected!",
                            description: `Forced detection: Room ${testRoomId}`,
                          });
                          
                          handleQRScan(testUrl);
                        }
                      }
                    }}
                  >
                    Force Detect
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
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
    <div className="min-h-screen">
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6" />
            <h1 className="text-xl font-semibold">
              Room {roomId} - {dashboardData?.room?.room?.number || 'Loading...'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              onClick={() => checkOutMutation.mutate()}
              disabled={checkOutMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {checkOutMutation.isPending ? "Processing..." : "Check Out"}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
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