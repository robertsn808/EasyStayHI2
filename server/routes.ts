import type { Express } from "express";
import { createServer, type Server } from "http";
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

  // Auth routes
  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (validateAdminCredentials(username, password)) {
        // Create a session or token for admin
        res.json({ 
          success: true, 
          message: "Admin login successful",
          user: { username: "Bo$$l@dy", role: "admin" }
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
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

  // PIN authentication endpoint for tenant access
  app.post("/api/tenant/auth/pin", async (req, res) => {
    try {
      const { roomNumber, pin } = req.body;
      
      // Strict input validation
      if (!roomNumber || !pin) {
        return res.status(400).json({ error: "Room number and PIN are required" });
      }

      // Validate PIN format (must be exactly 4 digits)
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: "PIN must be exactly 4 digits" });
      }

      // Sanitize room number input
      const sanitizedRoomNumber = roomNumber.toString().trim();
      if (!sanitizedRoomNumber) {
        return res.status(400).json({ error: "Invalid room number format" });
      }

      // Find room by number and validate PIN with exact match
      const rooms = await storage.getRooms();
      const room = rooms.find((r: any) => 
        r.number === sanitizedRoomNumber && 
        r.accessPin === pin && 
        r.accessPin !== null && 
        r.accessPin !== ""
      );
      
      if (!room) {
        // Add slight delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.status(401).json({ error: "Invalid room number or PIN" });
      }

      // Additional security: check room status
      if (room.status !== 'available') {
        return res.status(403).json({ error: "Room is not available for tenant access" });
      }

      // Generate secure tenant session token with room data
      const sessionToken = generateTenantToken(room.id, { 
        name: room.tenantName || "Tenant", 
        email: room.tenantEmail || "", 
        phone: room.tenantPhone || "" 
      });
      
      res.json({
        success: true,
        roomId: room.id,
        roomNumber: room.number,
        sessionToken,
        message: "PIN authentication successful"
      });
    } catch (error) {
      console.error("PIN authentication error:", error);
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

  // Seed database with buildings and rooms
  app.post("/api/admin/seed-properties", adminAuth, async (req, res) => {
    try {
      // Create buildings
      const building934 = await storage.createBuilding({
        name: "934 Kapahulu Ave",
        address: "934 Kapahulu Ave, Honolulu, HI 96816"
      });

      const building949 = await storage.createBuilding({
        name: "949 Kawaiahao St", 
        address: "949 Kawaiahao St, Honolulu, HI 96813"
      });

      // Create 8 rooms for 934 Kapahulu Ave
      const rooms934 = [];
      for (let i = 1; i <= 8; i++) {
        const room = await storage.createRoom({
          number: `${i.toString().padStart(3, '0')}`,
          buildingId: building934.id,
          status: "available",
          size: "Studio",
          floor: Math.ceil(i / 4),
          rentalRate: "100",
          rentalPeriod: "flexible"
        });
        rooms934.push(room);
      }

      // Create 10 rooms for 949 Kawaiahao St
      const rooms949 = [];
      for (let i = 1; i <= 10; i++) {
        const room = await storage.createRoom({
          number: `${i.toString().padStart(3, '0')}`,
          buildingId: building949.id,
          status: "available", 
          size: "Suite",
          floor: Math.ceil(i / 5),
          rentalRate: "50",
          rentalPeriod: "flexible"
        });
        rooms949.push(room);
      }

      res.json({
        message: "Properties seeded successfully",
        buildings: [building934, building949],
        rooms: [...rooms934, ...rooms949]
      });
    } catch (error) {
      console.error("Error seeding properties:", error);
      res.status(500).json({ error: "Failed to seed properties" });
    }
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
      // Return mock admin users for now - Sesa and webmaster
      const users = [
        {
          id: "sesa",
          username: "Sesa",
          role: "admin",
          createdAt: "2024-01-01T00:00:00Z",
          lastLogin: new Date().toISOString()
        },
        {
          id: "webmaster",
          username: "webmaster",
          role: "maintenance",
          createdAt: "2024-01-01T00:00:00Z",
          lastLogin: null
        }
      ];
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/change-password", simpleAdminAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // In a real implementation, you would verify the current password
      // and update it in your user database
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Mock successful password change
      res.json({ success: true, message: "Password updated successfully" });
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
      
      // Mock successful profile update
      res.json({ success: true, message: "Profile updated successfully" });
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
      
      // Mock successful user creation
      const newUser = {
        id: username.toLowerCase(),
        username,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/admin/delete-user/:userId", simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (userId === "sesa") {
        return res.status(400).json({ message: "Cannot delete main admin account" });
      }
      
      // Mock successful user deletion
      res.json({ success: true, message: "User deleted successfully" });
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
      res.status(400).json({ message: "Failed to update room", error: error.message });
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
      res.status(400).json({ message: "Failed to update room", error: error.message });
    }
  });

  app.get("/api/admin/inquiries", simpleAdminAuth, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries", error: error.message });
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
      res.status(500).json({ message: "Failed to delete inquiry", error: error.message });
    }
  });

  app.get("/api/admin/contacts", simpleAdminAuth, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Contacts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch contacts", error: error.message });
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
      res.status(500).json({ message: "Failed to fetch calendar events", error: error.message });
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
      res.status(400).json({ message: "Invalid calendar event data", error: error.message });
    }
  });

  app.get("/api/admin/inventory", simpleAdminAuth, async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      res.status(500).json({ message: "Failed to fetch inventory", error: error.message });
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
      res.status(500).json({ message: "Failed to fetch receipts", error: error.message });
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

  app.get("/api/admin/todos", simpleAdminAuth, async (req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      console.error("Todos fetch error:", error);
      res.status(500).json({ message: "Failed to fetch todos", error: error.message });
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
      const updatedGuest = await storage.markPaymentReceived(guestId);
      res.json(updatedGuest);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark payment received" });
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
      res.status(400).json({ message: "Failed to update guest profile", error: error.message });
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

  const httpServer = createServer(app);
  return httpServer;
}