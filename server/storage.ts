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
  guestProfiles,
  portalSecurity,
  systemNotifications,
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
  type GuestProfile,
  type InsertGuestProfile,
  type PortalSecurity,
  type InsertPortalSecurity,
  type SystemNotification,
  type InsertSystemNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, desc, asc } from "drizzle-orm";
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
  updateBuilding(id: number, building: Partial<InsertBuilding>): Promise<Building>;
  deleteBuilding(id: number): Promise<void>;

  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRooms(): Promise<Room[]>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room>;
  deleteRoom(id: number): Promise<void>;
  getAvailableRoomCount(): Promise<number>;

  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
  updateInquiryStatus(id: number, status: string): Promise<Inquiry>;
  deleteInquiry(id: number): Promise<void>;

  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;

  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAllAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

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

  // Guest Profile Operations
  createGuestProfile(data: InsertGuestProfile): Promise<GuestProfile>;
  getGuestProfiles(): Promise<GuestProfile[]>;
  getGuestProfilesByRoom(roomId: number): Promise<GuestProfile[]>;
  updateGuestProfile(id: number, data: Partial<InsertGuestProfile>): Promise<GuestProfile>;
  markPaymentReceived(guestId: number): Promise<GuestProfile>;
  getPaymentDueGuests(): Promise<GuestProfile[]>;
  getTodaysPaymentDueGuests(): Promise<GuestProfile[]>;

  // Portal Security Operations
  createPortalSecurity(data: InsertPortalSecurity): Promise<PortalSecurity>;
  getPortalSecurity(roomId: number): Promise<PortalSecurity | undefined>;
  updatePortalSecurity(roomId: number, data: Partial<InsertPortalSecurity>): Promise<PortalSecurity>;
  unlockPortal(roomId: number): Promise<PortalSecurity>;
  recordFailedAttempt(roomId: number, roomNumber: string): Promise<PortalSecurity>;

  // System Notification Operations
  createSystemNotification(data: InsertSystemNotification): Promise<SystemNotification>;
  getSystemNotifications(buildingId?: number): Promise<SystemNotification[]>;
  markSystemNotificationRead(id: number): Promise<SystemNotification>;
  deleteNotification(id: number): Promise<void>;
  clearAllNotifications(buildingId?: number): Promise<void>;

  // Temporary Access Codes
  createTemporaryAccessCode(data: any): Promise<any>;
  getActiveAccessCodes(roomId?: number): Promise<any>;
  validateAccessCode(roomId: number, code: string): Promise<any>;
  deactivateAccessCode(codeId: number): Promise<void>;

  // Access Logs
  logAccess(data: any): Promise<any>;
  getAccessLogs(roomId?: number, limit?: number): Promise<any>;
  getSecurityAlerts(hours?: number): Promise<any>;

  // Maintenance Predictions
  createMaintenancePrediction(data: any): Promise<any>;
  getMaintenancePredictions(roomId?: number): Promise<any>;
  updateMaintenancePrediction(id: number, data: any): Promise<any>;
  getMaintenanceCostAnalysis(): Promise<any>;
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

  async updateBuilding(id: number, buildingData: Partial<InsertBuilding>): Promise<Building> {
    const [building] = await db
      .update(buildings)
      .set(buildingData)
      .where(eq(buildings.id, id))
      .returning();
    return building;
  }

  async deleteBuilding(id: number): Promise<void> {
    await db.delete(buildings).where(eq(buildings.id, id));
  }

  // Room operations
  async createRoom(room: InsertRoom): Promise<Room> {
    const [result] = await db.insert(rooms).values(room).returning();
    return result;
  }

  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).orderBy(asc(rooms.number));
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room> {
    const [result] = await db.update(rooms).set(room).where(eq(rooms.id, id)).returning();
    return result;
  }

  async deleteRoom(id: number): Promise<void> {
    await db.delete(rooms).where(eq(rooms.id, id));
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

  async deleteInquiry(id: number): Promise<void> {
    await db.delete(inquiries).where(eq(inquiries.id, id));
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

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [result] = await db.update(announcements).set(announcement).where(eq(announcements.id, id)).returning();
    return result;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
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
    const [result] = await db
      .select({
        room: schema.rooms,
        building: schema.buildings
      })
      .from(schema.rooms)
      .leftJoin(schema.buildings, eq(schema.rooms.buildingId, schema.buildings.id))
      .where(eq(schema.rooms.id, roomId));

    if (!result || !result.building) {
      throw new Error('Room or building not found');
    }

    return {
      room: result.room,
      building: result.building
    };
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
      return await query.where(eq(schema.maintenanceRequests.roomId, roomId));
    }
    return await query;
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
      return await query.where(eq(schema.payments.roomId, roomId));
    }
    return await query;
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
    const conditions = [];
    if (roomId) {
      conditions.push(eq(schema.notifications.roomId, roomId));
    }
    if (tenantSessionId) {
      conditions.push(eq(schema.notifications.tenantSessionId, tenantSessionId));
    }

    const query = db.select().from(schema.notifications);

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(schema.notifications.createdAt));
    }

    return await query.orderBy(desc(schema.notifications.createdAt));
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

    // Generate 4-digit PIN when room becomes available
    if (status === 'available') {
      const accessPin = Math.floor(1000 + Math.random() * 9000).toString();
      updateData.accessPin = accessPin;
    }

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

  // Guest Profile Operations
  async createGuestProfile(data: InsertGuestProfile): Promise<GuestProfile> {
    const [result] = await db.insert(guestProfiles).values(data).returning();
    return result;
  }

  async getGuestProfiles(): Promise<GuestProfile[]> {
    return await db.select().from(guestProfiles).where(eq(guestProfiles.isActive, true));
  }

  async getGuestProfilesByRoom(roomId: number): Promise<GuestProfile[]> {
    return await db
      .select()
      .from(guestProfiles)
      .where(and(eq(guestProfiles.roomId, roomId), eq(guestProfiles.isActive, true)));
  }

  async updateGuestProfile(id: number, data: Partial<InsertGuestProfile>): Promise<GuestProfile> {
    const [result] = await db
      .update(guestProfiles)
      .set(data)
      .where(eq(guestProfiles.id, id))
      .returning();
    return result;
  }

  async markPaymentReceived(guestId: number): Promise<GuestProfile> {
    const today = new Date().toISOString().split('T')[0];

    // Get the guest profile to calculate next payment date
    const [guest] = await db
      .select()
      .from(guestProfiles)
      .where(eq(guestProfiles.id, guestId));

    if (!guest) {
      throw new Error('Guest profile not found');
    }

    let nextPaymentDue: string;
    const currentDate = new Date();

    // Calculate next payment date based on booking type
    if (guest.bookingType === 'daily') {
      // Next payment due tomorrow
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextPaymentDue = tomorrow.toISOString().split('T')[0];
    } else if (guest.bookingType === 'weekly') {
      // Next payment due next week on the same day
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextPaymentDue = nextWeek.toISOString().split('T')[0];
    } else { // monthly
      // Next payment due next month on the same day
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextPaymentDue = nextMonth.toISOString().split('T')[0];
    }

    const [result] = await db
      .update(guestProfiles)
      .set({
        lastPaymentDate: today,
        nextPaymentDue,
        paymentStatus: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(guestProfiles.id, guestId))
      .returning();

    return result;
  }

  async getPaymentDueGuests(): Promise<GuestProfile[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(guestProfiles)
      .where(
        and(
          eq(guestProfiles.isActive, true),
          eq(guestProfiles.nextPaymentDue, today)
        )
      );
  }

  async getTodaysPaymentDueGuests(): Promise<GuestProfile[]> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = today.getDate();

    return await db
      .select()
      .from(guestProfiles)
      .where(
        and(
          eq(guestProfiles.isActive, true),
          // Either specific date match or recurring payment day match
          // For daily: every day, for weekly: same day of week, for monthly: same day of month
          // This is simplified - in production you'd want more sophisticated date logic
          eq(guestProfiles.nextPaymentDue, todayStr)
        )
      );
  }

  // Portal Security Operations
  async createPortalSecurity(data: schema.InsertPortalSecurity): Promise<schema.PortalSecurity> {
    const [portalSecurity] = await db
      .insert(schema.portalSecurity)
      .values(data)
      .returning();
    return portalSecurity;
  }

  async getPortalSecurity(roomId: number): Promise<schema.PortalSecurity | undefined> {
    const [portalSecurity] = await db
      .select()
      .from(schema.portalSecurity)
      .where(eq(schema.portalSecurity.roomId, roomId));
    return portalSecurity;
  }

  async updatePortalSecurity(roomId: number, data: Partial<schema.InsertPortalSecurity>): Promise<schema.PortalSecurity> {
    const [portalSecurity] = await db
      .update(schema.portalSecurity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.portalSecurity.roomId, roomId))
      .returning();
    return portalSecurity;
  }

  async unlockPortal(roomId: number): Promise<schema.PortalSecurity> {
    const [portalSecurity] = await db
      .update(schema.portalSecurity)
      .set({ 
        isLocked: false,
        failedAttempts: 0,
        lockedAt: null,
        lastAttemptAt: null,
        updatedAt: new Date()
      })
      .where(eq(schema.portalSecurity.roomId, roomId))
      .returning();
    return portalSecurity;
  }

  async recordFailedAttempt(roomId: number, roomNumber: string): Promise<schema.PortalSecurity> {
    const existing = await this.getPortalSecurity(roomId);
    const now = new Date();

    if (!existing) {
      // Create new record
      return await this.createPortalSecurity({
        roomId,
        roomNumber,
        failedAttempts: 1,
        isLocked: false,
        lastAttemptAt: now
      });
    }

    const newFailedAttempts = (existing.failedAttempts || 0) + 1;
    const shouldLock = newFailedAttempts >= 3;

    const [portalSecurity] = await db
      .update(schema.portalSecurity)
      .set({
        failedAttempts: newFailedAttempts,
        isLocked: shouldLock,
        lockedAt: shouldLock ? now : existing.lockedAt,
        lastAttemptAt: now,
        updatedAt: now
      })
      .where(eq(schema.portalSecurity.roomId, roomId))
      .returning();

    // Create notification if locked
    if (shouldLock) {
      await this.createSystemNotification({
        type: 'security_alert',
        title: `Room ${roomNumber} Portal Locked`,
        message: `Room ${roomNumber} has been locked after 3 failed PIN attempts. Click to unlock.`,
        roomId,
        priority: 'urgent',
        color: 'red',
        actionType: 'unlock_portal',
        actionData: JSON.stringify({ roomId, roomNumber })
      });
    }

    return portalSecurity;
  }

  // System Notification Operations
  async createSystemNotification(data: schema.InsertSystemNotification): Promise<schema.SystemNotification> {
    const [notification] = await db
      .insert(schema.systemNotifications)
      .values(data)
      .returning();
    return notification;
  }

  async getSystemNotifications(buildingId?: number): Promise<schema.SystemNotification[]> {
    let query = db.select().from(schema.systemNotifications);

    if (buildingId) {
      query = query.where(eq(schema.systemNotifications.buildingId, buildingId));
    }

    return await query.orderBy(desc(schema.systemNotifications.createdAt));
  }

  async markSystemNotificationRead(id: number): Promise<schema.SystemNotification> {
    const [notification] = await db
      .update(schema.systemNotifications)
      .set({ isRead: true })
      .where(eq(schema.systemNotifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    await db
      .delete(schema.systemNotifications)
      .where(eq(schema.systemNotifications.id, id));
  }

  async clearAllNotifications(buildingId?: number): Promise<void> {
    let deleteQuery = db.delete(schema.systemNotifications);

    if (buildingId) {
      deleteQuery = deleteQuery.where(eq(schema.systemNotifications.buildingId, buildingId));
    }

    await deleteQuery;
  }

  // Temporary Access Codes
  async createTemporaryAccessCode(data: any) {
    const [code] = await db.insert(schema.temporaryAccessCodes)
      .values(data)
      .returning();
    return code;
  }

  async getActiveAccessCodes(roomId?: number) {
    const query = db.select().from(schema.temporaryAccessCodes)
      .where(and(
        eq(schema.temporaryAccessCodes.isActive, true),
        gt(schema.temporaryAccessCodes.expiresAt, new Date())
      ));

    if (roomId) {
      return query.where(eq(schema.temporaryAccessCodes.roomId, roomId));
    }
    return query;
  }

  async validateAccessCode(roomId: number, code: string) {
    const [accessCode] = await db.select()
      .from(schema.temporaryAccessCodes)
      .where(and(
        eq(schema.temporaryAccessCodes.roomId, roomId),
        eq(schema.temporaryAccessCodes.accessCode, code),
        eq(schema.temporaryAccessCodes.isActive, true),
        gt(schema.temporaryAccessCodes.expiresAt, new Date())
      ));

    if (!accessCode) return null;

    // Check usage limits
    if (accessCode.maxUsage > 0 && accessCode.usageCount >= accessCode.maxUsage) {
      return null;
    }

    // Increment usage count
    await db.update(schema.temporaryAccessCodes)
      .set({ usageCount: accessCode.usageCount + 1 })
      .where(eq(schema.temporaryAccessCodes.id, accessCode.id))
      .returning();

    return accessCode;
  }

  async deactivateAccessCode(codeId: number) {
    await db.update(schema.temporaryAccessCodes)
      .set({ isActive: false })
      .where(eq(schema.temporaryAccessCodes.id, codeId));
  }

  // Access Logs
  async logAccess(data: any) {
    const [log] = await db.insert(schema.accessLogs)
      .values(data)
      .returning();
    return log;
  }

  async getAccessLogs(roomId?: number, limit = 50) {
    let query = db.select()
      .from(schema.accessLogs)
      .orderBy(desc(schema.accessLogs.timestamp))
      .limit(limit);

    if (roomId) {
      query = query.where(eq(schema.accessLogs.roomId, roomId));
    }

    return query;
  }

  async getSecurityAlerts(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select()
      .from(schema.accessLogs)
      .where(and(
        eq(schema.accessLogs.success, false),
        gt(schema.accessLogs.timestamp, since)
      ))
      .orderBy(desc(schema.accessLogs.timestamp));
  }

  // Maintenance Predictions
  async createMaintenancePrediction(data: any) {
    const [prediction] = await db.insert(schema.maintenancePredictions)
      .values(data)
      .returning();
    return prediction;
  }

  async getMaintenancePredictions(roomId?: number) {
    let query = db.select().from(schema.maintenancePredictions)
      .where(eq(schema.maintenancePredictions.status, 'pending'))
      .orderBy(desc(schema.maintenancePredictions.priority), schema.maintenancePredictions.predictedFailureDate);

    if (roomId) {
      query = query.where(eq(schema.maintenancePredictions.roomId, roomId));
    }

    return query;
  }

  async updateMaintenancePrediction(id: number, data: any) {
    const [prediction] = await db.update(schema.maintenancePredictions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.maintenancePredictions.id, id))
      .returning();
    return prediction;
  }

  async getMaintenanceCostAnalysis() {
    // Returns cost analysis and optimization suggestions
    const predictions = await db.select().from(schema.maintenancePredictions);

    const totalEstimatedCost = predictions.reduce((sum, p) => 
      sum + (parseFloat(p.estimatedCost || '0')), 0);

    const urgentItems = predictions.filter(p => p.priority === 'urgent').length;
    const preventiveItems = predictions.filter(p => p.maintenanceType === 'preventive').length;

    return {
      totalEstimatedCost,
      urgentItems,
      preventiveItems,
      suggestions: this.generateCostOptimizationSuggestions(predictions)
    };
  }

  private generateCostOptimizationSuggestions(predictions: any[]) {
    const suggestions = [];

    // Group by maintenance type
    const preventive = predictions.filter(p => p.maintenanceType === 'preventive');
    if (preventive.length > 0) {
      suggestions.push({
        type: 'bulk_scheduling',
        message: `Schedule ${preventive.length} preventive maintenance items together to reduce service call costs`,
        savings: Math.round(preventive.length * 75) // Estimated $75 savings per combined service
      });
    }

    // High confidence predictions
    const highConfidence = predictions.filter(p => parseFloat(p.confidenceScore || '0') > 0.8);
    if (highConfidence.length > 0) {
      suggestions.push({
        type: 'proactive_replacement',
        message: `${highConfidence.length} items have high failure probability - consider proactive replacement`,
        savings: Math.round(highConfidence.length * 200) // Emergency vs planned cost difference
      });
    }

    return suggestions;
  }
}

export const storage = new DatabaseStorage();