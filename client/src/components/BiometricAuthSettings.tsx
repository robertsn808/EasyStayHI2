import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  isBiometricSupported, 
  isPlatformAuthenticatorAvailable, 
  registerBiometric,
  getBiometricStatus,
  removeBiometricDevice
} from "@/lib/biometric";
import { Fingerprint, Shield, Trash2, Plus, CheckCircle, AlertCircle } from "lucide-react";

export default function BiometricAuthSettings() {
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [platformAvailable, setPlatformAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
  const { toast } = useToast();

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const supported = isBiometricSupported();
      setBiometricSupported(supported);
      
      if (supported) {
        const available = await isPlatformAuthenticatorAvailable();
        setPlatformAvailable(available);
        await loadBiometricStatus();
      }
    };
    
    checkBiometricSupport();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      const status = await getBiometricStatus();
      setBiometricStatus(status);
    } catch (error) {
      console.error("Failed to load biometric status:", error);
    }
  };

  const handleRegisterBiometric = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await registerBiometric();
      
      if (result.success) {
        toast({
          title: "Biometric Device Registered",
          description: "Your fingerprint/face has been registered successfully",
        });
        await loadBiometricStatus();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to register biometric device. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDevice = async (credentialId: string) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await removeBiometricDevice(credentialId);
      
      if (result.success) {
        toast({
          title: "Biometric Device Removed",
          description: "The biometric device has been removed successfully",
        });
        await loadBiometricStatus();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to remove biometric device. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  if (!biometricSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Manage your biometric authentication devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Biometric authentication is not supported on this device or browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!platformAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Manage your biometric authentication devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No biometric sensors detected on this device. Please use a device with fingerprint or face recognition capabilities.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Secure your admin account with fingerprint or face recognition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-medium">Biometric Login Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {biometricStatus.hasRegisteredDevice 
                  ? `${biometricStatus.deviceCount} device(s) registered`
                  : "No devices registered"
                }
              </p>
            </div>
          </div>
          <Badge variant={biometricStatus.hasRegisteredDevice ? "default" : "secondary"}>
            {biometricStatus.hasRegisteredDevice ? "Active" : "Inactive"}
          </Badge>
        </div>

        {biometricStatus.devices.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Registered Devices</h4>
            {biometricStatus.devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">
                      {device.deviceType === 'platform' ? 'Platform Authenticator' : device.deviceType || 'Biometric Device'}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Registered: {formatDate(device.createdAt)}</p>
                      <p>Last used: {formatDate(device.lastUsed)}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveDevice(device.id.toString())}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={handleRegisterBiometric}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isLoading ? "Registering..." : "Add New Biometric Device"}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
            Follow your device's prompts to register your fingerprint or face
          </p>
        </div>

        {biometricStatus.hasRegisteredDevice && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Biometric login is enabled. You can now use your fingerprint or face to sign in quickly on the login page.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}