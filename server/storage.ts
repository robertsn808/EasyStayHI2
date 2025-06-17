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
  feedback,
  clientInquiries,
  invoices,
  financialReports,
  maintenanceSchedules,
  communicationLogs,
  leaseAgreements,
  vendors,
  serviceRequests,
  insuranceClaims,
  emergencyContacts,
  utilityReadings,
  marketingCampaigns,
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
  type Feedback,
  type InsertFeedback,
  type ClientInquiry,
  type InsertClientInquiry,
  type InsertSystemNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, desc, asc, gte, lte } from "drizzle-orm";
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
  updateReceipt(id: number, receipt: Partial<InsertReceipt>): Promise<Receipt>;
  deleteReceipt(id: number): Promise<void>;

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
  getGuestProfileById(id: number): Promise<GuestProfile | undefined>;
  getGuestProfilesByRoom(roomId: number): Promise<GuestProfile[]>;
  updateGuestProfile(id: number, data: Partial<InsertGuestProfile>): Promise<GuestProfile>;
  markPaymentReceived(guestId: number, paymentMethod: string): Promise<GuestProfile>;
  markGuestMovedOut(guestId: number): Promise<GuestProfile>;
  getPaymentDueGuests(): Promise<GuestProfile[]>;
  getTodaysPaymentDueGuests(): Promise<GuestProfile[]>;
  getPaymentsDueThisWeek(): Promise<GuestProfile[]>;

  // Invoice Operations
  createInvoice(data: any): Promise<any>;
  getInvoices(guestId?: number): Promise<any[]>;
  generateInvoiceNumber(): Promise<string>;

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

  // Public Contact Settings
  getPublicContactSettings(): Promise<schema.PublicContactSettings | undefined>;
  updatePublicContactSettings(data: Partial<schema.InsertPublicContactSettings>): Promise<schema.PublicContactSettings>;

  // Biometric Authentication
  createBiometricCredential(data: schema.InsertBiometricCredential): Promise<schema.BiometricCredential>;
  getBiometricCredential(credentialId: string): Promise<schema.BiometricCredential | undefined>;
  updateBiometricCredentialCounter(credentialId: string, counter: number): Promise<schema.BiometricCredential>;
  deleteBiometricCredential(credentialId: string): Promise<void>;

  // Feedback System
  createFeedback(data: InsertFeedback): Promise<Feedback>;
  getFeedback(filters?: { status?: string; type?: string; priority?: string }): Promise<Feedback[]>;
  updateFeedback(id: number, data: Partial<InsertFeedback>): Promise<Feedback>;

  // Client Inquiries
  createClientInquiry(data: InsertClientInquiry): Promise<ClientInquiry>;
  getClientInquiries(filters?: { status?: string; inquiryType?: string }): Promise<ClientInquiry[]>;
  updateClientInquiry(id: number, data: Partial<InsertClientInquiry>): Promise<ClientInquiry>;
  getAllBiometricCredentials(): Promise<schema.BiometricCredential[]>;

  // Financial Reporting
  generateFinancialReport(type: string, period: string, buildingId?: number): Promise<schema.FinancialReport>;
  getFinancialReports(buildingId?: number): Promise<schema.FinancialReport[]>;
  getFinancialSummary(buildingId?: number): Promise<any>;

  // Maintenance Scheduling
  createMaintenanceSchedule(data: schema.InsertMaintenanceSchedule): Promise<schema.MaintenanceSchedule>;
  getMaintenanceSchedules(roomId?: number): Promise<schema.MaintenanceSchedule[]>;
  updateMaintenanceSchedule(id: number, data: Partial<schema.InsertMaintenanceSchedule>): Promise<schema.MaintenanceSchedule>;
  completeMaintenanceTask(scheduleId: number): Promise<schema.MaintenanceSchedule>;
  getOverdueMaintenanceTasks(): Promise<schema.MaintenanceSchedule[]>;

  // Communication Logs
  createCommunicationLog(data: schema.InsertCommunicationLog): Promise<schema.CommunicationLog>;
  getCommunicationLogs(guestId?: number, roomId?: number): Promise<schema.CommunicationLog[]>;
  markCommunicationResponse(logId: number): Promise<schema.CommunicationLog>;

  // Lease Management
  createLeaseAgreement(data: schema.InsertLeaseAgreement): Promise<schema.LeaseAgreement>;
  getLeaseAgreements(guestId?: number, roomId?: number): Promise<schema.LeaseAgreement[]>;
  updateLeaseAgreement(id: number, data: Partial<schema.InsertLeaseAgreement>): Promise<schema.LeaseAgreement>;
  terminateLease(leaseId: number, reason: string): Promise<schema.LeaseAgreement>;
  getExpiringLeases(days: number): Promise<schema.LeaseAgreement[]>;

  // Vendor Management
  createVendor(data: schema.InsertVendor): Promise<schema.Vendor>;
  getVendors(serviceType?: string): Promise<schema.Vendor[]>;
  updateVendor(id: number, data: Partial<schema.InsertVendor>): Promise<schema.Vendor>;
  rateVendor(vendorId: number, rating: number): Promise<schema.Vendor>;

  // Service Requests
  createServiceRequest(data: schema.InsertServiceRequest): Promise<schema.ServiceRequest>;
  getServiceRequests(vendorId?: number, roomId?: number): Promise<schema.ServiceRequest[]>;
  updateServiceRequest(id: number, data: Partial<schema.InsertServiceRequest>): Promise<schema.ServiceRequest>;
  approveServiceRequest(requestId: number, approvedCost: number): Promise<schema.ServiceRequest>;

  // Insurance Claims
  createInsuranceClaim(data: schema.InsertInsuranceClaim): Promise<schema.InsuranceClaim>;
  getInsuranceClaims(roomId?: number): Promise<schema.InsuranceClaim[]>;
  updateInsuranceClaim(id: number, data: Partial<schema.InsertInsuranceClaim>): Promise<schema.InsuranceClaim>;

  // Emergency Contacts
  createEmergencyContact(data: schema.InsertEmergencyContact): Promise<schema.EmergencyContact>;
  getEmergencyContacts(): Promise<schema.EmergencyContact[]>;
  updateEmergencyContact(id: number, data: Partial<schema.InsertEmergencyContact>): Promise<schema.EmergencyContact>;

  // Utility Management
  createUtilityReading(data: schema.InsertUtilityReading): Promise<schema.UtilityReading>;
  getUtilityReadings(roomId?: number, buildingId?: number, utilityType?: string): Promise<schema.UtilityReading[]>;
  calculateUtilityCosts(roomId: number, month: number, year: number): Promise<any>;

  // Marketing Campaigns
  createMarketingCampaign(data: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign>;
  getMarketingCampaigns(): Promise<schema.MarketingCampaign[]>;
  updateMarketingCampaign(id: number, data: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign>;
  getCampaignROI(campaignId: number): Promise<any>;

  // Advanced Analytics
  getOccupancyAnalytics(buildingId?: number, period?: string): Promise<any>;
  getRevenueAnalytics(buildingId?: number, period?: string): Promise<any>;
  getMaintenanceAnalytics(roomId?: number, period?: string): Promise<any>;
  getPredictiveInsights(): Promise<any>;
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

  async updateReceipt(id: number, receipt: Partial<InsertReceipt>): Promise<Receipt> {
    const [result] = await db.update(receipts).set(receipt).where(eq(receipts.id, id)).returning();
    return result;
  }

  async deleteReceipt(id: number): Promise<void> {
    await db.delete(receipts).where(eq(receipts.id, id));
  }

  // Expense operations
  async createExpense(expense: schema.InsertExpense): Promise<schema.SelectExpense> {
    const [result] = await db.insert(schema.expenses).values(expense).returning();
    return result;
  }

  async getExpenses(): Promise<schema.SelectExpense[]> {
    return await db.select().from(schema.expenses);
  }

  async updateExpense(id: number, expense: Partial<schema.InsertExpense>): Promise<schema.SelectExpense> {
    const [result] = await db.update(schema.expenses).set(expense).where(eq(schema.expenses.id, id)).returning();
    return result;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
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

  async getGuestProfileById(id: number): Promise<GuestProfile | undefined> {
    const [result] = await db.select().from(guestProfiles).where(eq(guestProfiles.id, id));
    return result;
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

  async markPaymentReceived(guestId: number, paymentMethod: string): Promise<GuestProfile> {
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
        lastPaymentMethod: paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(guestProfiles.id, guestId))
      .returning();

    return result;
  }

  async markGuestMovedOut(guestId: number): Promise<GuestProfile> {
    const today = new Date().toISOString().split('T')[0];

    const [result] = await db
      .update(guestProfiles)
      .set({
        hasMovedOut: true,
        moveOutDate: today,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(guestProfiles.id, guestId))
      .returning();

    return result;
  }

  async getPaymentsDueThisWeek(): Promise<GuestProfile[]> {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

    return await db
      .select()
      .from(guestProfiles)
      .where(
        and(
          eq(guestProfiles.isActive, true),
          eq(guestProfiles.hasMovedOut, false),
          gte(guestProfiles.nextPaymentDue, startOfWeek.toISOString().split('T')[0]),
          lte(guestProfiles.nextPaymentDue, endOfWeek.toISOString().split('T')[0])
        )
      )
      .orderBy(asc(guestProfiles.nextPaymentDue));
  }

  async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices this month
    const count = await db
      .select()
      .from(schema.invoices);

    const invoiceNumber = `INV-${year}${month}-${String(count.length + 1).padStart(4, '0')}`;
    return invoiceNumber;
  }

  async createInvoice(data: any): Promise<any> {
    const [result] = await db
      .insert(schema.invoices)
      .values(data)
      .returning();

    return result;
  }

  async getInvoices(guestId?: number): Promise<any[]> {
    if (guestId) {
      return await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.guestId, guestId))
        .orderBy(desc(schema.invoices.createdAt));
    }

    return await db
      .select()
      .from(schema.invoices)
      .orderBy(desc(schema.invoices.createdAt));
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
    if (buildingId) {
      return await db
        .select()
        .from(schema.systemNotifications)
        .where(eq(schema.systemNotifications.buildingId, buildingId))
        .orderBy(desc(schema.systemNotifications.createdAt));
    }

    return await db
      .select()
      .from(schema.systemNotifications)
      .orderBy(desc(schema.systemNotifications.createdAt));
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
    if (buildingId) {
      await db
        .delete(schema.systemNotifications)
        .where(eq(schema.systemNotifications.buildingId, buildingId));
    } else {
      await db.delete(schema.systemNotifications);
    }
  }

  // Temporary Access Codes
  async createTemporaryAccessCode(data: any) {
    const [code] = await db.insert(schema.temporaryAccessCodes)
      .values(data)
      .returning();
    return code;
  }

  async getActiveAccessCodes(roomId?: number) {
    if (roomId) {
      return await db.select().from(schema.temporaryAccessCodes)
        .where(and(
          eq(schema.temporaryAccessCodes.isActive, true),
          gt(schema.temporaryAccessCodes.expiresAt, new Date()),
          eq(schema.temporaryAccessCodes.roomId, roomId)
        ));
    }
    
    return await db.select().from(schema.temporaryAccessCodes)
      .where(and(
        eq(schema.temporaryAccessCodes.isActive, true),
        gt(schema.temporaryAccessCodes.expiresAt, new Date())
      ));
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
    const maxUsage = accessCode.maxUsage ?? 0;
    const usageCount = accessCode.usageCount ?? 0;
    
    if (maxUsage > 0 && usageCount >= maxUsage) {
      return null;
    }

    // Increment usage count
    await db.update(schema.temporaryAccessCodes)
      .set({ usageCount: usageCount + 1 })
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
    if (roomId) {
      return await db.select()
        .from(schema.accessLogs)
        .where(eq(schema.accessLogs.roomId, roomId))
        .orderBy(desc(schema.accessLogs.timestamp))
        .limit(limit);
    }
    
    return await db.select()
      .from(schema.accessLogs)
      .orderBy(desc(schema.accessLogs.timestamp))
      .limit(limit);
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
    if (roomId) {
      return await db.select().from(schema.maintenancePredictions)
        .where(and(
          eq(schema.maintenancePredictions.status, 'pending'),
          eq(schema.maintenancePredictions.roomId, roomId)
        ))
        .orderBy(desc(schema.maintenancePredictions.priority), schema.maintenancePredictions.predictedFailureDate);
    }
    
    return await db.select().from(schema.maintenancePredictions)
      .where(eq(schema.maintenancePredictions.status, 'pending'))
      .orderBy(desc(schema.maintenancePredictions.priority), schema.maintenancePredictions.predictedFailureDate);
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

  async getPublicContactSettings(): Promise<schema.PublicContactSettings | undefined> {
    const result = await db.select().from(schema.publicContactSettings).limit(1);
    return result[0];
  }

  async updatePublicContactSettings(data: Partial<schema.InsertPublicContactSettings>): Promise<schema.PublicContactSettings> {
    // Check if settings exist
    const existing = await this.getPublicContactSettings();
    
    if (existing) {
      // Update existing record
      const result = await db
        .update(schema.publicContactSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.publicContactSettings.id, existing.id))
        .returning();
      return result[0];
    } else {
      // Create new record with defaults
      const result = await db
        .insert(schema.publicContactSettings)
        .values({
          phone: data.phone || "(808) 219-6562",
          address: data.address || "Honolulu, Hawaii",
          email: data.email || "contact@easystayhi.com",
          cashapp: data.cashapp || "$EasyStayHI",
          businessName: data.businessName || "EasyStay HI",
          tagline: data.tagline || "Your Home Away From Home",
          showAvailability: data.showAvailability ?? true,
          showPricing: data.showPricing ?? true,
        })
        .returning();
      return result[0];
    }
  }

  // Biometric Authentication Methods
  async createBiometricCredential(data: schema.InsertBiometricCredential): Promise<schema.BiometricCredential> {
    const [credential] = await db
      .insert(schema.biometricCredentials)
      .values(data)
      .returning();
    return credential;
  }

  async getBiometricCredential(credentialId: string): Promise<schema.BiometricCredential | undefined> {
    const [credential] = await db
      .select()
      .from(schema.biometricCredentials)
      .where(eq(schema.biometricCredentials.credentialId, credentialId));
    return credential;
  }

  async updateBiometricCredentialCounter(credentialId: string, counter: number): Promise<schema.BiometricCredential> {
    const [credential] = await db
      .update(schema.biometricCredentials)
      .set({ 
        counter,
        lastUsed: new Date()
      })
      .where(eq(schema.biometricCredentials.credentialId, credentialId))
      .returning();
    return credential;
  }

  async deleteBiometricCredential(credentialId: string): Promise<void> {
    await db
      .delete(schema.biometricCredentials)
      .where(eq(schema.biometricCredentials.credentialId, credentialId));
  }

  async getAllBiometricCredentials(): Promise<schema.BiometricCredential[]> {
    return await db.select().from(schema.biometricCredentials);
  }

  // Financial Reporting Methods
  async generateFinancialReport(type: string, period: string, buildingId?: number): Promise<schema.FinancialReport> {
    // Calculate revenue from payments and bookings
    const payments = await db.select().from(schema.payments)
      .where(eq(schema.payments.status, 'completed'));
    
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    
    // Calculate expenses from receipts
    const receipts = await db.select().from(schema.receipts);
    const totalExpenses = receipts.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
    
    // Calculate occupancy rate
    const allRooms = await db.select().from(schema.rooms);
    const occupiedRooms = allRooms.filter(r => r.status === 'occupied');
    const occupancyRate = allRooms.length > 0 ? (occupiedRooms.length / allRooms.length) * 100 : 0;
    
    const reportData = {
      reportType: type,
      period: period,
      totalRevenue: totalRevenue.toString(),
      totalExpenses: totalExpenses.toString(),
      netIncome: (totalRevenue - totalExpenses).toString(),
      occupancyRate: occupancyRate.toString(),
      averageDailyRate: occupiedRooms.length > 0 ? (totalRevenue / occupiedRooms.length / 30).toString() : '0',
      revenuePar: allRooms.length > 0 ? (totalRevenue / allRooms.length).toString() : '0',
      buildingId: buildingId,
      generatedBy: 'system'
    };

    const [report] = await db.insert(schema.financialReports)
      .values(reportData)
      .returning();
    return report;
  }

  async getFinancialReports(buildingId?: number): Promise<schema.FinancialReport[]> {
    if (buildingId) {
      return db.select().from(schema.financialReports)
        .where(eq(schema.financialReports.buildingId, buildingId))
        .orderBy(desc(schema.financialReports.generatedAt));
    }
    return db.select().from(schema.financialReports)
      .orderBy(desc(schema.financialReports.generatedAt));
  }

  async getFinancialSummary(buildingId?: number): Promise<any> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get current month revenue
    const payments = await db.select().from(schema.payments)
      .where(eq(schema.payments.status, 'completed'));
    
    const thisMonthRevenue = payments
      .filter(p => p.createdAt && p.createdAt.toISOString().slice(0, 7) === currentMonth)
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    // Get current month expenses from the expenses table
    const expenses = await db.select().from(schema.expenses)
      .where(eq(schema.expenses.status, 'paid'));
    
    const thisMonthExpenses = expenses
      .filter(e => e.expenseDate && e.expenseDate.toString().slice(0, 7) === currentMonth)
      .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);

    return {
      thisMonthRevenue,
      thisMonthExpenses,
      netIncome: thisMonthRevenue - thisMonthExpenses,
      totalPaymentsDue: await this.getPaymentDueGuests().then(guests => 
        guests.reduce((sum, g) => sum + parseFloat(g.paymentAmount || '0'), 0)
      )
    };
  }

  // Maintenance Scheduling Methods
  async createMaintenanceSchedule(data: schema.InsertMaintenanceSchedule): Promise<schema.MaintenanceSchedule> {
    const [schedule] = await db.insert(schema.maintenanceSchedules)
      .values(data)
      .returning();
    return schedule;
  }

  async getMaintenanceSchedules(roomId?: number): Promise<schema.MaintenanceSchedule[]> {
    if (roomId) {
      return db.select().from(schema.maintenanceSchedules)
        .where(and(
          eq(schema.maintenanceSchedules.roomId, roomId),
          eq(schema.maintenanceSchedules.isActive, true)
        ))
        .orderBy(schema.maintenanceSchedules.nextDue);
    }
    return db.select().from(schema.maintenanceSchedules)
      .where(eq(schema.maintenanceSchedules.isActive, true))
      .orderBy(schema.maintenanceSchedules.nextDue);
  }

  async updateMaintenanceSchedule(id: number, data: Partial<schema.InsertMaintenanceSchedule>): Promise<schema.MaintenanceSchedule> {
    const [schedule] = await db.update(schema.maintenanceSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.maintenanceSchedules.id, id))
      .returning();
    return schedule;
  }

  async completeMaintenanceTask(scheduleId: number): Promise<schema.MaintenanceSchedule> {
    const schedule = await db.select().from(schema.maintenanceSchedules)
      .where(eq(schema.maintenanceSchedules.id, scheduleId))
      .limit(1);
    
    if (schedule.length === 0) throw new Error('Schedule not found');
    
    const current = schedule[0];
    const today = new Date();
    let nextDue = new Date(today);
    
    // Calculate next due date based on frequency
    switch (current.frequency) {
      case 'daily':
        nextDue.setDate(today.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(today.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(today.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(today.getMonth() + 3);
        break;
      case 'yearly':
        nextDue.setFullYear(today.getFullYear() + 1);
        break;
    }

    const [updated] = await db.update(schema.maintenanceSchedules)
      .set({
        lastCompleted: today.toISOString().split('T')[0],
        nextDue: nextDue.toISOString().split('T')[0],
        updatedAt: new Date()
      })
      .where(eq(schema.maintenanceSchedules.id, scheduleId))
      .returning();
    
    return updated;
  }

  async getOverdueMaintenanceTasks(): Promise<schema.MaintenanceSchedule[]> {
    const today = new Date().toISOString().split('T')[0];
    return db.select().from(schema.maintenanceSchedules)
      .where(and(
        eq(schema.maintenanceSchedules.isActive, true),
        lte(schema.maintenanceSchedules.nextDue, today)
      ))
      .orderBy(schema.maintenanceSchedules.priority, schema.maintenanceSchedules.nextDue);
  }

  // Communication Logs Methods
  async createCommunicationLog(data: schema.InsertCommunicationLog): Promise<schema.CommunicationLog> {
    const [log] = await db.insert(schema.communicationLogs)
      .values(data)
      .returning();
    return log;
  }

  async getCommunicationLogs(guestId?: number, roomId?: number): Promise<schema.CommunicationLog[]> {
    let query = db.select().from(schema.communicationLogs);
    
    if (guestId && roomId) {
      return query.where(and(
        eq(schema.communicationLogs.guestId, guestId),
        eq(schema.communicationLogs.roomId, roomId)
      )).orderBy(desc(schema.communicationLogs.sentAt));
    } else if (guestId) {
      return query.where(eq(schema.communicationLogs.guestId, guestId))
        .orderBy(desc(schema.communicationLogs.sentAt));
    } else if (roomId) {
      return query.where(eq(schema.communicationLogs.roomId, roomId))
        .orderBy(desc(schema.communicationLogs.sentAt));
    }
    
    return query.orderBy(desc(schema.communicationLogs.sentAt));
  }

  async markCommunicationResponse(logId: number): Promise<schema.CommunicationLog> {
    const [log] = await db.update(schema.communicationLogs)
      .set({
        responseReceived: true,
        responseAt: new Date()
      })
      .where(eq(schema.communicationLogs.id, logId))
      .returning();
    return log;
  }

  // Lease Management Methods
  async createLeaseAgreement(data: schema.InsertLeaseAgreement): Promise<schema.LeaseAgreement> {
    const [lease] = await db.insert(schema.leaseAgreements)
      .values(data)
      .returning();
    return lease;
  }

  async getLeaseAgreements(guestId?: number, roomId?: number): Promise<schema.LeaseAgreement[]> {
    let query = db.select().from(schema.leaseAgreements);
    
    if (guestId && roomId) {
      return query.where(and(
        eq(schema.leaseAgreements.guestId, guestId),
        eq(schema.leaseAgreements.roomId, roomId)
      )).orderBy(desc(schema.leaseAgreements.startDate));
    } else if (guestId) {
      return query.where(eq(schema.leaseAgreements.guestId, guestId))
        .orderBy(desc(schema.leaseAgreements.startDate));
    } else if (roomId) {
      return query.where(eq(schema.leaseAgreements.roomId, roomId))
        .orderBy(desc(schema.leaseAgreements.startDate));
    }
    
    return query.orderBy(desc(schema.leaseAgreements.startDate));
  }

  async updateLeaseAgreement(id: number, data: Partial<schema.InsertLeaseAgreement>): Promise<schema.LeaseAgreement> {
    const [lease] = await db.update(schema.leaseAgreements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.leaseAgreements.id, id))
      .returning();
    return lease;
  }

  async terminateLease(leaseId: number, reason: string): Promise<schema.LeaseAgreement> {
    const [lease] = await db.update(schema.leaseAgreements)
      .set({
        status: 'terminated',
        terminationDate: new Date().toISOString().split('T')[0],
        terminationReason: reason,
        updatedAt: new Date()
      })
      .where(eq(schema.leaseAgreements.id, leaseId))
      .returning();
    return lease;
  }

  async getExpiringLeases(days: number): Promise<schema.LeaseAgreement[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    return db.select().from(schema.leaseAgreements)
      .where(and(
        eq(schema.leaseAgreements.status, 'active'),
        lte(schema.leaseAgreements.endDate, futureDateStr)
      ))
      .orderBy(schema.leaseAgreements.endDate);
  }

  // Vendor Management Methods
  async createVendor(data: schema.InsertVendor): Promise<schema.Vendor> {
    const [vendor] = await db.insert(schema.vendors)
      .values(data)
      .returning();
    return vendor;
  }

  async getVendors(serviceType?: string): Promise<schema.Vendor[]> {
    if (serviceType) {
      return db.select().from(schema.vendors)
        .where(and(
          eq(schema.vendors.serviceType, serviceType),
          eq(schema.vendors.isActive, true)
        ))
        .orderBy(desc(schema.vendors.rating));
    }
    return db.select().from(schema.vendors)
      .where(eq(schema.vendors.isActive, true))
      .orderBy(desc(schema.vendors.rating));
  }

  async updateVendor(id: number, data: Partial<schema.InsertVendor>): Promise<schema.Vendor> {
    const [vendor] = await db.update(schema.vendors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.vendors.id, id))
      .returning();
    return vendor;
  }

  async rateVendor(vendorId: number, rating: number): Promise<schema.Vendor> {
    const [vendor] = await db.update(schema.vendors)
      .set({ 
        rating: rating.toString(),
        updatedAt: new Date()
      })
      .where(eq(schema.vendors.id, vendorId))
      .returning();
    return vendor;
  }

  // Service Request Methods
  async createServiceRequest(data: schema.InsertServiceRequest): Promise<schema.ServiceRequest> {
    const [request] = await db.insert(schema.serviceRequests)
      .values(data)
      .returning();
    return request;
  }

  async getServiceRequests(vendorId?: number, roomId?: number): Promise<schema.ServiceRequest[]> {
    let query = db.select().from(schema.serviceRequests);
    
    if (vendorId && roomId) {
      return query.where(and(
        eq(schema.serviceRequests.vendorId, vendorId),
        eq(schema.serviceRequests.roomId, roomId)
      )).orderBy(desc(schema.serviceRequests.requestedDate));
    } else if (vendorId) {
      return query.where(eq(schema.serviceRequests.vendorId, vendorId))
        .orderBy(desc(schema.serviceRequests.requestedDate));
    } else if (roomId) {
      return query.where(eq(schema.serviceRequests.roomId, roomId))
        .orderBy(desc(schema.serviceRequests.requestedDate));
    }
    
    return query.orderBy(desc(schema.serviceRequests.requestedDate));
  }

  async updateServiceRequest(id: number, data: Partial<schema.InsertServiceRequest>): Promise<schema.ServiceRequest> {
    const [request] = await db.update(schema.serviceRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.serviceRequests.id, id))
      .returning();
    return request;
  }

  async approveServiceRequest(requestId: number, approvedCost: number): Promise<schema.ServiceRequest> {
    const [request] = await db.update(schema.serviceRequests)
      .set({
        status: 'approved',
        actualCost: approvedCost.toString(),
        updatedAt: new Date()
      })
      .where(eq(schema.serviceRequests.id, requestId))
      .returning();
    return request;
  }

  // Insurance Claims Methods
  async createInsuranceClaim(data: schema.InsertInsuranceClaim): Promise<schema.InsuranceClaim> {
    const [claim] = await db.insert(schema.insuranceClaims)
      .values(data)
      .returning();
    return claim;
  }

  async getInsuranceClaims(roomId?: number): Promise<schema.InsuranceClaim[]> {
    if (roomId) {
      return db.select().from(schema.insuranceClaims)
        .where(eq(schema.insuranceClaims.roomId, roomId))
        .orderBy(desc(schema.insuranceClaims.incidentDate));
    }
    return db.select().from(schema.insuranceClaims)
      .orderBy(desc(schema.insuranceClaims.incidentDate));
  }

  async updateInsuranceClaim(id: number, data: Partial<schema.InsertInsuranceClaim>): Promise<schema.InsuranceClaim> {
    const [claim] = await db.update(schema.insuranceClaims)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.insuranceClaims.id, id))
      .returning();
    return claim;
  }

  // Emergency Contacts Methods
  async createEmergencyContact(data: schema.InsertEmergencyContact): Promise<schema.EmergencyContact> {
    const [contact] = await db.insert(schema.emergencyContacts)
      .values(data)
      .returning();
    return contact;
  }

  async getEmergencyContacts(): Promise<schema.EmergencyContact[]> {
    return db.select().from(schema.emergencyContacts)
      .where(eq(schema.emergencyContacts.isActive, true))
      .orderBy(schema.emergencyContacts.priority);
  }

  async updateEmergencyContact(id: number, data: Partial<schema.InsertEmergencyContact>): Promise<schema.EmergencyContact> {
    const [contact] = await db.update(schema.emergencyContacts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.emergencyContacts.id, id))
      .returning();
    return contact;
  }

  // Utility Management Methods
  async createUtilityReading(data: schema.InsertUtilityReading): Promise<schema.UtilityReading> {
    const [reading] = await db.insert(schema.utilityReadings)
      .values(data)
      .returning();
    return reading;
  }

  async getUtilityReadings(roomId?: number, buildingId?: number, utilityType?: string): Promise<schema.UtilityReading[]> {
    let conditions = [];
    
    if (roomId) conditions.push(eq(schema.utilityReadings.roomId, roomId));
    if (buildingId) conditions.push(eq(schema.utilityReadings.buildingId, buildingId));
    if (utilityType) conditions.push(eq(schema.utilityReadings.utilityType, utilityType));
    
    if (conditions.length === 0) {
      return db.select().from(schema.utilityReadings)
        .orderBy(desc(schema.utilityReadings.readingDate));
    }
    
    return db.select().from(schema.utilityReadings)
      .where(and(...conditions))
      .orderBy(desc(schema.utilityReadings.readingDate));
  }

  async calculateUtilityCosts(roomId: number, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const readings = await db.select().from(schema.utilityReadings)
      .where(and(
        eq(schema.utilityReadings.roomId, roomId),
        gte(schema.utilityReadings.readingDate, startDate),
        lte(schema.utilityReadings.readingDate, endDate)
      ));
    
    const totals = readings.reduce((acc, reading) => {
      const type = reading.utilityType;
      const cost = parseFloat(reading.totalCost || '0');
      
      if (!acc[type]) {
        acc[type] = { usage: 0, cost: 0, readings: 0 };
      }
      
      acc[type].usage += parseFloat(reading.usage || '0');
      acc[type].cost += cost;
      acc[type].readings += 1;
      
      return acc;
    }, {} as any);
    
    return {
      month,
      year,
      roomId,
      utilities: totals,
      totalCost: Object.values(totals).reduce((sum: number, util: any) => sum + util.cost, 0)
    };
  }

  // Marketing Campaign Methods
  async createMarketingCampaign(data: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
    const [campaign] = await db.insert(schema.marketingCampaigns)
      .values(data)
      .returning();
    return campaign;
  }

  async getMarketingCampaigns(): Promise<schema.MarketingCampaign[]> {
    return db.select().from(schema.marketingCampaigns)
      .orderBy(desc(schema.marketingCampaigns.startDate));
  }

  async updateMarketingCampaign(id: number, data: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
    const [campaign] = await db.update(schema.marketingCampaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.marketingCampaigns.id, id))
      .returning();
    return campaign;
  }

  async getCampaignROI(campaignId: number): Promise<any> {
    const [campaign] = await db.select().from(schema.marketingCampaigns)
      .where(eq(schema.marketingCampaigns.id, campaignId));
    
    if (!campaign) return null;
    
    const spent = parseFloat(campaign.spent || '0');
    const revenue = parseFloat(campaign.revenue || '0');
    const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : 0;
    
    const conversions = campaign.conversions || 0;
    return {
      campaignId,
      spent,
      revenue,
      roi,
      conversions,
      costPerConversion: conversions > 0 ? spent / conversions : 0,
      revenuePerConversion: conversions > 0 ? revenue / conversions : 0
    };
  }

  // Advanced Analytics Methods
  async getOccupancyAnalytics(buildingId?: number, period?: string): Promise<any> {
    let rooms = await this.getRooms();
    if (buildingId) {
      rooms = rooms.filter(r => r.buildingId === buildingId);
    }
    
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'needs_cleaning' || r.status === 'out_of_service').length;
    
    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
      availabilityRate: totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0
    };
  }

  async getRevenueAnalytics(buildingId?: number, period?: string): Promise<any> {
    const payments = await db.select().from(schema.payments)
      .where(eq(schema.payments.status, 'completed'));
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    
    const thisMonthRevenue = payments
      .filter(p => p.createdAt && p.createdAt.toISOString().slice(0, 7) === currentMonth)
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    
    const lastMonthRevenue = payments
      .filter(p => p.createdAt && p.createdAt.toISOString().slice(0, 7) === lastMonth)
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    
    const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    return {
      thisMonthRevenue,
      lastMonthRevenue,
      growth,
      totalRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0),
      averagePayment: payments.length > 0 ? thisMonthRevenue / payments.filter(p => 
        p.createdAt && p.createdAt.toISOString().slice(0, 7) === currentMonth
      ).length : 0
    };
  }

  async getMaintenanceAnalytics(roomId?: number, period?: string): Promise<any> {
    let requests = await this.getMaintenanceRequests(roomId);
    
    const pending = requests.filter((r: any) => r.status === 'submitted').length;
    const inProgress = requests.filter((r: any) => r.status === 'in_progress').length;
    const completed = requests.filter((r: any) => r.status === 'completed').length;
    
    const urgentRequests = requests.filter((r: any) => r.priority === 'urgent').length;
    
    return {
      totalRequests: requests.length,
      pending,
      inProgress,
      completed,
      urgentRequests,
      completionRate: requests.length > 0 ? (completed / requests.length) * 100 : 0
    };
  }

  async getPredictiveInsights(): Promise<any> {
    const predictions = await this.getMaintenancePredictions();
    const overdueSchedules = await this.getOverdueMaintenanceTasks();
    const expiringLeases = await this.getExpiringLeases(30);
    const paymentsDue = await this.getPaymentDueGuests();
    
    return {
      maintenancePredictions: predictions.length,
      overdueTasks: overdueSchedules.length,
      expiringLeases: expiringLeases.length,
      paymentsDue: paymentsDue.length,
      recommendations: [
        ...overdueSchedules.length > 0 ? [`${overdueSchedules.length} maintenance tasks are overdue`] : [],
        ...expiringLeases.length > 0 ? [`${expiringLeases.length} leases expire within 30 days`] : [],
        ...paymentsDue.length > 0 ? [`${paymentsDue.length} guests have payments due`] : [],
        ...predictions.filter((p: any) => p.priority === 'urgent').length > 0 ? 
          [`${predictions.filter((p: any) => p.priority === 'urgent').length} urgent maintenance predictions`] : []
      ]
    };
  }

  // Feedback System Methods
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const [feedbackRecord] = await db.insert(feedback)
      .values(data)
      .returning();
    return feedbackRecord;
  }

  async getFeedback(filters?: { status?: string; type?: string; priority?: string }): Promise<Feedback[]> {
    let query = db.select().from(feedback);
    
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(feedback.status, filters.status));
      if (filters.type) conditions.push(eq(feedback.type, filters.type));
      if (filters.priority) conditions.push(eq(feedback.priority, filters.priority));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(feedback.createdAt));
  }

  async updateFeedback(id: number, data: Partial<InsertFeedback>): Promise<Feedback> {
    const [feedbackRecord] = await db.update(feedback)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return feedbackRecord;
  }

  // Client Inquiries Methods
  async createClientInquiry(data: InsertClientInquiry): Promise<ClientInquiry> {
    const [inquiry] = await db.insert(clientInquiries)
      .values(data)
      .returning();
    return inquiry;
  }

  async getClientInquiries(filters?: { status?: string; inquiryType?: string }): Promise<ClientInquiry[]> {
    let query = db.select().from(clientInquiries);
    
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(clientInquiries.status, filters.status));
      if (filters.inquiryType) conditions.push(eq(clientInquiries.inquiryType, filters.inquiryType));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(clientInquiries.createdAt));
  }

  async updateClientInquiry(id: number, data: Partial<InsertClientInquiry>): Promise<ClientInquiry> {
    const [inquiry] = await db.update(clientInquiries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clientInquiries.id, id))
      .returning();
    return inquiry;
  }
}

export const storage = new DatabaseStorage();