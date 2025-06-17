import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  isBiometricSupported, 
  isPlatformAuthenticatorAvailable, 
  authenticateWithBiometric,
  registerBiometric,
  getBiometricStatus
} from "@/lib/biometric";
import { Fingerprint, Shield, Settings } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Biometric states
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [platformAvailable, setPlatformAvailable] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<{
    hasRegisteredDevice: boolean;
    deviceCount: number;
    devices: Array<{
      id: number;
      deviceType?: string;
      createdAt?: string;
      lastUsed?: string;
    }>;
  }>({
    hasRegisteredDevice: false,
    deviceCount: 0,
    devices: []
  });
  const [activeTab, setActiveTab] = useState("password");

  // Check biometric support on component mount
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const supported = isBiometricSupported();
      setBiometricSupported(supported);
      
      if (supported) {
        const available = await isPlatformAuthenticatorAvailable();
        setPlatformAvailable(available);
        
        // Check if user has registered biometric devices
        try {
          const status = await getBiometricStatus();
          setBiometricStatus(status);
          
          // If user has biometric registered, default to biometric tab
          if (status.hasRegisteredDevice) {
            setActiveTab("biometric");
          }
        } catch (error) {
          console.log("Could not fetch biometric status - user likely not logged in");
        }
      }
    };
    
    checkBiometricSupport();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data?.success) {
        localStorage.setItem('admin-authenticated', 'true');
        localStorage.setItem('admin-token', data.token || 'admin-authenticated');
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard",
        });
        // Force a page reload to ensure proper authentication state
        window.location.href = "/admin";
      } else {
        setError(data?.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authenticateWithBiometric();
      
      if (result.success) {
        toast({
          title: "Biometric Login Successful",
          description: "Welcome to the admin dashboard",
        });
        // Force a page reload to ensure proper authentication state
        window.location.href = "/admin";
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Biometric authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterBiometric = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await registerBiometric();
      
      if (result.success) {
        toast({
          title: "Biometric Setup Complete",
          description: "Your fingerprint/face has been registered successfully",
        });
        
        // Refresh biometric status
        const status = await getBiometricStatus();
        setBiometricStatus(status);
        setActiveTab("biometric");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to setup biometric authentication. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred authentication method
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Password
              </TabsTrigger>
              <TabsTrigger 
                value="biometric" 
                disabled={!biometricSupported || !platformAvailable}
                className="flex items-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                Biometric
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !username || !password}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {biometricSupported && platformAvailable && !biometricStatus.hasRegisteredDevice && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Want faster login? Set up biometric authentication after signing in.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="biometric" className="space-y-4 mt-4">
              {!biometricSupported ? (
                <div className="text-center py-8">
                  <Fingerprint className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Biometric authentication is not supported on this device.
                  </p>
                </div>
              ) : !platformAvailable ? (
                <div className="text-center py-8">
                  <Fingerprint className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No biometric sensors detected on this device.
                  </p>
                </div>
              ) : !biometricStatus.hasRegisteredDevice ? (
                <div className="text-center space-y-4">
                  <div className="py-4">
                    <Settings className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                    <h3 className="font-medium mb-2">Setup Biometric Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Register your fingerprint or face to enable quick and secure login.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      You must first sign in with password to register biometric authentication.
                    </p>
                  </div>
                  <Button 
                    onClick={handleRegisterBiometric}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Setting up..." : "Setup Biometric Login"}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="py-4">
                    <Fingerprint className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <h3 className="font-medium mb-2">Biometric Login Ready</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Use your registered fingerprint or face to sign in securely.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {biometricStatus.deviceCount} device(s) registered
                    </p>
                  </div>
                  <Button 
                    onClick={handleBiometricLogin}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Authenticating..." : "Sign In with Biometric"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Need help? Contact system administrator</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}