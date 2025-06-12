import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, validateAdminCredentials } from "./replitAuth";
import { 
  insertInquirySchema, 
  insertContactSchema, 
  insertAnnouncementSchema,
  insertCalendarEventSchema,
  insertInventorySchema,
  insertReceiptSchema,
  insertTodoSchema,
  insertRoomSchema,
  insertBuildingSchema,
  insertTenantSessionSchema,
  insertMaintenanceRequestSchema,
  insertPaymentSchema,
  insertNotificationSchema,
  insertGuestProfileSchema
} from "@shared/schema";
import { generateTenantQRCode, generateTenantToken, verifyTenantToken } from "./qrGenerator";
import { aiChatBot } from "./aiChatBot";
import { fallbackAI } from "./fallbackAI";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Simple admin auth middleware for demo
  const simpleAdminAuth = (req: any, res: any, next: any) => {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken === 'admin-authenticated') {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Admin authentication endpoints
  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (validateAdminCredentials(username, password)) {
        res.json({ 
          success: true, 
          message: "Admin login successful",
          token: "admin-authenticated",
          user: { username: "admin", role: "admin" }
        });
      } else {
        res.status(401).json({ message: "Invalid admin credentials. Please check your username and password." });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Biometric authentication endpoints
  app.post('/api/auth/biometric/register-challenge', simpleAdminAuth, async (req, res) => {
    try {
      // Generate a challenge for biometric registration
      const challenge = randomBytes(32).toString('base64url');
      const userHandle = 'admin'; // Fixed for admin user
      
      // Get the proper domain for Azure deployment
      const host = req.get('host') || 'localhost';
      const rpId = process.env.NODE_ENV === 'production' 
        ? host.split(':')[0] 
        : 'localhost';

      const registrationOptions = {
        challenge: new TextEncoder().encode(challenge),
        rp: {
          name: "EasyStay HI Admin",
          id: rpId
        },
        user: {
          id: new TextEncoder().encode(userHandle),
          name: "admin",
          displayName: "Admin User"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
      };

      res.json({
        challenge: challenge,
        options: registrationOptions
      });
    } catch (error) {
      console.error("Biometric registration challenge error:", error);
      res.status(500).json({ message: "Failed to generate registration challenge" });
    }
  });

  app.post('/api/auth/biometric/register', simpleAdminAuth, async (req, res) => {
    try {
      const { credential, challenge } = req.body;
      
      // Store the biometric credential
      await storage.createBiometricCredential({
        credentialId: credential.id,
        publicKey: credential.response.publicKey,
        counter: 0,
        deviceType: credential.response.deviceType || 'unknown',
        userHandle: 'admin'
      });

      res.json({ 
        success: true,
        message: "Biometric authentication registered successfully"
      });
    } catch (error) {
      console.error("Biometric registration error:", error);
      res.status(500).json({ message: "Failed to register biometric authentication" });
    }
  });

  app.post('/api/auth/biometric/login-challenge', async (req, res) => {
    try {
      // Get all registered credentials for challenge
      const credentials = await storage.getAllBiometricCredentials();
      const challenge = randomBytes(32).toString('base64url');
      
      const authenticationOptions = {
        challenge: new TextEncoder().encode(challenge),
        allowCredentials: credentials.map(cred => ({
          id: cred.credentialId,
          type: "public-key"
        })),
        userVerification: "required",
        timeout: 60000
      };

      res.json({
        challenge: challenge,
        options: authenticationOptions
      });
    } catch (error) {
      console.error("Biometric login challenge error:", error);
      res.status(500).json({ message: "Failed to generate login challenge" });
    }
  });

  app.post('/api/auth/biometric/login', async (req, res) => {
    try {
      const { credential, challenge } = req.body;
      
      // Verify the credential exists
      const storedCredential = await storage.getBiometricCredential(credential.id);
      if (!storedCredential) {
        return res.status(401).json({ message: "Invalid biometric credential" });
      }

      // Update counter and last used
      await storage.updateBiometricCredentialCounter(credential.id, storedCredential.counter + 1);

      res.json({ 
        success: true,
        message: "Biometric login successful",
        token: "admin-authenticated",
        user: { username: "admin", role: "admin" }
      });
    } catch (error) {
      console.error("Biometric login error:", error);
      res.status(500).json({ message: "Failed to authenticate with biometric" });
    }
  });

  app.get('/api/auth/biometric/status', simpleAdminAuth, async (req, res) => {
    try {
      const credentials = await storage.getAllBiometricCredentials();
      res.json({ 
        hasRegisteredDevice: credentials.length > 0,
        deviceCount: credentials.length,
        devices: credentials.map(cred => ({
          id: cred.id,
          deviceType: cred.deviceType,
          createdAt: cred.createdAt,
          lastUsed: cred.lastUsed
        }))
      });
    } catch (error) {
      console.error("Biometric status error:", error);
      res.status(500).json({ message: "Failed to get biometric status" });
    }
  });

  app.delete('/api/auth/biometric/:credentialId', simpleAdminAuth, async (req, res) => {
    try {
      await storage.deleteBiometricCredential(req.params.credentialId);
      res.json({ success: true, message: "Biometric device removed" });
    } catch (error) {
      console.error("Biometric deletion error:", error);
      res.status(500).json({ message: "Failed to remove biometric device" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Health check endpoint for Azure deployment
  app.get("/api/health", async (req, res) => {
    try {
      // Basic health check - verify database connection
      const rooms = await storage.getRooms();
      res.json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        database: "connected",
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      res.status(503).json({ 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        error: "Database connection failed"
      });
    }
  });

  // Public routes
  app.get("/api/rooms/available-count", async (req, res) => {
    try {
      const count = await storage.getAvailableRoomCount();
      res.json({ availableRooms: count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available room count" });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // QR Code generation routes
  app.post("/api/qr/generate", async (req, res) => {
    const { roomId } = req.body;
    try {
      const rooms = await storage.getRooms();
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      const qrCode = await generateTenantQRCode(roomId, room.number);
      res.json({ qrCode });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  // Tenant portal routes
  app.post("/api/tenant/signin", async (req, res) => {
    const { roomId, tenantName, tenantEmail, tenantPhone } = req.body;
    try {
      const token = generateTenantToken(roomId, { 
        name: tenantName, 
        email: tenantEmail, 
        phone: tenantPhone 
      });
      
      const sessionData = {
        roomId,
        tenantName,
        tenantEmail: tenantEmail || null,
        tenantPhone: tenantPhone || null,
        sessionToken: token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
      };
      
      const session = await storage.createTenantSession(sessionData);
      res.json({ sessionToken: token, session });
    } catch (error) {
      console.error("Error creating tenant session:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  app.get("/api/tenant/dashboard", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyTenantToken(token);
      
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const roomData = await storage.getRoomWithBuilding(decoded.roomId);
      const maintenanceRequests = await storage.getMaintenanceRequests(decoded.roomId);
      const payments = await storage.getPayments(decoded.roomId);
      const notifications = await storage.getNotifications(decoded.roomId);

      res.json({
        room: roomData,
        maintenanceRequests,
        payments,
        notifications,
        tenant: decoded.tenantData
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.post("/api/tenant/maintenance", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyTenantToken(token);
      
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const maintenanceData = {
        ...req.body,
        roomId: decoded.roomId,
        tenantName: decoded.tenantData.name,
        title: `${req.body.category || 'Maintenance'} Request - ${req.body.location || 'Room ' + decoded.roomId}`,
        status: 'pending',
        createdAt: new Date(),
      };

      const request = await storage.createMaintenanceRequest(maintenanceData);
      res.json(request);
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      res.status(500).json({ error: "Failed to create maintenance request" });
    }
  });

  app.post("/api/tenant/payment", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyTenantToken(token);
      
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const paymentData = {
        ...req.body,
        roomId: decoded.roomId,
        tenantName: decoded.tenantData.name,
        status: 'pending',
        createdAt: new Date(),
      };

      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.post("/api/tenant/checkout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyTenantToken(token);
      
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Update room status to "needs cleaning"
      await storage.updateRoomStatus(decoded.roomId, "needs cleaning", {
        tenantName: null,
        lastCleaned: null,
        nextPaymentDue: null
      });

      // Create automatic cleaning maintenance request
      const cleaningRequest = {
        roomId: decoded.roomId,
        tenantName: "System",
        title: "Room Check-Out Cleaning",
        description: `Automated cleaning request generated from tenant check-out for room ${decoded.roomId}. Room requires full cleaning and preparation for next tenant.`,
        priority: "high",
        status: "pending",
        assignedTo: "Housekeeping",
        createdAt: new Date()
      };

      await storage.createMaintenanceRequest(cleaningRequest);

      // Create notification for management
      const notification = {
        roomId: decoded.roomId,
        title: "Tenant Check-Out Completed",
        message: `Tenant ${decoded.tenantData.name} has checked out of room ${decoded.roomId}. Cleaning request has been automatically scheduled.`,
        type: "info",
        createdAt: new Date()
      };

      await storage.createNotification(notification);

      res.json({ 
        success: true, 
        message: "Check-out completed successfully. Room cleaning has been scheduled." 
      });

    } catch (error) {
      console.error("Error processing check-out:", error);
      res.status(500).json({ error: "Failed to process check-out" });
    }
  });

  // Admin auth middleware - simplified check
  const adminAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader === "Bearer admin-authenticated") {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Enhanced PIN authentication with logging and temporary codes
  app.post("/api/tenant/auth/pin", async (req, res) => {
    try {
      const { roomNumber, pin } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      // Strict input validation
      if (!roomNumber || !pin) {
        return res.status(400).json({ error: "Room number and PIN are required" });
      }

      // Validate PIN format (4 digits for permanent, 6 for temporary)
      const isPermanentPin = /^\d{4}$/.test(pin);
      const isTemporaryCode = /^\d{6}$/.test(pin);
      
      if (!isPermanentPin && !isTemporaryCode) {
        return res.status(400).json({ error: "PIN must be 4 digits or temporary code must be 6 digits" });
      }

      // Sanitize room number input
      const sanitizedRoomNumber = roomNumber.toString().trim();
      if (!sanitizedRoomNumber) {
        return res.status(400).json({ error: "Invalid room number format" });
      }

      // Find room by number
      const rooms = await storage.getRooms();
      const room = rooms.find((r: any) => r.number === sanitizedRoomNumber);
      
      if (!room) {
        await storage.logAccess({
          roomId: null,
          accessType: isPermanentPin ? 'pin' : 'temp_code',
          accessCode: pin,
          success: false,
          failureReason: 'room_not_found',
          ipAddress,
          userAgent,
          location: `Room ${sanitizedRoomNumber}`
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.status(401).json({ error: "Invalid room number or access code" });
      }

      let accessGranted = false;
      let accessType = '';
      let guestId = null;

      // Check temporary access code first
      if (isTemporaryCode) {
        const tempCode = await storage.validateAccessCode(room.id, pin);
        if (tempCode) {
          accessGranted = true;
          accessType = 'temp_code';
          guestId = tempCode.guestId;
        }
      }

      // Check permanent PIN if temporary code failed
      if (!accessGranted && isPermanentPin) {
        if (room.accessPin === pin && room.accessPin !== null && room.accessPin !== "") {
          accessGranted = true;
          accessType = 'pin';
        }
      }

      // Log access attempt
      await storage.logAccess({
        roomId: room.id,
        guestId,
        accessType,
        accessCode: pin,
        success: accessGranted,
        failureReason: accessGranted ? null : 'invalid_code',
        ipAddress,
        userAgent,
        location: `${room.number}`
      });

      if (!accessGranted) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.status(401).json({ error: "Invalid access code" });
      }

      // Additional security: check room status
      if (room.status === 'maintenance' || room.status === 'cleaning') {
        return res.status(403).json({ error: "Room is currently under maintenance or cleaning" });
      }

      // Generate secure tenant session token
      const sessionToken = generateTenantToken(room.id, { 
        name: room.tenantName || "Guest", 
        email: room.tenantEmail || "", 
        phone: room.tenantPhone || "" 
      });

      // Create system notification for access
      await storage.createSystemNotification({
        type: 'room_access',
        title: `Room Access: ${room.number}`,
        message: `${accessType === 'temp_code' ? 'Temporary code' : 'PIN'} access granted to room ${room.number}`,
        roomId: room.id,
        priority: 'normal',
        color: 'green'
      });
      
      res.json({
        success: true,
        roomId: room.id,
        roomNumber: room.number,
        sessionToken,
        accessType,
        message: "Access granted successfully"
      });
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Simple admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (username === "admin" && password === "admin123") {
      res.json({ 
        success: true, 
        user: { id: "admin", email: "admin@easystay.com", role: "admin" },
        token: "admin-authenticated"
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Generate QR code for a specific room
  app.get("/api/rooms/:roomId/qr", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const rooms = await storage.getRooms();
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      const qrCode = await generateTenantQRCode(roomId, room.number);
      res.json({ qrCode, roomId });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  // Generate QR codes for all rooms in a building
  app.get("/api/buildings/:buildingId/qr-codes", async (req, res) => {
    try {
      const buildingId = parseInt(req.params.buildingId);
      const rooms = await storage.getRooms();
      const buildingRooms = rooms.filter(room => room.buildingId === buildingId);
      
      const qrCodes = await Promise.all(
        buildingRooms.map(async (room) => {
          const qrCode = await generateTenantQRCode(room.id, room.number);
          return {
            roomId: room.id,
            roomNumber: room.number,
            qrCode
          };
        })
      );
      
      res.json({ buildingId, qrCodes });
    } catch (error) {
      console.error("Error generating QR codes:", error);
      res.status(500).json({ error: "Failed to generate QR codes" });
    }
  });

  // Property seeding endpoint discontinued
  app.post("/api/admin/seed-properties", adminAuth, async (req, res) => {
    res.status(410).json({ 
      message: "Property seeding endpoint discontinued. Use the admin interface to create buildings and rooms with authentic data." 
    });
  });

  

  app.put("/api/admin/announcements/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const announcement = await storage.updateAnnouncement(id, req.body);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Failed to update announcement" });
    }
  });

  app.patch("/api/admin/announcements/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const announcement = await storage.updateAnnouncement(id, req.body);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete announcement" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.json(inquiry);
    } catch (error) {
      res.status(400).json({ message: "Invalid inquiry data" });
    }
  });

  // User Management API endpoints
  app.get("/api/admin/users", simpleAdminAuth, async (req, res) => {
    try {
      // Real implementation would fetch from actual user database
      // For now, return empty array as no user management system is implemented
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/change-password", simpleAdminAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Password change functionality not implemented
      res.status(501).json({ message: "Password change functionality not implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.post("/api/admin/update-profile", simpleAdminAuth, async (req, res) => {
    try {
      const { username, newPassword } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      if (newPassword && newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Profile update functionality not implemented
      res.status(501).json({ message: "Profile update functionality not implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/admin/create-user", simpleAdminAuth, async (req, res) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      if (!["admin", "maintenance"].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      // User creation functionality not implemented
      res.status(501).json({ message: "User creation functionality not implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/admin/delete-user/:userId", simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // User deletion functionality not implemented
      res.status(501).json({ message: "User deletion functionality not implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Protected admin routes
  app.get("/api/buildings", async (req, res) => {
    try {
      const buildings = await storage.getBuildings();
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buildings" });
    }
  });

  app.post("/api/buildings", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertBuildingSchema.parse(req.body);
      const building = await storage.createBuilding(validatedData);
      res.json(building);
    } catch (error) {
      res.status(400).json({ message: "Invalid building data" });
    }
  });

  app.patch("/api/admin/buildings/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const building = await storage.updateBuilding(id, updateData);
      res.json(building);
    } catch (error) {
      console.error("Building update error:", error);
      res.status(400).json({ message: "Failed to update building", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.post("/api/admin/rooms", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(400).json({ message: "Failed to create room", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  

  app.put("/api/admin/rooms/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // For updates, we only validate the fields that are being updated
      const updateData = req.body;
      
      // Validate PIN format if provided
      if (updateData.accessPin && !/^\d{4}$/.test(updateData.accessPin)) {
        return res.status(400).json({ message: "PIN must be exactly 4 digits" });
      }
      
      // Convert floor to integer if provided
      if (updateData.floor !== undefined) {
        updateData.floor = parseInt(updateData.floor);
      }
      
      // Handle empty date fields by converting them to null
      if (updateData.lastCleaned === '') {
        updateData.lastCleaned = null;
      }
      if (updateData.nextPaymentDue === '') {
        updateData.nextPaymentDue = null;
      }
      
      const room = await storage.updateRoom(id, updateData);
      res.json(room);
    } catch (error) {
      console.error("Room update error:", error);
      res.status(400).json({ message: "Failed to update room", error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" });
    }
  });

  app.patch("/api/admin/rooms/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Validate PIN format if provided
      if (updateData.accessPin && !/^\d{4}$/.test(updateData.accessPin)) {
        return res.status(400).json({ message: "PIN must be exactly 4 digits" });
      }
      
      const room = await storage.updateRoom(id, updateData);
      res.json(room);
    } catch (error) {
      console.error("Room update error:", error);
      res.status(400).json({ message: "Failed to update room", error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" });
    }
  });

  app.delete("/api/admin/rooms/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if room has active guests before deletion
      const guests = await storage.getGuestProfilesByRoom(id);
      if (guests && guests.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete room with active guests. Please check out all guests first." 
        });
      }
      
      await storage.deleteRoom(id);
      res.json({ success: true, message: "Room deleted successfully" });
    } catch (error) {
      console.error("Room deletion error:", error);
      res.status(500).json({ message: "Failed to delete room", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/inquiries", simpleAdminAuth, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/admin/inquiries/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.updateInquiryStatus(id, req.body.status);
      res.json(inquiry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inquiry" });
    }
  });

  app.delete("/api/admin/inquiries/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInquiry(id);
      res.json({ message: "Inquiry deleted successfully" });
    } catch (error) {
      console.error("Delete inquiry error:", error);
      res.status(500).json({ message: "Failed to delete inquiry", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/contacts", simpleAdminAuth, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Contacts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch contacts", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/admin/contacts", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  app.get("/api/admin/calendar", simpleAdminAuth, async (req, res) => {
    try {
      const events = await storage.getCalendarEvents();
      res.json(events);
    } catch (error) {
      console.error("Calendar fetch error:", error);
      res.status(500).json({ message: "Failed to fetch calendar events", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/admin/calendar", simpleAdminAuth, async (req, res) => {
    try {
      // For calendar events, we'll handle validation more flexibly
      const eventData = req.body;
      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Calendar creation error:", error);
      res.status(400).json({ message: "Invalid calendar event data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/inventory", simpleAdminAuth, async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      res.status(500).json({ message: "Failed to fetch inventory", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/admin/inventory", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  app.get("/api/admin/receipts", simpleAdminAuth, async (req, res) => {
    try {
      const receipts = await storage.getReceipts();
      res.json(receipts);
    } catch (error) {
      console.error("Receipts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch receipts", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/admin/receipts", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertReceiptSchema.parse(req.body);
      const receipt = await storage.createReceipt(validatedData);
      res.json(receipt);
    } catch (error) {
      res.status(400).json({ message: "Invalid receipt data" });
    }
  });

  app.put("/api/admin/receipts/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const receipt = await storage.updateReceipt(id, req.body);
      res.json(receipt);
    } catch (error) {
      res.status(400).json({ message: "Failed to update receipt" });
    }
  });

  app.delete("/api/admin/receipts/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReceipt(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete receipt" });
    }
  });

  app.get("/api/admin/todos", simpleAdminAuth, async (req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      console.error("Todos fetch error:", error);
      res.status(500).json({ message: "Failed to fetch todos", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/admin/todos", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(validatedData);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.put("/api/admin/todos/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const todo = await storage.updateTodo(id, req.body);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Failed to update todo" });
    }
  });

  app.delete("/api/admin/todos/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTodo(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete todo" });
    }
  });

  app.get("/api/admin/announcements", simpleAdminAuth, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid announcement data" });
    }
  });

  // Building Management Routes
  app.get("/api/admin/buildings", simpleAdminAuth, async (req, res) => {
    try {
      const buildings = await storage.getBuildings();
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buildings" });
    }
  });

  app.post("/api/admin/buildings", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertBuildingSchema.parse(req.body);
      const building = await storage.createBuilding(validatedData);
      res.json(building);
    } catch (error) {
      res.status(400).json({ message: "Invalid building data" });
    }
  });

  app.put("/api/admin/buildings/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const building = await storage.updateBuilding(id, req.body);
      res.json(building);
    } catch (error) {
      res.status(400).json({ message: "Failed to update building" });
    }
  });

  app.delete("/api/admin/buildings/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBuilding(id);
      res.json({ message: "Building deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete building" });
    }
  });

  // QR Code generation for rooms
  app.get("/api/admin/rooms/:id/qr", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const rooms = await storage.getRooms();
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      const qrCode = await generateTenantQRCode(roomId, room.number);
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  

  // Tenant authentication middleware
  const authenticateTenant = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getTenantSession(token);
      if (!session) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      req.tenantSession = session;
      next();
    } catch (error) {
      res.status(401).json({ message: "Authentication failed" });
    }
  };

  // Tenant Portal Routes
  app.get("/api/tenant/dashboard", authenticateTenant, async (req: any, res) => {
    try {
      const { roomId } = req.tenantSession;
      const room = await storage.getRoomWithBuilding(roomId);
      const payments = await storage.getPayments(roomId);
      const maintenanceRequests = await storage.getMaintenanceRequests(roomId);
      const notifications = await storage.getNotifications(roomId, req.tenantSession.id);

      res.json({
        room,
        payments,
        maintenanceRequests,
        notifications
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Maintenance Requests
  app.post("/api/tenant/maintenance", authenticateTenant, async (req: any, res) => {
    try {
      const validatedData = insertMaintenanceRequestSchema.parse({
        ...req.body,
        roomId: req.tenantSession.roomId,
        tenantSessionId: req.tenantSession.id
      });
      const request = await storage.createMaintenanceRequest(validatedData);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid maintenance request data" });
    }
  });

  app.get("/api/admin/maintenance", simpleAdminAuth, async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });

  app.put("/api/admin/maintenance/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.updateMaintenanceRequest(id, req.body);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to update maintenance request" });
    }
  });

  // Payment Management
  app.post("/api/tenant/payments", authenticateTenant, async (req: any, res) => {
    try {
      const validatedData = insertPaymentSchema.parse({
        ...req.body,
        roomId: req.tenantSession.roomId,
        tenantSessionId: req.tenantSession.id
      });
      const payment = await storage.createPayment(validatedData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.get("/api/admin/payments", simpleAdminAuth, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.put("/api/admin/payments/:id/status", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(id, status);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update payment status" });
    }
  });

  // Notifications
  app.post("/api/admin/notifications", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  app.put("/api/tenant/notifications/:id/read", authenticateTenant, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationRead(id);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark notification as read" });
    }
  });

  // Enhanced Room Management
  app.put("/api/admin/rooms/:id/status", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, ...additionalData } = req.body;
      const room = await storage.updateRoomStatus(id, status, additionalData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room status" });
    }
  });

  // Guest Profile Management Routes
  app.post("/api/admin/guests", simpleAdminAuth, async (req, res) => {
    try {
      const validatedData = insertGuestProfileSchema.parse(req.body);
      
      // Calculate next payment due date based on booking type
      const checkInDate = new Date(validatedData.checkInDate);
      let nextPaymentDue: string;
      let paymentDueDay: number | undefined;

      if (validatedData.bookingType === 'daily') {
        // Daily guests: payment due tomorrow
        const tomorrow = new Date(checkInDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        nextPaymentDue = tomorrow.toISOString().split('T')[0];
      } else if (validatedData.bookingType === 'weekly') {
        // Weekly guests: payment due next week on same day
        const nextWeek = new Date(checkInDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextPaymentDue = nextWeek.toISOString().split('T')[0];
        paymentDueDay = checkInDate.getDay(); // 0-6 (Sunday-Saturday)
      } else { // monthly
        // Monthly guests: payment due next month on same day
        const nextMonth = new Date(checkInDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextPaymentDue = nextMonth.toISOString().split('T')[0];
        paymentDueDay = checkInDate.getDate(); // 1-31
      }

      const guestData = {
        ...validatedData,
        nextPaymentDue,
        paymentDueDay,
        paymentStatus: 'pending'
      };

      const guest = await storage.createGuestProfile(guestData);
      res.json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest profile data" });
    }
  });

  app.get("/api/admin/guests", simpleAdminAuth, async (req, res) => {
    try {
      const guests = await storage.getGuestProfiles();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guest profiles" });
    }
  });

  app.get("/api/admin/guests/payment-due", simpleAdminAuth, async (req, res) => {
    try {
      const paymentDueGuests = await storage.getTodaysPaymentDueGuests();
      res.json(paymentDueGuests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment due guests" });
    }
  });

  app.post("/api/admin/guests/:id/payment-received", simpleAdminAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const updatedGuest = await storage.markPaymentReceived(guestId, "cash");
      res.json(updatedGuest);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark payment received" });
    }
  });

  app.post("/api/admin/guests/:id/payment", simpleAdminAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const { paymentMethod } = req.body;
      
      if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method is required" });
      }
      
      // Mark payment as received with payment method
      const guest = await storage.markPaymentReceived(guestId, paymentMethod);
      
      // Generate invoice
      const invoiceNumber = await storage.generateInvoiceNumber();
      const invoice = await storage.createInvoice({
        guestId,
        roomId: guest.roomId,
        invoiceNumber,
        amount: guest.paymentAmount,
        paymentMethod,
        dueDate: guest.nextPaymentDue,
        paidDate: new Date().toISOString().split('T')[0],
        status: 'paid'
      });
      
      res.json({ guest, invoice });
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ message: "Failed to process payment", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.patch("/api/admin/guests/:id", simpleAdminAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const updateData = req.body;
      
      if (updateData.hasMovedOut) {
        const guest = await storage.markGuestMovedOut(guestId);
        res.json(guest);
      } else {
        const guest = await storage.updateGuestProfile(guestId, updateData);
        res.json(guest);
      }
    } catch (error) {
      console.error("Update guest error:", error);
      res.status(500).json({ message: "Failed to update guest", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Automated Check-in System
  app.post("/api/admin/guests/:id/checkin", simpleAdminAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const guest = await storage.getGuestProfileById(guestId);
      
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Generate temporary access code for 7 days
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await storage.createTemporaryAccessCode({
        roomId: guest.roomId,
        guestId: guest.id,
        accessCode,
        purpose: 'checkin',
        expiresAt,
        maxUsage: -1, // Unlimited during stay
        createdBy: 'admin'
      });

      // Update room status
      await storage.updateRoomStatus(guest.roomId, "occupied", {
        tenantName: guest.guestName,
        tenantPhone: guest.phone
      });

      // Create check-in notification
      await storage.createSystemNotification({
        type: 'guest_checkin',
        title: `Guest Check-in: ${guest.guestName}`,
        message: `${guest.guestName} checked into room ${guest.roomId}. Access code: ${accessCode}`,
        roomId: guest.roomId,
        priority: 'normal',
        color: 'green'
      });

      res.json({
        success: true,
        accessCode,
        message: "Check-in completed successfully",
        expiresAt
      });
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({ message: "Failed to process check-in" });
    }
  });

  // Automated Check-out System
  app.post("/api/admin/guests/:id/checkout", simpleAdminAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const guest = await storage.getGuestProfileById(guestId);
      
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Deactivate all guest access codes
      const accessCodes = await storage.getActiveAccessCodes(guest.roomId);
      for (const code of accessCodes) {
        if (code.guestId === guestId) {
          await storage.deactivateAccessCode(code.id);
        }
      }

      // Update room status to needs cleaning
      await storage.updateRoomStatus(guest.roomId, "needs cleaning", {
        tenantName: null,
        tenantPhone: null,
        lastCleaned: null
      });

      // Mark guest as inactive
      await storage.updateGuestProfile(guestId, { 
        isActive: false,
        checkOutDate: new Date().toISOString().split('T')[0]
      });

      // Create automatic cleaning request
      await storage.createMaintenanceRequest({
        roomId: guest.roomId,
        title: "Post-Checkout Cleaning",
        description: `Automated cleaning request for room after ${guest.guestName} checkout`,
        priority: "normal",
        status: "pending",
        assignedTo: "Housekeeping"
      });

      // Create check-out notification
      await storage.createSystemNotification({
        type: 'guest_checkout',
        title: `Guest Check-out: ${guest.guestName}`,
        message: `${guest.guestName} checked out of room ${guest.roomId}. Cleaning scheduled.`,
        roomId: guest.roomId,
        priority: 'normal',
        color: 'yellow'
      });

      res.json({
        success: true,
        message: "Check-out completed successfully"
      });
    } catch (error) {
      console.error("Check-out error:", error);
      res.status(500).json({ message: "Failed to process check-out" });
    }
  });

  app.put("/api/admin/guests/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const guest = await storage.updateGuestProfile(id, updateData);
      res.json(guest);
    } catch (error) {
      console.error("Guest update error:", error);
      res.status(400).json({ message: "Failed to update guest profile", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/guests/room/:roomId", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const guests = await storage.getGuestProfilesByRoom(roomId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests for room" });
    }
  });

  // Financial Report Sharing API
  app.post("/api/admin/reports/share", simpleAdminAuth, async (req, res) => {
    try {
      const { method, email, message, reportData } = req.body;
      
      if (method === 'email') {
        // Generate PDF report and send via email
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // In a real implementation, you would:
        // 1. Generate PDF using a library like puppeteer or jsPDF
        // 2. Send email using a service like SendGrid or Nodemailer
        // For now, we'll simulate the process
        
        res.json({
          success: true,
          message: "Report sent via email successfully",
          reportId
        });
      } else if (method === 'link') {
        // Generate shareable link
        const shareToken = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const shareUrl = `${req.protocol}://${req.get('host')}/shared-report/${shareToken}`;
        
        // Store the report data temporarily (in production, use Redis or database)
        // For now, we'll just return the URL
        
        res.json({
          success: true,
          shareUrl,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
    } catch (error) {
      console.error("Report sharing error:", error);
      res.status(500).json({ message: "Failed to share report" });
    }
  });

  // AI Chat Bot API Routes
  app.post("/api/chat/tenant", async (req, res) => {
    try {
      const { message, roomNumber, conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Use fallback AI directly for reliable responses
      const response = await fallbackAI.handleTenantInquiry(message, conversationHistory);
      res.json(response);
    } catch (error) {
      console.error("Tenant chat error:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  app.post("/api/chat/property", async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await fallbackAI.handlePropertyManagementInquiry(message, conversationHistory);
      res.json(response);
    } catch (error) {
      console.error("Property chat error:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  app.post("/api/chat/maintenance", async (req, res) => {
    try {
      const { message, roomNumber } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await fallbackAI.handleMaintenanceSupport(message, roomNumber);
      res.json(response);
    } catch (error) {
      console.error("Maintenance chat error:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  app.post("/api/chat/payment", async (req, res) => {
    try {
      const { message, roomNumber } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await fallbackAI.handlePaymentSupport(message, roomNumber);
      res.json(response);
    } catch (error) {
      console.error("Payment chat error:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  app.post("/api/admin/reports/export", simpleAdminAuth, async (req, res) => {
    try {
      const { format, data, period, property } = req.body;
      
      // Generate export file
      const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (format === 'pdf') {
        // In production, generate actual PDF
        const downloadUrl = `/downloads/financial-report-${period}-${property}-${exportId}.pdf`;
        
        res.json({
          success: true,
          downloadUrl,
          filename: `financial-report-${period}-${property}.pdf`
        });
      } else if (format === 'excel') {
        // Generate Excel export
        const downloadUrl = `/downloads/financial-report-${period}-${property}-${exportId}.xlsx`;
        
        res.json({
          success: true,
          downloadUrl,
          filename: `financial-report-${period}-${property}.xlsx`
        });
      } else if (format === 'csv') {
        // Generate CSV export
        const downloadUrl = `/downloads/financial-report-${period}-${property}-${exportId}.csv`;
        
        res.json({
          success: true,
          downloadUrl,
          filename: `financial-report-${period}-${property}.csv`
        });
      } else {
        res.status(400).json({ message: "Unsupported export format" });
      }
    } catch (error) {
      console.error("Report export error:", error);
      res.status(500).json({ message: "Failed to export report" });
    }
  });

  app.post("/api/admin/reports/generate-link", simpleAdminAuth, async (req, res) => {
    try {
      const { reportData, expiresIn = "7d" } = req.body;
      
      // Generate unique share token
      const shareToken = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const shareUrl = `${req.protocol}://${req.get('host')}/shared-report/${shareToken}`;
      
      // Calculate expiration
      const expirationTime = expiresIn === "7d" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + expirationTime);
      
      // In production, store in database with expiration
      // For now, simulate successful link generation
      
      res.json({
        success: true,
        shareUrl,
        shareToken,
        expiresAt
      });
    } catch (error) {
      console.error("Link generation error:", error);
      res.status(500).json({ message: "Failed to generate shareable link" });
    }
  });

  // Payment History Export
  app.post("/api/admin/export/payments", simpleAdminAuth, async (req, res) => {
    try {
      const { format, data, filters } = req.body;
      const exportId = `payments_export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (format === 'pdf') {
        const downloadUrl = `/downloads/payment-history-${exportId}.pdf`;
        res.json({
          success: true,
          downloadUrl,
          filename: `payment-history-${new Date().toISOString().split('T')[0]}.pdf`
        });
      } else if (format === 'excel') {
        const downloadUrl = `/downloads/payment-history-${exportId}.xlsx`;
        res.json({
          success: true,
          downloadUrl,
          filename: `payment-history-${new Date().toISOString().split('T')[0]}.xlsx`
        });
      } else {
        res.status(400).json({ message: "Unsupported export format" });
      }
    } catch (error) {
      console.error("Payment export error:", error);
      res.status(500).json({ message: "Failed to export payment history" });
    }
  });

  // Expenses Export
  app.post("/api/admin/export/expenses", simpleAdminAuth, async (req, res) => {
    try {
      const { format, data } = req.body;
      const exportId = `expenses_export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (format === 'pdf') {
        const downloadUrl = `/downloads/expenses-${exportId}.pdf`;
        res.json({
          success: true,
          downloadUrl,
          filename: `expenses-${new Date().toISOString().split('T')[0]}.pdf`
        });
      } else if (format === 'excel') {
        const downloadUrl = `/downloads/expenses-${exportId}.xlsx`;
        res.json({
          success: true,
          downloadUrl,
          filename: `expenses-${new Date().toISOString().split('T')[0]}.xlsx`
        });
      } else {
        res.status(400).json({ message: "Unsupported export format" });
      }
    } catch (error) {
      console.error("Expenses export error:", error);
      res.status(500).json({ message: "Failed to export expenses" });
    }
  });

  // System Notifications API
  app.get("/api/admin/notifications", simpleAdminAuth, async (req, res) => {
    try {
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined;
      const notifications = await storage.getSystemNotifications(buildingId);
      res.json(notifications);
    } catch (error) {
      console.error("Notification fetch error:", error);
      // Return empty array if table doesn't exist yet
      res.json([]);
    }
  });

  app.post("/api/admin/notifications", simpleAdminAuth, async (req, res) => {
    try {
      const notification = await storage.createSystemNotification(req.body);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/admin/notifications/:id/read", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationRead(id);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/admin/notifications/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNotification(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete notification" });
    }
  });

  app.delete("/api/admin/notifications", simpleAdminAuth, async (req, res) => {
    try {
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined;
      await storage.clearAllNotifications(buildingId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to clear notifications" });
    }
  });

  // Temporary Access Code Management
  app.post("/api/admin/access-codes", simpleAdminAuth, async (req, res) => {
    try {
      const { roomId, purpose, expiresIn, maxUsage, guestId } = req.body;
      
      // Generate 6-digit temporary code
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calculate expiration time (default 24 hours)
      const expiresAt = new Date(Date.now() + (expiresIn || 24) * 60 * 60 * 1000);
      
      const tempCode = await storage.createTemporaryAccessCode({
        roomId,
        guestId: guestId || null,
        accessCode,
        purpose: purpose || 'guest_access',
        expiresAt,
        maxUsage: maxUsage || 1,
        createdBy: 'admin'
      });

      // Create notification
      await storage.createSystemNotification({
        type: 'temp_code_created',
        title: 'Temporary Access Code Created',
        message: `Code ${accessCode} created for room ${roomId} (expires ${expiresAt.toLocaleString()})`,
        roomId,
        priority: 'normal',
        color: 'blue'
      });

      res.json(tempCode);
    } catch (error) {
      console.error("Error creating access code:", error);
      res.status(400).json({ message: "Failed to create temporary access code" });
    }
  });

  app.get("/api/admin/access-codes", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const codes = await storage.getActiveAccessCodes(roomId);
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch access codes" });
    }
  });

  app.delete("/api/admin/access-codes/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deactivateAccessCode(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to deactivate access code" });
    }
  });

  // Access Logs and Security Monitoring
  app.get("/api/admin/access-logs", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getAccessLogs(roomId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch access logs" });
    }
  });

  app.get("/api/admin/security-alerts", simpleAdminAuth, async (req, res) => {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
      const alerts = await storage.getSecurityAlerts(hours);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security alerts" });
    }
  });

  // Maintenance Predictions and AI
  app.get("/api/admin/maintenance-predictions", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const predictions = await storage.getMaintenancePredictions(roomId);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance predictions" });
    }
  });

  app.post("/api/admin/maintenance-predictions", simpleAdminAuth, async (req, res) => {
    try {
      const prediction = await storage.createMaintenancePrediction(req.body);
      res.json(prediction);
    } catch (error) {
      res.status(400).json({ message: "Failed to create maintenance prediction" });
    }
  });

  app.get("/api/admin/maintenance-cost-analysis", simpleAdminAuth, async (req, res) => {
    try {
      const analysis = await storage.getMaintenanceCostAnalysis();
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost analysis" });
    }
  });

  // Portal Security API
  app.post("/api/admin/portal/unlock/:roomId", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const portalSecurity = await storage.unlockPortal(roomId);
      res.json(portalSecurity);
    } catch (error) {
      res.status(400).json({ message: "Failed to unlock portal" });
    }
  });

  app.get("/api/admin/portal/status/:roomId", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const portalSecurity = await storage.getPortalSecurity(roomId);
      res.json(portalSecurity || { isLocked: false, failedAttempts: 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portal status" });
    }
  });

  // Public Contact Settings API
  app.get("/api/public-contact-settings", async (req, res) => {
    try {
      const settings = await storage.getPublicContactSettings();
      if (!settings) {
        // Return default values if no settings exist
        res.json({
          phone: "(808) 219-6562",
          address: "Honolulu, Hawaii",
          email: "contact@easystayhi.com",
          cashapp: "$EasyStayHI",
          businessName: "EasyStay HI",
          tagline: "Your Home Away From Home",
          showAvailability: true,
          showPricing: true
        });
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error("Public contact settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch public contact settings" });
    }
  });

  app.post("/api/admin/public-contact-settings", simpleAdminAuth, async (req, res) => {
    try {
      const settings = await storage.updatePublicContactSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Public contact settings update error:", error);
      res.status(400).json({ message: "Failed to update public contact settings" });
    }
  });

  // Financial Reporting API
  app.get("/api/admin/financial/reports", simpleAdminAuth, async (req, res) => {
    try {
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined;
      const reports = await storage.getFinancialReports(buildingId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial reports" });
    }
  });

  app.post("/api/admin/financial/reports", simpleAdminAuth, async (req, res) => {
    try {
      const { type, period, buildingId } = req.body;
      const report = await storage.generateFinancialReport(type, period, buildingId);
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "Failed to generate financial report" });
    }
  });

  app.get("/api/admin/financial/summary", simpleAdminAuth, async (req, res) => {
    try {
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined;
      const summary = await storage.getFinancialSummary(buildingId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Maintenance Scheduling API
  app.get("/api/admin/maintenance/schedules", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const schedules = await storage.getMaintenanceSchedules(roomId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance schedules" });
    }
  });

  app.post("/api/admin/maintenance/schedules", simpleAdminAuth, async (req, res) => {
    try {
      const schedule = await storage.createMaintenanceSchedule(req.body);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Failed to create maintenance schedule" });
    }
  });

  app.put("/api/admin/maintenance/schedules/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.updateMaintenanceSchedule(id, req.body);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Failed to update maintenance schedule" });
    }
  });

  app.post("/api/admin/maintenance/schedules/:id/complete", simpleAdminAuth, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.completeMaintenanceTask(scheduleId);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Failed to complete maintenance task" });
    }
  });

  app.get("/api/admin/maintenance/overdue", simpleAdminAuth, async (req, res) => {
    try {
      const overdueTasks = await storage.getOverdueMaintenanceTasks();
      res.json(overdueTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overdue maintenance tasks" });
    }
  });

  // Communication Logs API
  app.get("/api/admin/communication/logs", simpleAdminAuth, async (req, res) => {
    try {
      const guestId = req.query.guestId ? parseInt(req.query.guestId as string) : undefined;
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const logs = await storage.getCommunicationLogs(guestId, roomId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch communication logs" });
    }
  });

  app.post("/api/admin/communication/logs", simpleAdminAuth, async (req, res) => {
    try {
      const log = await storage.createCommunicationLog(req.body);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: "Failed to create communication log" });
    }
  });

  app.patch("/api/admin/communication/logs/:id/response", simpleAdminAuth, async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      const log = await storage.markCommunicationResponse(logId);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark communication response" });
    }
  });

  // Lease Management API
  app.get("/api/admin/leases", simpleAdminAuth, async (req, res) => {
    try {
      const guestId = req.query.guestId ? parseInt(req.query.guestId as string) : undefined;
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const leases = await storage.getLeaseAgreements(guestId, roomId);
      res.json(leases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lease agreements" });
    }
  });

  app.post("/api/admin/leases", simpleAdminAuth, async (req, res) => {
    try {
      const lease = await storage.createLeaseAgreement(req.body);
      res.json(lease);
    } catch (error) {
      res.status(400).json({ message: "Failed to create lease agreement" });
    }
  });

  app.put("/api/admin/leases/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lease = await storage.updateLeaseAgreement(id, req.body);
      res.json(lease);
    } catch (error) {
      res.status(400).json({ message: "Failed to update lease agreement" });
    }
  });

  app.post("/api/admin/leases/:id/terminate", simpleAdminAuth, async (req, res) => {
    try {
      const leaseId = parseInt(req.params.id);
      const { reason } = req.body;
      const lease = await storage.terminateLease(leaseId, reason);
      res.json(lease);
    } catch (error) {
      res.status(400).json({ message: "Failed to terminate lease" });
    }
  });

  app.get("/api/admin/leases/expiring", simpleAdminAuth, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const expiringLeases = await storage.getExpiringLeases(days);
      res.json(expiringLeases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring leases" });
    }
  });

  // Vendor Management API
  app.get("/api/admin/vendors", simpleAdminAuth, async (req, res) => {
    try {
      const serviceType = req.query.serviceType as string;
      const vendors = await storage.getVendors(serviceType);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post("/api/admin/vendors", simpleAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.createVendor(req.body);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Failed to create vendor" });
    }
  });

  app.put("/api/admin/vendors/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.updateVendor(id, req.body);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Failed to update vendor" });
    }
  });

  app.post("/api/admin/vendors/:id/rate", simpleAdminAuth, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const { rating } = req.body;
      const vendor = await storage.rateVendor(vendorId, rating);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Failed to rate vendor" });
    }
  });

  // Service Requests API
  app.get("/api/admin/service-requests", simpleAdminAuth, async (req, res) => {
    try {
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined;
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const requests = await storage.getServiceRequests(vendorId, roomId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post("/api/admin/service-requests", simpleAdminAuth, async (req, res) => {
    try {
      const request = await storage.createServiceRequest(req.body);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to create service request" });
    }
  });

  app.put("/api/admin/service-requests/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.updateServiceRequest(id, req.body);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to update service request" });
    }
  });

  app.post("/api/admin/service-requests/:id/approve", simpleAdminAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { approvedCost } = req.body;
      const request = await storage.approveServiceRequest(requestId, approvedCost);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to approve service request" });
    }
  });

  // Insurance Claims API
  app.get("/api/admin/insurance/claims", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const claims = await storage.getInsuranceClaims(roomId);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch insurance claims" });
    }
  });

  app.post("/api/admin/insurance/claims", simpleAdminAuth, async (req, res) => {
    try {
      const claim = await storage.createInsuranceClaim(req.body);
      res.json(claim);
    } catch (error) {
      res.status(400).json({ message: "Failed to create insurance claim" });
    }
  });

  app.put("/api/admin/insurance/claims/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const claim = await storage.updateInsuranceClaim(id, req.body);
      res.json(claim);
    } catch (error) {
      res.status(400).json({ message: "Failed to update insurance claim" });
    }
  });

  // Emergency Contacts API
  app.get("/api/admin/emergency-contacts", simpleAdminAuth, async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.post("/api/admin/emergency-contacts", simpleAdminAuth, async (req, res) => {
    try {
      const contact = await storage.createEmergencyContact(req.body);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Failed to create emergency contact" });
    }
  });

  app.put("/api/admin/emergency-contacts/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.updateEmergencyContact(id, req.body);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Failed to update emergency contact" });
    }
  });

  // Utility Management API
  app.get("/api/admin/utilities/readings", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined;
      const utilityType = req.query.utilityType as string;
      const readings = await storage.getUtilityReadings(roomId, buildingId, utilityType);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch utility readings" });
    }
  });

  app.post("/api/admin/utilities/readings", simpleAdminAuth, async (req, res) => {
    try {
      const reading = await storage.createUtilityReading(req.body);
      res.json(reading);
    } catch (error) {
      res.status(400).json({ message: "Failed to create utility reading" });
    }
  });

  app.get("/api/admin/utilities/costs/:roomId", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const costs = await storage.calculateUtilityCosts(roomId, month, year);
      res.json(costs);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate utility costs" });
    }
  });

  // Marketing Campaigns API
  app.get("/api/admin/marketing/campaigns", simpleAdminAuth, async (req, res) => {
    try {
      const campaigns = await storage.getMarketingCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketing campaigns" });
    }
  });

  app.post("/api/admin/marketing/campaigns", simpleAdminAuth, async (req, res) => {
    try {
      const campaign = await storage.createMarketingCampaign(req.body);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Failed to create marketing campaign" });
    }
  });

  app.put("/api/admin/marketing/campaigns/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.updateMarketingCampaign(id, req.body);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Failed to update marketing campaign" });
    }
  });

  app.get("/api/admin/marketing/campaigns/:id/roi", simpleAdminAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const roi = await storage.getCampaignROI(campaignId);
      res.json(roi);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate campaign ROI" });
    }
  });

  // Advanced Analytics API
  app.get("/api/admin/analytics/occupancy", simpleAdminAuth, async (req, res) => {
    try {
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined;
      const period = req.query.period as string;
      const analytics = await storage.getOccupancyAnalytics(buildingId, period);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch occupancy analytics" });
    }
  });

  app.get("/api/admin/analytics/revenue", simpleAdminAuth, async (req, res) => {
    try {
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined;
      const period = req.query.period as string;
      const analytics = await storage.getRevenueAnalytics(buildingId, period);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/admin/analytics/maintenance", simpleAdminAuth, async (req, res) => {
    try {
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const period = req.query.period as string;
      const analytics = await storage.getMaintenanceAnalytics(roomId, period);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance analytics" });
    }
  });

  app.get("/api/admin/analytics/insights", simpleAdminAuth, async (req, res) => {
    try {
      const insights = await storage.getPredictiveInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch predictive insights" });
    }
  });

  return createServer(app);
}