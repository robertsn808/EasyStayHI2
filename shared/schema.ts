
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
  tenantEmail: varchar("tenant_email", { length: 255 }),
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
  sessionToken: text("session_token").notNull().unique(),
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
  hasMovedOut: boolean("has_moved_out").default(false),
  moveOutDate: date("move_out_date"),
  lastPaymentMethod: varchar("last_payment_method", { length: 50 }), // cashapp, venmo, cash, card
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
  checkInDate: date("check_in_date"),
  checkOutDate: date("check_out_date"),
  numberOfGuests: integer("number_of_guests").default(1),
  roomPreference: varchar("room_preference", { length: 100 }), // building preference or room type
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, closed, booked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table for confirmed reservations
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id").references(() => inquiries.id),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  numberOfGuests: integer("number_of_guests").default(1),
  numberOfNights: integer("number_of_nights").notNull(),
  ratePerNight: numeric("rate_per_night", { precision: 10, scale: 2 }).notNull().default("100"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).default("0"),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, partial, paid, refunded
  bookingStatus: varchar("booking_status", { length: 20 }).default("confirmed"), // confirmed, checked_in, checked_out, cancelled
  specialRequests: text("special_requests"),
  notes: text("notes"),
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

export const temporaryAccessCodes = pgTable("temporary_access_codes", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  guestId: integer("guest_id").references(() => guestProfiles.id),
  accessCode: varchar("access_code", { length: 6 }).notNull(), // 6-digit temporary code
  purpose: varchar("purpose", { length: 50 }).notNull(), // checkin, maintenance, cleaning, guest_access
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  usageCount: integer("usage_count").default(0),
  maxUsage: integer("max_usage").default(1), // -1 for unlimited
  createdBy: varchar("created_by", { length: 255 }).notNull(), // admin username
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  guestId: integer("guest_id").references(() => guestProfiles.id),
  accessType: varchar("access_type", { length: 20 }).notNull(), // pin, temp_code, qr_scan, admin_override
  accessCode: varchar("access_code", { length: 10 }), // the code used
  success: boolean("success").notNull(),
  failureReason: varchar("failure_reason", { length: 100 }), // expired, invalid, locked, etc.
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4/IPv6
  userAgent: text("user_agent"),
  location: varchar("location", { length: 100 }), // building/room info
  timestamp: timestamp("timestamp").defaultNow(),
});

export const maintenancePredictions = pgTable("maintenance_predictions", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  itemType: varchar("item_type", { length: 50 }).notNull(), // ac_unit, plumbing, electrical, appliance
  itemName: varchar("item_name", { length: 100 }).notNull(),
  currentCondition: integer("current_condition").notNull(), // 1-10 scale
  predictedFailureDate: date("predicted_failure_date"),
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }), // 0.00-1.00
  maintenanceType: varchar("maintenance_type", { length: 20 }).notNull(), // preventive, corrective, emergency
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  priority: varchar("priority", { length: 20 }).default("normal"), // urgent, high, normal, low
  status: varchar("status", { length: 20 }).default("pending"), // pending, scheduled, completed, ignored
  lastInspectionDate: date("last_inspection_date"),
  usageHours: integer("usage_hours").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").references(() => guestProfiles.id).notNull(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cashapp, venmo, cash, card
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  status: varchar("status", { length: 20 }).default("sent"), // sent, viewed, paid
  invoiceUrl: varchar("invoice_url", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const publicContactSettings = pgTable("public_contact_settings", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  cashapp: varchar("cashapp", { length: 50 }),
  businessName: varchar("business_name", { length: 255 }).default("EasyStay HI"),
  tagline: varchar("tagline", { length: 255 }).default("Your Home Away From Home"),
  showAvailability: boolean("show_availability").default(true),
  showPricing: boolean("show_pricing").default(true),
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
export type InsertTemporaryAccessCode = typeof temporaryAccessCodes.$inferInsert;
export type InsertAccessLog = typeof accessLogs.$inferInsert;
export type InsertMaintenancePrediction = typeof maintenancePredictions.$inferInsert;
export type InsertPublicContactSettings = typeof publicContactSettings.$inferInsert;

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
export type SelectTemporaryAccessCode = typeof temporaryAccessCodes.$inferSelect;
export type SelectAccessLog = typeof accessLogs.$inferSelect;
export type SelectMaintenancePrediction = typeof maintenancePredictions.$inferSelect;
export type SelectPublicContactSettings = typeof publicContactSettings.$inferSelect;

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
export type TemporaryAccessCode = SelectTemporaryAccessCode;
export type AccessLog = SelectAccessLog;
export type MaintenancePrediction = SelectMaintenancePrediction;
export type PublicContactSettings = SelectPublicContactSettings;

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

// Biometric authentication credentials table
export const biometricCredentials = pgTable("biometric_credentials", {
  id: serial("id").primaryKey(),
  credentialId: text("credential_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  deviceType: varchar("device_type", { length: 100 }),
  userHandle: text("user_handle").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

export type BiometricCredential = typeof biometricCredentials.$inferSelect;
export type InsertBiometricCredential = typeof biometricCredentials.$inferInsert;

export const insertBiometricCredentialSchema = {
  parse: (data: any) => data as InsertBiometricCredential
};

// Booking types
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export const insertBookingSchema = {
  parse: (data: any) => data as InsertBooking
};

// Financial Reporting and Analytics
export const financialReports = pgTable("financial_reports", {
  id: serial("id").primaryKey(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // monthly, quarterly, yearly, custom
  period: varchar("period", { length: 20 }).notNull(), // 2024-01, 2024-Q1, 2024
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  totalExpenses: numeric("total_expenses", { precision: 12, scale: 2 }).notNull().default("0"),
  netIncome: numeric("net_income", { precision: 12, scale: 2 }).notNull().default("0"),
  occupancyRate: numeric("occupancy_rate", { precision: 5, scale: 2 }).default("0"), // percentage
  averageDailyRate: numeric("average_daily_rate", { precision: 10, scale: 2 }).default("0"),
  revenuePar: numeric("revenue_par", { precision: 10, scale: 2 }).default("0"), // Revenue Per Available Room
  buildingId: integer("building_id").references(() => buildings.id),
  generatedAt: timestamp("generated_at").defaultNow(),
  generatedBy: varchar("generated_by", { length: 255 }),
});

// Property Maintenance Schedules
export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  taskName: varchar("task_name", { length: 255 }).notNull(),
  taskType: varchar("task_type", { length: 50 }).notNull(), // cleaning, inspection, repair, replacement
  frequency: varchar("frequency", { length: 20 }).notNull(), // daily, weekly, monthly, quarterly, yearly
  lastCompleted: date("last_completed"),
  nextDue: date("next_due").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  assignedTo: varchar("assigned_to", { length: 255 }),
  priority: varchar("priority", { length: 20 }).default("normal"),
  isActive: boolean("is_active").default(true),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Communication Logs
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").references(() => guestProfiles.id),
  roomId: integer("room_id").references(() => rooms.id),
  communicationType: varchar("communication_type", { length: 30 }).notNull(), // sms, email, phone, in_person
  direction: varchar("direction", { length: 10 }).notNull(), // inbound, outbound
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).default("sent"), // sent, delivered, read, failed
  sentBy: varchar("sent_by", { length: 255 }),
  sentAt: timestamp("sent_at").defaultNow(),
  responseReceived: boolean("response_received").default(false),
  responseAt: timestamp("response_at"),
});

// Lease Agreements
export const leaseAgreements = pgTable("lease_agreements", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").references(() => guestProfiles.id).notNull(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  leaseNumber: varchar("lease_number", { length: 50 }).notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: numeric("security_deposit", { precision: 10, scale: 2 }).default("0"),
  paymentFrequency: varchar("payment_frequency", { length: 20 }).notNull(), // daily, weekly, monthly
  terms: text("terms").notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, expired, terminated, renewed
  signedDate: date("signed_date"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  documentUrl: varchar("document_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor Management
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  serviceType: varchar("service_type", { length: 100 }).notNull(), // plumbing, electrical, cleaning, landscaping
  rating: numeric("rating", { precision: 2, scale: 1 }).default("0"), // 0.0 to 5.0
  isActive: boolean("is_active").default(true),
  contractUrl: varchar("contract_url", { length: 500 }),
  insuranceCertUrl: varchar("insurance_cert_url", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Requests to Vendors
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  roomId: integer("room_id").references(() => rooms.id),
  requestType: varchar("request_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  urgency: varchar("urgency", { length: 20 }).default("normal"), // urgent, high, normal, low
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: numeric("actual_cost", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 30 }).default("requested"), // requested, quoted, approved, in_progress, completed, cancelled
  requestedDate: date("requested_date").notNull(),
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Insurance Claims
export const insuranceClaims = pgTable("insurance_claims", {
  id: serial("id").primaryKey(),
  claimNumber: varchar("claim_number", { length: 50 }).notNull().unique(),
  roomId: integer("room_id").references(() => rooms.id),
  incidentDate: date("incident_date").notNull(),
  incidentType: varchar("incident_type", { length: 50 }).notNull(), // damage, theft, liability, other
  description: text("description").notNull(),
  estimatedDamage: numeric("estimated_damage", { precision: 12, scale: 2 }),
  claimAmount: numeric("claim_amount", { precision: 12, scale: 2 }),
  settlementAmount: numeric("settlement_amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 30 }).default("filed"), // filed, under_review, approved, denied, settled
  insuranceCompany: varchar("insurance_company", { length: 255 }),
  policyNumber: varchar("policy_number", { length: 100 }),
  adjusterName: varchar("adjuster_name", { length: 255 }),
  adjusterContact: varchar("adjuster_contact", { length: 100 }),
  documentUrls: text("document_urls"), // JSON array of document URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emergency Contacts and Procedures
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }).notNull(), // police, fire, hospital, utility, landlord
  phone: varchar("phone", { length: 50 }).notNull(),
  alternatePhone: varchar("alternate_phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  availableHours: varchar("available_hours", { length: 100 }), // 24/7, business_hours, emergency_only
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1), // 1 = highest priority
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Utility Tracking
export const utilityReadings = pgTable("utility_readings", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id),
  buildingId: integer("building_id").references(() => buildings.id),
  utilityType: varchar("utility_type", { length: 30 }).notNull(), // electricity, water, gas, internet
  readingDate: date("reading_date").notNull(),
  previousReading: numeric("previous_reading", { precision: 10, scale: 2 }),
  currentReading: numeric("current_reading", { precision: 10, scale: 2 }).notNull(),
  usage: numeric("usage", { precision: 10, scale: 2 }),
  unitCost: numeric("unit_cost", { precision: 10, scale: 4 }),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }),
  billDate: date("bill_date"),
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketing Campaigns
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // email, social_media, paid_ads, referral
  platform: varchar("platform", { length: 50 }), // facebook, instagram, google, airbnb
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  spent: numeric("spent", { precision: 10, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: numeric("revenue", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, active, paused, completed
  targetAudience: text("target_audience"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type definitions for new tables
export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = typeof financialReports.$inferInsert;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = typeof maintenanceSchedules.$inferInsert;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = typeof communicationLogs.$inferInsert;
export type LeaseAgreement = typeof leaseAgreements.$inferSelect;
export type InsertLeaseAgreement = typeof leaseAgreements.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = typeof serviceRequests.$inferInsert;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertInsuranceClaim = typeof insuranceClaims.$inferInsert;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;
export type UtilityReading = typeof utilityReadings.$inferSelect;
export type InsertUtilityReading = typeof utilityReadings.$inferInsert;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;
