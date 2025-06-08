import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdminAuthenticated, validateAdminCredentials } from "./replitAuth";
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
      const qrCode = await generateTenantQRCode(roomId);
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
      const qrCode = await generateTenantQRCode(roomId);
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
          const qrCode = await generateTenantQRCode(room.id);
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

  app.get("/api/admin/announcements", adminAuth, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid announcement data" });
    }
  });

  app.put("/api/admin/announcements/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAnnouncementSchema.parse(req.body);
      // For simplicity, we'll use create and delete pattern since there's no update method
      res.status(501).json({ message: "Update not implemented yet" });
    } catch (error) {
      res.status(400).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // For simplicity, we'll return not implemented
      res.status(501).json({ message: "Delete not implemented yet" });
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

  // Protected admin routes
  app.get("/api/buildings", async (req, res) => {
    try {
      const buildings = await storage.getBuildings();
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buildings" });
    }
  });

  app.post("/api/buildings", isAdminAuthenticated, async (req, res) => {
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

  app.post("/api/rooms", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.get("/api/admin/rooms", isAdminAuthenticated, async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/admin/rooms", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.put("/api/admin/rooms/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.updateRoom(id, validatedData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room" });
    }
  });

  app.get("/api/admin/inquiries", isAdminAuthenticated, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.put("/api/admin/inquiries/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.updateInquiryStatus(id, req.body.status);
      res.json(inquiry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inquiry" });
    }
  });

  app.get("/api/admin/contacts", isAdminAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/admin/contacts", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  app.get("/api/admin/calendar", isAdminAuthenticated, async (req, res) => {
    try {
      const events = await storage.getCalendarEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/admin/calendar", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid calendar event data" });
    }
  });

  app.get("/api/admin/inventory", isAdminAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post("/api/admin/inventory", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  app.get("/api/admin/receipts", isAdminAuthenticated, async (req, res) => {
    try {
      const receipts = await storage.getReceipts();
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  app.post("/api/admin/receipts", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReceiptSchema.parse(req.body);
      const receipt = await storage.createReceipt(validatedData);
      res.json(receipt);
    } catch (error) {
      res.status(400).json({ message: "Invalid receipt data" });
    }
  });

  app.get("/api/admin/todos", isAdminAuthenticated, async (req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.post("/api/admin/todos", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(validatedData);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.put("/api/admin/todos/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const todo = await storage.updateTodo(id, req.body);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Failed to update todo" });
    }
  });

  app.delete("/api/admin/todos/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTodo(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete todo" });
    }
  });

  app.get("/api/admin/announcements", isAdminAuthenticated, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid announcement data" });
    }
  });

  app.post("/api/admin/buildings", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBuildingSchema.parse(req.body);
      const building = await storage.createBuilding(validatedData);
      res.json(building);
    } catch (error) {
      res.status(400).json({ message: "Invalid building data" });
    }
  });

  // QR Code generation for rooms
  app.get("/api/admin/rooms/:id/qr", isAdminAuthenticated, async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const qrCode = await generateTenantQRCode(roomId);
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Tenant Portal Authentication
  app.post("/api/tenant/signin", async (req, res) => {
    try {
      const { roomId, tenantName, tenantEmail, tenantPhone } = req.body;
      
      if (!roomId || !tenantName) {
        return res.status(400).json({ message: "Room ID and tenant name required" });
      }

      // Check if room exists
      const room = await storage.getRoomWithBuilding(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Generate session token
      const sessionToken = generateTenantToken(roomId, { name: tenantName, email: tenantEmail, phone: tenantPhone });
      
      // Create tenant session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      const session = await storage.createTenantSession({
        roomId,
        sessionToken,
        tenantName,
        tenantEmail,
        tenantPhone,
        expiresAt
      });

      res.json({ sessionToken, session });
    } catch (error) {
      res.status(500).json({ message: "Failed to create tenant session" });
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

  app.get("/api/admin/maintenance", isAdminAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });

  app.put("/api/admin/maintenance/:id", isAdminAuthenticated, async (req, res) => {
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

  app.get("/api/admin/payments", isAdminAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.put("/api/admin/payments/:id/status", isAdminAuthenticated, async (req, res) => {
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
  app.post("/api/admin/notifications", isAdminAuthenticated, async (req, res) => {
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
  app.put("/api/admin/rooms/:id/status", isAdminAuthenticated, async (req, res) => {
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
  app.post("/api/admin/guests", isAdminAuthenticated, async (req, res) => {
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

  app.get("/api/admin/guests", isAdminAuthenticated, async (req, res) => {
    try {
      const guests = await storage.getGuestProfiles();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guest profiles" });
    }
  });

  app.get("/api/admin/guests/payment-due", isAdminAuthenticated, async (req, res) => {
    try {
      const paymentDueGuests = await storage.getTodaysPaymentDueGuests();
      res.json(paymentDueGuests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment due guests" });
    }
  });

  app.post("/api/admin/guests/:id/payment-received", isAdminAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const updatedGuest = await storage.markPaymentReceived(guestId);
      res.json(updatedGuest);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark payment received" });
    }
  });

  app.get("/api/admin/guests/room/:roomId", isAdminAuthenticated, async (req, res) => {
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
import express from 'express';
import { generateQRCode } from './qrGenerator';

const router = express.Router();

router.get('/api/generate-qrcode/:tenantId', async (req, res) => {
    const { tenantId } = req.params;
    try {
        const qrCodeDataUrl = await generateQRCode(tenantId);
        res.json({ qrCodeDataUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

export default router;