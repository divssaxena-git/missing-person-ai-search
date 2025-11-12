import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  phone: text('phone').unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: text('created_at').notNull(),
});

// Missing persons table
export const missingPersons = sqliteTable('missing_persons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportedBy: integer('reported_by').references(() => users.id),
  fullName: text('full_name').notNull(),
  age: integer('age'),
  gender: text('gender'),
  height: text('height'),
  weight: text('weight'),
  hairColor: text('hair_color'),
  eyeColor: text('eye_color'),
  complexion: text('complexion'),
  distinguishingMarks: text('distinguishing_marks'),
  lastSeenLocation: text('last_seen_location').notNull(),
  lastSeenDate: text('last_seen_date').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('active'),
  contactInfo: text('contact_info'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  reportId: integer('report_id').references(() => missingPersons.id),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});