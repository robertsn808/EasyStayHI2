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
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  roomNumber: varchar("room_number", { length: 50 }),
  rentalPeriod: varchar("rental_period", { length: 20 }),
  moveInDate: date("move_in_date"),
  message: text("message"),
  status: varchar("status", { length: 20 }).default("new"), // new, responded, archived
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  status: varchar("status", { length: 50 }).default("prospective"), // prospective, current_tenant, former_tenant
  roomNumber: varchar("room_number", { length: 50 }),
  lastContact: date("last_contact"),
  notes: text("notes"),
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

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  type: varchar("type", { length: 50 }).default("task"), // task, maintenance, payment, cleaning
  isCompleted: boolean("is_completed").default(false),
  roomId: integer("room_id").references(() => rooms.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  quantity: integer("quantity").default(0),
  minimumQuantity: integer("minimum_quantity").default(0),
  location: varchar("location", { length: 255 }),
  lastRestocked: date("last_restocked"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  receiptNumber: varchar("receipt_number", { length: 100 }).notNull().unique(),
  tenantName: varchar("tenant_name", { length: 255 }).notNull(),
  roomNumber: varchar("room_number", { length: 50 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  dueDate: date("due_date"),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
  roomId: integer("room_id").references(() => rooms.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertBuildingSchema = createInsertSchema(buildings).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true, status: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true });
export const insertReceiptSchema = createInsertSchema(receipts).omit({ id: true, createdAt: true });
export const insertTodoSchema = createInsertSchema(todos).omit({ id: true, createdAt: true });
export const insertTenantSessionSchema = createInsertSchema(tenantSessions).omit({ id: true, createdAt: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({ id: true, createdAt: true, completedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertBuilding = z.infer<typeof insertBuildingSchema>;
export type Building = typeof buildings.$inferSelect;

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventory.$inferSelect;

export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;

export type InsertTenantSession = z.infer<typeof insertTenantSessionSchema>;
export type TenantSession = typeof tenantSessions.$inferSelect;

export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
