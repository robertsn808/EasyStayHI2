import {
  users,
  buildings,
  rooms,
  inquiries,
  contacts,
  announcements,
  calendarEvents,
  inventory,
  receipts,
  todos,
  type User,
  type UpsertUser,
  type Building,
  type InsertBuilding,
  type Room,
  type InsertRoom,
  type Inquiry,
  type InsertInquiry,
  type Contact,
  type InsertContact,
  type Announcement,
  type InsertAnnouncement,
  type CalendarEvent,
  type InsertCalendarEvent,
  type InventoryItem,
  type InsertInventory,
  type Receipt,
  type InsertReceipt,
  type Todo,
  type InsertTodo,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, desc } from "drizzle-orm";
import * as schema from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Building operations
  createBuilding(building: InsertBuilding): Promise<Building>;
  getBuildings(): Promise<Building[]>;

  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRooms(): Promise<Room[]>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room>;
  getAvailableRoomCount(): Promise<number>;

  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
  updateInquiryStatus(id: number, status: string): Promise<Inquiry>;

  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;

  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAllAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncements(): Promise<Announcement[]>;

  // Calendar operations
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEvents(): Promise<CalendarEvent[]>;

  // Inventory operations
  createInventoryItem(item: InsertInventory): Promise<InventoryItem>;
  getInventory(): Promise<InventoryItem[]>;

  // Receipt operations
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceipts(): Promise<Receipt[]>;

  // Todo operations
  createTodo(todo: InsertTodo): Promise<Todo>;
  getTodos(): Promise<Todo[]>;
  updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;

  // Tenant Session Management
  createTenantSession(data: schema.InsertTenantSession): Promise<schema.TenantSession>;
  getTenantSession(token: string): Promise<schema.TenantSession | undefined>;
  getRoomWithBuilding(roomId: number): Promise<{ room: schema.Room; building: schema.Building } | undefined>;

  // Maintenance Requests
  createMaintenanceRequest(data: schema.InsertMaintenanceRequest): Promise<schema.MaintenanceRequest>;
  getMaintenanceRequests(roomId?: number): Promise<any>;
  updateMaintenanceRequest(id: number, data: Partial<schema.InsertMaintenanceRequest>): Promise<schema.MaintenanceRequest>;

  // Payments
  createPayment(data: schema.InsertPayment): Promise<schema.Payment>;
  getPayments(roomId?: number): Promise<any>;
  updatePaymentStatus(id: number, status: string): Promise<schema.Payment>;

  // Notifications
  createNotification(data: schema.InsertNotification): Promise<schema.Notification>;
  getNotifications(roomId?: number, tenantSessionId?: number): Promise<schema.Notification[]>;
  markNotificationRead(id: number): Promise<schema.Notification>;

  // Room Management Updates
  updateRoomStatus(id: number, status: string, additionalData?: Partial<schema.InsertRoom>): Promise<schema.Room>;
  getRoomsByStatus(status: string): Promise<schema.Room[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Building operations
  async createBuilding(building: InsertBuilding): Promise<Building> {
    const [result] = await db.insert(buildings).values(building).returning();
    return result;
  }

  async getBuildings(): Promise<Building[]> {
    return await db.select().from(buildings);
  }

  // Room operations
  async createRoom(room: InsertRoom): Promise<Room> {
    const [result] = await db.insert(rooms).values(room).returning();
    return result;
  }

  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms);
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room> {
    const [result] = await db.update(rooms).set(room).where(eq(rooms.id, id)).returning();
    return result;
  }

  async getAvailableRoomCount(): Promise<number> {
    const result = await db.select().from(rooms).where(eq(rooms.status, "available"));
    return result.length;
  }

  // Inquiry operations
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [result] = await db.insert(inquiries).values(inquiry).returning();
    return result;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries);
  }

  async updateInquiryStatus(id: number, status: string): Promise<Inquiry> {
    const [result] = await db.update(inquiries).set({ status }).where(eq(inquiries.id, id)).returning();
    return result;
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [result] = await db.insert(contacts).values(contact).returning();
    return result;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  // Announcement operations
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [result] = await db.insert(announcements).values(announcement).returning();
    return result;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements);
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).where(eq(announcements.isActive, true));
  }

  // Calendar operations
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [result] = await db.insert(calendarEvents).values(event).returning();
    return result;
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents);
  }

  // Inventory operations
  async createInventoryItem(item: InsertInventory): Promise<InventoryItem> {
    const [result] = await db.insert(inventory).values(item).returning();
    return result;
  }

  async getInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory);
  }

  // Receipt operations
  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const [result] = await db.insert(receipts).values(receipt).returning();
    return result;
  }

  async getReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts);
  }

  // Todo operations
  async createTodo(todo: InsertTodo): Promise<Todo> {
    const [result] = await db.insert(todos).values(todo).returning();
    return result;
  }

  async getTodos(): Promise<Todo[]> {
    return await db.select().from(todos);
  }

  async updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo> {
    const [result] = await db.update(todos).set(todo).where(eq(todos.id, id)).returning();
    return result;
  }

  async deleteTodo(id: number): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }

  // Tenant Session Management
  async createTenantSession(data: schema.InsertTenantSession) {
    const [session] = await db.insert(schema.tenantSessions).values(data).returning();
    return session;
  }

  async getTenantSession(token: string) {
    const [session] = await db
      .select()
      .from(schema.tenantSessions)
      .where(and(
        eq(schema.tenantSessions.sessionToken, token),
        eq(schema.tenantSessions.isActive, true),
        gt(schema.tenantSessions.expiresAt, new Date())
      ));
    return session;
  }

  async getRoomWithBuilding(roomId: number) {
    const [room] = await db
      .select({
        room: schema.rooms,
        building: schema.buildings
      })
      .from(schema.rooms)
      .leftJoin(schema.buildings, eq(schema.rooms.buildingId, schema.buildings.id))
      .where(eq(schema.rooms.id, roomId));
    return room;
  }

  // Maintenance Requests
  async createMaintenanceRequest(data: schema.InsertMaintenanceRequest) {
    const [request] = await db.insert(schema.maintenanceRequests).values(data).returning();
    return request;
  }

  async getMaintenanceRequests(roomId?: number) {
    const query = db
      .select({
        request: schema.maintenanceRequests,
        room: schema.rooms,
        building: schema.buildings
      })
      .from(schema.maintenanceRequests)
      .leftJoin(schema.rooms, eq(schema.maintenanceRequests.roomId, schema.rooms.id))
      .leftJoin(schema.buildings, eq(schema.rooms.buildingId, schema.buildings.id));

    if (roomId) {
      return await query.where(eq(schema.maintenanceRequests.roomId, roomId)).all();
    }
    return await query.all();
  }

  async updateMaintenanceRequest(id: number, data: Partial<schema.InsertMaintenanceRequest>) {
    const [request] = await db
      .update(schema.maintenanceRequests)
      .set({
        ...data,
        ...(data.status === 'completed' ? { completedAt: new Date() } : {})
      })
      .where(eq(schema.maintenanceRequests.id, id))
      .returning();
    return request;
  }

  // Payments
  async createPayment(data: schema.InsertPayment) {
    const [payment] = await db.insert(schema.payments).values(data).returning();
    return payment;
  }

  async getPayments(roomId?: number) {
    const query = db
      .select({
        payment: schema.payments,
        room: schema.rooms
      })
      .from(schema.payments)
      .leftJoin(schema.rooms, eq(schema.payments.roomId, schema.rooms.id));

    if (roomId) {
      return await query.where(eq(schema.payments.roomId, roomId)).all();
    }
    return await query.all();
  }

  async updatePaymentStatus(id: number, status: string) {
    const [payment] = await db
      .update(schema.payments)
      .set({ status })
      .where(eq(schema.payments.id, id))
      .returning();
    return payment;
  }

  // Notifications
  async createNotification(data: schema.InsertNotification) {
    const [notification] = await db.insert(schema.notifications).values(data).returning();
    return notification;
  }

  async getNotifications(roomId?: number, tenantSessionId?: number) {
    let query = db.select().from(schema.notifications);

    if (roomId) {
      query = query.where(eq(schema.notifications.roomId, roomId));
    }
    if (tenantSessionId) {
      query = query.where(eq(schema.notifications.tenantSessionId, tenantSessionId));
    }

    return await query.orderBy(desc(schema.notifications.createdAt)).all();
  }

  async markNotificationRead(id: number) {
    const [notification] = await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.id, id))
      .returning();
    return notification;
  }

  // Room Management Updates
  async updateRoomStatus(id: number, status: string, additionalData?: Partial<schema.InsertRoom>) {
    const updateData = { status, ...additionalData };
    const [room] = await db
      .update(schema.rooms)
      .set(updateData)
      .where(eq(schema.rooms.id, id))
      .returning();
    return room;
  }

  async getRoomsByStatus(status: string) {
    return await db
      .select()
      .from(schema.rooms)
      .where(eq(schema.rooms.status, status));
  }
}

export const storage = new DatabaseStorage();