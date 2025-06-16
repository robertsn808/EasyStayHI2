import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import * as schema from "./schema";

// Base validation schemas
export const emailSchema = z.string().email("Invalid email address");
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, "Invalid phone number");
export const pinSchema = z.string().regex(/^\d{4}$/, "PIN must be 4 digits");
export const accessCodeSchema = z.string().regex(/^\d{6}$/, "Access code must be 6 digits");

// Room validation
export const roomInsertSchema = createInsertSchema(schema.rooms, {
  number: z.string().min(1, "Room number is required").max(50),
  status: z.enum(["available", "occupied", "needs_cleaning", "out_of_service", "maintenance"]),
  size: z.enum(["standard", "large"]).optional(),
  floor: z.number().int().min(1).max(50).optional(),
  tenantEmail: emailSchema.optional(),
  tenantPhone: phoneSchema.optional(),
  accessPin: pinSchema.optional(),
  rentalRate: z.number().positive("Rental rate must be positive").optional(),
  rentalPeriod: z.enum(["daily", "weekly", "monthly"]).optional(),
}).omit({ id: true, createdAt: true });

export const roomUpdateSchema = roomInsertSchema.partial();

// Maintenance request validation
export const maintenanceRequestInsertSchema = createInsertSchema(schema.maintenanceRequests, {
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  priority: z.enum(["urgent", "normal", "low"]),
  status: z.enum(["submitted", "in_progress", "completed"]).optional(),
  assignedTo: z.string().max(255).optional(),
  photoUrls: z.string().optional(),
}).omit({ id: true, createdAt: true, completedAt: true });

// Payment validation
export const paymentInsertSchema = createInsertSchema(schema.payments, {
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "cashapp", "venmo", "other"]).optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
  receiptUrl: z.string().url("Invalid URL").optional(),
  notes: z.string().max(1000).optional(),
}).omit({ id: true, createdAt: true });

// Guest profile validation
export const guestProfileInsertSchema = createInsertSchema(schema.guestProfiles, {
  guestName: z.string().min(1, "Guest name is required").max(255),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  bookingType: z.enum(["daily", "weekly", "monthly"]),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  paymentAmount: z.number().positive("Payment amount must be positive"),
  paymentDueDay: z.number().int().min(0).max(31).optional(),
  paymentStatus: z.enum(["pending", "paid", "overdue"]).optional(),
  lastPaymentMethod: z.enum(["cashapp", "venmo", "cash", "card"]).optional(),
  notes: z.string().max(2000).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Inquiry validation
export const inquiryInsertSchema = createInsertSchema(schema.inquiries, {
  name: z.string().min(1, "Name is required").max(255),
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000).optional(),
  contactPreference: z.enum(["phone", "text", "email", "any"]).optional(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  numberOfGuests: z.number().int().min(1).max(10).optional(),
  roomPreference: z.string().max(100).optional(),
  estimatedCost: z.number().positive().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, status: true });

// Booking validation
export const bookingInsertSchema = createInsertSchema(schema.bookings, {
  guestName: z.string().min(1, "Guest name is required").max(255),
  email: emailSchema,
  phone: phoneSchema.optional(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  numberOfGuests: z.number().int().min(1).max(10),
  numberOfNights: z.number().int().min(1),
  ratePerNight: z.number().positive("Rate per night must be positive"),
  totalAmount: z.number().positive("Total amount must be positive"),
  amountPaid: z.number().min(0, "Amount paid cannot be negative").optional(),
  balance: z.number().min(0, "Balance cannot be negative"),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "cashapp", "venmo", "other"]).optional(),
  paymentStatus: z.enum(["pending", "partial", "paid", "refunded"]).optional(),
  bookingStatus: z.enum(["confirmed", "checked_in", "checked_out", "cancelled"]).optional(),
  specialRequests: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Contact validation
export const contactInsertSchema = createInsertSchema(schema.contacts, {
  name: z.string().min(1, "Name is required").max(255),
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000).optional(),
  company: z.string().max(255).optional(),
  position: z.string().max(255).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Announcement validation
export const announcementInsertSchema = createInsertSchema(schema.announcements, {
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required").max(5000),
  type: z.enum(["info", "warning", "success"]).optional(),
  isActive: z.boolean().optional(),
}).omit({ id: true, createdAt: true });

// Tenant session validation
export const tenantSessionInsertSchema = createInsertSchema(schema.tenantSessions, {
  tenantName: z.string().min(1, "Tenant name is required").max(255),
  tenantEmail: emailSchema.optional(),
  tenantPhone: phoneSchema.optional(),
  sessionToken: z.string().min(32, "Session token too short"),
  expiresAt: z.string().datetime("Invalid datetime format"),
}).omit({ id: true, createdAt: true });

// Access code validation
export const temporaryAccessCodeInsertSchema = createInsertSchema(schema.temporaryAccessCodes, {
  accessCode: accessCodeSchema,
  purpose: z.enum(["checkin", "maintenance", "cleaning", "guest_access"]),
  expiresAt: z.string().datetime("Invalid datetime format"),
  maxUsage: z.number().int().min(-1, "Max usage must be -1 or positive"),
  createdBy: z.string().min(1, "Creator is required").max(255),
}).omit({ id: true, createdAt: true, usageCount: true });

// API Response validation
export const apiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  });

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Query parameters validation
export const roomQuerySchema = z.object({
  buildingId: z.number().int().positive().optional(),
  status: z.enum(["available", "occupied", "needs_cleaning", "out_of_service", "maintenance"]).optional(),
  floor: z.number().int().min(1).optional(),
}).merge(paginationSchema);

export const maintenanceQuerySchema = z.object({
  roomId: z.number().int().positive().optional(),
  priority: z.enum(["urgent", "normal", "low"]).optional(),
  status: z.enum(["submitted", "in_progress", "completed"]).optional(),
  assignedTo: z.string().optional(),
}).merge(paginationSchema);

export const paymentQuerySchema = z.object({
  roomId: z.number().int().positive().optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
  paymentMethod: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).merge(paginationSchema);

// Export types
export type RoomInsert = z.infer<typeof roomInsertSchema>;
export type RoomUpdate = z.infer<typeof roomUpdateSchema>;
export type MaintenanceRequestInsert = z.infer<typeof maintenanceRequestInsertSchema>;
export type PaymentInsert = z.infer<typeof paymentInsertSchema>;
export type GuestProfileInsert = z.infer<typeof guestProfileInsertSchema>;
export type InquiryInsert = z.infer<typeof inquiryInsertSchema>;
export type BookingInsert = z.infer<typeof bookingInsertSchema>;
export type ContactInsert = z.infer<typeof contactInsertSchema>;
export type AnnouncementInsert = z.infer<typeof announcementInsertSchema>;
export type TenantSessionInsert = z.infer<typeof tenantSessionInsertSchema>;
export type TemporaryAccessCodeInsert = z.infer<typeof temporaryAccessCodeInsertSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type RoomQuery = z.infer<typeof roomQuerySchema>;
export type MaintenanceQuery = z.infer<typeof maintenanceQuerySchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;