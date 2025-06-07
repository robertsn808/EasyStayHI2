import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertInquirySchema, 
  insertContactSchema, 
  insertAnnouncementSchema,
  insertCalendarEventSchema,
  insertInventorySchema,
  insertReceiptSchema,
  insertTodoSchema,
  insertRoomSchema,
  insertBuildingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
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

  const httpServer = createServer(app);
  return httpServer;
}
