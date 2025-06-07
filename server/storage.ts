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
import { eq, and } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
