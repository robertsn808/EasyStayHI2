
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  numeric,
  date,
} from "drizzle-orm/pg-core";

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 50 }).notNull(),
  buildingId: integer("building_id").references(() => buildings.id),
  status: varchar("status", { length: 50 }).notNull().default("available"), // available, occupied, needs_cleaning, out_of_service
  size: varchar("size", { length: 50 }).default("standard"), // standard, large
  floor: integer("floor").default(1),
  lastCleaned: date("last_cleaned"),
  tenantName: varchar("tenant_name", { length: 255 }),
  tenantPhone: varchar("tenant_phone", { length: 50 }),
  nextPaymentDue: date("next_payment_due"),
  rentalRate: numeric("rental_rate", { precision: 10, scale: 2 }),
  rentalPeriod: varchar("rental_period", { length: 20 }), // daily, weekly, monthly
  accessPin: varchar("access_pin", { length: 4 }), // 4-digit PIN for tenant access
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantSessions = pgTable("tenant_sessions", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  tenantName: varchar("tenant_name", { length: 255 }).notNull(),
  tenantEmail: varchar("tenant_email", { length: 255 }),
  tenantPhone: varchar("tenant_phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  tenantSessionId: integer("tenant_session_id").references(() => tenantSessions.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).default("normal"), // urgent, normal, low
  status: varchar("status", { length: 50 }).default("submitted"), // submitted, in_progress, completed
  assignedTo: varchar("assigned_to", { length: 255 }),
  photoUrls: text("photo_urls"), // JSON array of photo URLs
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  tenantSessionId: integer("tenant_session_id").references(() => tenantSessions.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, failed
  receiptUrl: varchar("receipt_url", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id),
  tenantSessionId: integer("tenant_session_id").references(() => tenantSessions.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info"), // info, warning, payment, maintenance
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).default("info"), // info, warning, success
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const guestProfiles = pgTable("guest_profiles", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  bookingType: varchar("booking_type", { length: 20 }).notNull(), // daily, weekly, monthly
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date"),
  paymentAmount: numeric("payment_amount", { precision: 10, scale: 2 }).notNull(),
  paymentDueDay: integer("payment_due_day"), // day of week (0-6) for weekly, day of month (1-31) for monthly
  lastPaymentDate: date("last_payment_date"),
  nextPaymentDue: date("next_payment_due").notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, paid, overdue
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  roomId: integer("room_id").references(() => rooms.id),
  tenantSessionId: integer("tenant_session_id").references(() => tenantSessions.id),
  eventType: varchar("event_type", { length: 50 }).default("general"), // general, maintenance, inspection, meeting
  isAllDay: boolean("is_all_day").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message"),
  company: varchar("company", { length: 255 }),
  position: varchar("position", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message"),
  contactPreference: varchar("contact_preference", { length: 50 }).default("any"), // phone, text, email, any
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(0),
  category: varchar("category", { length: 100 }),
  location: varchar("location", { length: 255 }),
  condition: varchar("condition", { length: 50 }).default("good"), // good, fair, poor, damaged
  purchaseDate: date("purchase_date"),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  vendor: varchar("vendor", { length: 255 }),
  receiptDate: date("receipt_date").notNull(),
  description: text("description"),
  receiptUrl: varchar("receipt_url", { length: 500 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  roomId: integer("room_id").references(() => rooms.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  priority: varchar("priority", { length: 20 }).default("normal"), // urgent, normal, low
  dueDate: date("due_date"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portalSecurity = pgTable("portal_security", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  roomNumber: varchar("room_number", { length: 10 }).notNull(),
  failedAttempts: integer("failed_attempts").default(0),
  isLocked: boolean("is_locked").default(false),
  lockedAt: timestamp("locked_at"),
  lastAttemptAt: timestamp("last_attempt_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemNotifications = pgTable("system_notifications", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // guest_checkout, new_inquiry, maintenance_request, security_alert
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  buildingId: integer("building_id").references(() => buildings.id),
  roomId: integer("room_id").references(() => rooms.id),
  priority: varchar("priority", { length: 20 }).default("normal"), // urgent, normal, low
  color: varchar("color", { length: 20 }).default("blue"), // red, yellow, blue, green
  isRead: boolean("is_read").default(false),
  actionType: varchar("action_type", { length: 50 }), // unlock_portal, view_inquiry, etc.
  actionData: text("action_data"), // JSON data for actions
  createdAt: timestamp("created_at").defaultNow(),
});

// Type definitions for inserts
export type InsertUser = typeof users.$inferSelect;
export type InsertBuilding = typeof buildings.$inferInsert;
export type InsertRoom = typeof rooms.$inferInsert;
export type InsertTenantSession = typeof tenantSessions.$inferInsert;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;
export type InsertPayment = typeof payments.$inferInsert;
export type InsertNotification = typeof notifications.$inferInsert;
export type InsertContact = typeof contacts.$inferInsert;
export type InsertAnnouncement = typeof announcements.$inferInsert;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;
export type InsertInventory = typeof inventory.$inferInsert;
export type InsertReceipt = typeof receipts.$inferInsert;
export type InsertInquiry = typeof inquiries.$inferInsert;
export type InsertTodo = typeof todos.$inferInsert;
export type InsertGuestProfile = typeof guestProfiles.$inferInsert;
export type InsertPortalSecurity = typeof portalSecurity.$inferInsert;
export type InsertSystemNotification = typeof systemNotifications.$inferInsert;

// Type definitions for selects
export type SelectUser = typeof users.$inferSelect;
export type SelectBuilding = typeof buildings.$inferSelect;
export type SelectRoom = typeof rooms.$inferSelect;
export type SelectTenantSession = typeof tenantSessions.$inferSelect;
export type SelectMaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type SelectPayment = typeof payments.$inferSelect;
export type SelectNotification = typeof notifications.$inferSelect;
export type SelectContact = typeof contacts.$inferSelect;
export type SelectAnnouncement = typeof announcements.$inferSelect;
export type SelectCalendarEvent = typeof calendarEvents.$inferSelect;
export type SelectInventory = typeof inventory.$inferSelect;
export type SelectReceipt = typeof receipts.$inferSelect;
export type SelectInquiry = typeof inquiries.$inferSelect;
export type SelectTodo = typeof todos.$inferSelect;
export type SelectGuestProfile = typeof guestProfiles.$inferSelect;
export type SelectPortalSecurity = typeof portalSecurity.$inferSelect;
export type SelectSystemNotification = typeof systemNotifications.$inferSelect;

// Type aliases for compatibility
export type User = SelectUser;
export type UpsertUser = InsertUser;
export type Building = SelectBuilding;
export type Room = SelectRoom;
export type TenantSession = SelectTenantSession;
export type MaintenanceRequest = SelectMaintenanceRequest;
export type Payment = SelectPayment;
export type Notification = SelectNotification;
export type Inquiry = SelectInquiry;
export type Contact = SelectContact;
export type Announcement = SelectAnnouncement;
export type CalendarEvent = SelectCalendarEvent;
export type InventoryItem = SelectInventory;
export type Receipt = SelectReceipt;
export type Todo = SelectTodo;
export type GuestProfile = SelectGuestProfile;
export type PortalSecurity = SelectPortalSecurity;
export type SystemNotification = SelectSystemNotification;

// Validation schemas (simplified - using the insert types as schemas)
export const insertInquirySchema = {
  parse: (data: any) => data as InsertInquiry
};
export const insertContactSchema = {
  parse: (data: any) => data as InsertContact
};
export const insertAnnouncementSchema = {
  parse: (data: any) => data as InsertAnnouncement
};
export const insertCalendarEventSchema = {
  parse: (data: any) => data as InsertCalendarEvent
};
export const insertInventorySchema = {
  parse: (data: any) => data as InsertInventory
};
export const insertReceiptSchema = {
  parse: (data: any) => data as InsertReceipt
};
export const insertTodoSchema = {
  parse: (data: any) => data as InsertTodo
};
export const insertRoomSchema = {
  parse: (data: any) => data as InsertRoom
};
export const insertBuildingSchema = {
  parse: (data: any) => data as InsertBuilding
};
export const insertTenantSessionSchema = {
  parse: (data: any) => data as InsertTenantSession
};
export const insertMaintenanceRequestSchema = {
  parse: (data: any) => data as InsertMaintenanceRequest
};
export const insertPaymentSchema = {
  parse: (data: any) => data as InsertPayment
};
export const insertNotificationSchema = {
  parse: (data: any) => data as InsertNotification
};
export const insertGuestProfileSchema = {
  parse: (data: any) => data as InsertGuestProfile
};
