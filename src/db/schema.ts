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

// Sightings table
export const sightings = sqliteTable('sightings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportId: integer('report_id').references(() => missingPersons.id),
  reportedByUserId: integer('reported_by_user_id').references(() => users.id),
  sightingLocation: text('sighting_location').notNull(),
  sightingDate: text('sighting_date').notNull(),
  description: text('description'),
  contactInfo: text('contact_info'),
  imageUrl: text('image_url'),
  verified: integer('verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// CCTV Footage table
export const cctvFootage = sqliteTable('cctv_footage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportId: integer('report_id').references(() => missingPersons.id),
  submittedByUserId: integer('submitted_by_user_id').references(() => users.id),
  location: text('location').notNull(),
  footageDate: text('footage_date').notNull(),
  footageTime: text('footage_time'),
  description: text('description'),
  videoUrl: text('video_url'),
  contactInfo: text('contact_info'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
});