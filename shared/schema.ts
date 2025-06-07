
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
  nextPaymentDue: date("next_payment_due"),
  rentalRate: numeric("rental_rate", { precision: 10, scale: 2 }),
  rentalPeriod: varchar("rental_period", { length: 20 }), // daily, weekly, monthly
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
  message: text("message").notNull(),
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

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, closed
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

// Type definitions for inserts
export type InsertUser = typeof users.$inferSelect;
export type InsertBuilding = typeof buildings.$inferInsert;
export type InsertRoom = typeof rooms.$inferInsert;
export type InsertTenantSession = typeof tenantSessions.$inferInsert;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;
export type InsertPayment = typeof payments.$inferInsert;
export type InsertNotification = typeof notifications.$inferInsert;
export type InsertAnnouncement = typeof announcements.$inferInsert;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;
export type InsertInquiry = typeof inquiries.$inferInsert;
export type InsertTodo = typeof todos.$inferInsert;

// Type definitions for selects
export type SelectUser = typeof users.$inferSelect;
export type SelectBuilding = typeof buildings.$inferSelect;
export type SelectRoom = typeof rooms.$inferSelect;
export type SelectTenantSession = typeof tenantSessions.$inferSelect;
export type SelectMaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type SelectPayment = typeof payments.$inferSelect;
export type SelectNotification = typeof notifications.$inferSelect;
export type SelectAnnouncement = typeof announcements.$inferSelect;
export type SelectCalendarEvent = typeof calendarEvents.$inferSelect;
export type SelectInquiry = typeof inquiries.$inferSelect;
export type SelectTodo = typeof todos.$inferSelect;
