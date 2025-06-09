import { apiRequest } from "./queryClient";

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

// Convert base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Check if WebAuthn is supported
export function isBiometricSupported(): boolean {
  return !!(navigator.credentials && window.PublicKeyCredential);
}

// Check if platform authenticator is available
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// Register biometric authentication
export async function registerBiometric(): Promise<{ success: boolean; message: string }> {
  try {
    if (!isBiometricSupported()) {
      throw new Error("Biometric authentication is not supported on this device");
    }

    // Get registration challenge from server
    const challengeResponse = await apiRequest("POST", "/api/auth/biometric/register-challenge", {});
    const challengeData = await challengeResponse.json();

    const { challenge, options } = challengeData;

    // Prepare credential creation options
    const credentialCreationOptions: CredentialCreationOptions = {
      publicKey: {
        ...options,
        challenge: new TextEncoder().encode(challenge),
        user: {
          ...options.user,
          id: new TextEncoder().encode(options.user.name)
        }
      }
    };

    // Create credential
    const credential = await navigator.credentials.create(credentialCreationOptions) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error("Failed to create biometric credential");
    }

    const response = credential.response as AuthenticatorAttestationResponse;
    
    // Prepare credential data for server
    const credentialData = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        attestationObject: arrayBufferToBase64(response.attestationObject),
        publicKey: arrayBufferToBase64(response.getPublicKey()?.buffer || new ArrayBuffer(0)),
        deviceType: 'platform'
      },
      type: credential.type
    };

    // Register with server
    const registerResponse = await apiRequest("POST", "/api/auth/biometric/register", {
      credential: credentialData,
      challenge
    });

    const result = await registerResponse.json();
    return { success: true, message: result.message };

  } catch (error: any) {
    console.error("Biometric registration error:", error);
    return { 
      success: false, 
      message: error.message || "Failed to register biometric authentication" 
    };
  }
}

// Authenticate with biometric
export async function authenticateWithBiometric(): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    if (!isBiometricSupported()) {
      throw new Error("Biometric authentication is not supported on this device");
    }

    // Get authentication challenge from server
    const challengeResponse = await apiRequest("POST", "/api/auth/biometric/login-challenge", {});
    const challengeData = await challengeResponse.json();

    const { challenge, options } = challengeData;

    // Prepare credential request options
    const credentialRequestOptions: CredentialRequestOptions = {
      publicKey: {
        ...options,
        challenge: new TextEncoder().encode(challenge),
        allowCredentials: options.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64ToArrayBuffer(cred.id)
        }))
      }
    };

    // Get credential
    const credential = await navigator.credentials.get(credentialRequestOptions) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error("Biometric authentication failed");
    }

    const response = credential.response as AuthenticatorAssertionResponse;
    
    // Prepare authentication data for server
    const authData = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        authenticatorData: arrayBufferToBase64(response.authenticatorData),
        signature: arrayBufferToBase64(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64(response.userHandle) : null
      },
      type: credential.type
    };

    // Authenticate with server
    const authResponse = await apiRequest("POST", "/api/auth/biometric/login", {
      credential: authData,
      challenge
    });

    const result = await authResponse.json();
    
    if (result.success) {
      localStorage.setItem('admin-authenticated', 'true');
      return { 
        success: true, 
        message: result.message,
        token: result.token
      };
    } else {
      throw new Error(result.message);
    }

  } catch (error: any) {
    console.error("Biometric authentication error:", error);
    return { 
      success: false, 
      message: error.message || "Biometric authentication failed" 
    };
  }
}

// Get biometric status
export async function getBiometricStatus(): Promise<{
  hasRegisteredDevice: boolean;
  deviceCount: number;
  devices: Array<{
    id: number;
    deviceType?: string;
    createdAt?: string;
    lastUsed?: string;
  }>;
}> {
  try {
    const response = await apiRequest("GET", "/api/auth/biometric/status", {});
    return await response.json();
  } catch (error) {
    console.error("Failed to get biometric status:", error);
    return {
      hasRegisteredDevice: false,
      deviceCount: 0,
      devices: []
    };
  }
}

// Remove biometric device
export async function removeBiometricDevice(credentialId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRequest("DELETE", `/api/auth/biometric/${credentialId}`, {});
    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error: any) {
    console.error("Failed to remove biometric device:", error);
    return { 
      success: false, 
      message: error.message || "Failed to remove biometric device" 
    };
  }
}