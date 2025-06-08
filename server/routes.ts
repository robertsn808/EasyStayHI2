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
  insertNotificationSchema
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

  app.post("/api/buildings", isAuthenticated, async (req, res) => {
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

  app.post("/api/rooms", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.get("/api/admin/rooms", isAuthenticated, async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/admin/rooms", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.put("/api/admin/rooms/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.updateRoom(id, validatedData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room" });
    }
  });

  app.get("/api/admin/inquiries", isAuthenticated, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.put("/api/admin/inquiries/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.updateInquiryStatus(id, req.body.status);
      res.json(inquiry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inquiry" });
    }
  });

  app.get("/api/admin/contacts", isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/admin/contacts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  app.get("/api/admin/calendar", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getCalendarEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/admin/calendar", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid calendar event data" });
    }
  });

  app.get("/api/admin/inventory", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post("/api/admin/inventory", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  app.get("/api/admin/receipts", isAuthenticated, async (req, res) => {
    try {
      const receipts = await storage.getReceipts();
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  app.post("/api/admin/receipts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReceiptSchema.parse(req.body);
      const receipt = await storage.createReceipt(validatedData);
      res.json(receipt);
    } catch (error) {
      res.status(400).json({ message: "Invalid receipt data" });
    }
  });

  app.get("/api/admin/todos", isAuthenticated, async (req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.post("/api/admin/todos", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(validatedData);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.put("/api/admin/todos/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const todo = await storage.updateTodo(id, req.body);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Failed to update todo" });
    }
  });

  app.delete("/api/admin/todos/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTodo(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete todo" });
    }
  });

  app.get("/api/admin/announcements", isAuthenticated, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid announcement data" });
    }
  });

  app.post("/api/admin/buildings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBuildingSchema.parse(req.body);
      const building = await storage.createBuilding(validatedData);
      res.json(building);
    } catch (error) {
      res.status(400).json({ message: "Invalid building data" });
    }
  });

  // QR Code generation for rooms
  app.get("/api/admin/rooms/:id/qr", isAuthenticated, async (req, res) => {
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

  app.get("/api/admin/maintenance", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });

  app.put("/api/admin/maintenance/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/admin/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.put("/api/admin/payments/:id/status", isAuthenticated, async (req, res) => {
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
  app.post("/api/admin/notifications", isAuthenticated, async (req, res) => {
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
  app.put("/api/admin/rooms/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, ...additionalData } = req.body;
      const room = await storage.updateRoomStatus(id, status, additionalData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room status" });
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