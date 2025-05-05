import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { eq } from "drizzle-orm";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// News articles table
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  date: date("date").defaultNow().notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for news articles
export const insertNewsArticleSchema = createInsertSchema(newsArticles, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  excerpt: (schema) => schema.min(10, "Excerpt must be at least 10 characters"),
  content: (schema) => schema.min(50, "Content must be at least 50 characters"),
  slug: (schema) => schema.min(3, "Slug must be at least 3 characters"),
});

// Programs table
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for programs
export const insertProgramSchema = createInsertSchema(programs, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  longDescription: (schema) => schema.min(50, "Long description must be at least 50 characters"),
  slug: (schema) => schema.min(3, "Slug must be at least 3 characters"),
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url").notNull(),
  socialLinks: jsonb("social_links").notNull(),
  isLeadership: boolean("is_leadership").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for team members
export const insertTeamMemberSchema = createInsertSchema(teamMembers, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  bio: (schema) => schema.min(10, "Bio must be at least 10 characters"),
});

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: text("duration").notNull(),
  views: integer("views").default(0).notNull(),
  date: date("date").defaultNow().notNull(),
  category: text("category").notNull(),
  isFeatured: boolean("is_featured").default(false),
  isMainFeature: boolean("is_main_feature").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for videos
export const insertVideoSchema = createInsertSchema(videos, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

// Donations table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  recurring: boolean("recurring").default(false),
  transactionId: text("transaction_id"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for donations
export const insertDonationSchema = createInsertSchema(donations, {
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  amount: (schema) => schema.positive("Amount must be positive"),
});

// Volunteers table
export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  areas: jsonb("areas").notNull(),
  availability: jsonb("availability").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for volunteers
export const insertVolunteerSchema = createInsertSchema(volunteers, {
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  phone: (schema) => schema.min(10, "Phone number must be at least 10 characters"),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  newsletter: boolean("newsletter").default(false),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for contact messages
export const insertContactMessageSchema = createInsertSchema(contactMessages, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  subject: (schema) => schema.min(3, "Subject must be at least 3 characters"),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
});

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for newsletter subscribers
export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers, {
  email: (schema) => schema.email("Must provide a valid email"),
});

// History events for about page
export const historyEvents = pgTable("history_events", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for history events
export const insertHistoryEventSchema = createInsertSchema(historyEvents, {
  year: (schema) => schema.positive("Year must be positive"),
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

// University courses table
export const universityCourses = pgTable("university_courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  duration: text("duration").notNull(),
  instructors: jsonb("instructors").notNull(),
  imageUrl: text("image_url").notNull(),
  applicationLink: text("application_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for university courses
export const insertUniversityCourseSchema = createInsertSchema(universityCourses, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

// Faculty members table
export const facultyMembers = pgTable("faculty_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  specialization: text("specialization").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for faculty members
export const insertFacultyMemberSchema = createInsertSchema(facultyMembers, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  specialization: (schema) => schema.min(3, "Specialization must be at least 3 characters"),
  bio: (schema) => schema.min(10, "Bio must be at least 10 characters"),
});

// Article comments table
export const articleComments = pgTable("article_comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => newsArticles.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id").references(() => articleComments.id),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for article comments
export const insertArticleCommentSchema = createInsertSchema(articleComments, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Valid email is required"),
  content: (schema) => schema.min(3, "Comment must be at least 3 characters"),
});

// Article likes table
export const articleLikes = pgTable("article_likes", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => newsArticles.id).notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for article likes
export const insertArticleLikeSchema = createInsertSchema(articleLikes, {
  email: (schema) => schema.email("Valid email is required"),
});

// Define relationships
export const teamMembersRelations = relations(teamMembers, ({ }) => ({}));
export const programsRelations = relations(programs, ({ }) => ({}));
export const newsArticlesRelations = relations(newsArticles, ({ many }) => ({
  comments: many(articleComments),
  likes: many(articleLikes)
}));
export const articleCommentsRelations = relations(articleComments, ({ one, many }) => ({
  article: one(newsArticles, {
    fields: [articleComments.articleId],
    references: [newsArticles.id]
  }),
  parentComment: one(articleComments, {
    fields: [articleComments.parentId],
    references: [articleComments.id]
  }),
  replies: many(articleComments, { relationName: "parent_child" })
}));
export const articleLikesRelations = relations(articleLikes, ({ one }) => ({
  article: one(newsArticles, {
    fields: [articleLikes.articleId],
    references: [newsArticles.id]
  })
}));
export const videosRelations = relations(videos, ({ }) => ({}));
export const donationsRelations = relations(donations, ({ }) => ({}));
export const volunteersRelations = relations(volunteers, ({ }) => ({}));
export const contactMessagesRelations = relations(contactMessages, ({ }) => ({}));
export const newsletterSubscribersRelations = relations(newsletterSubscribers, ({ }) => ({}));
export const historyEventsRelations = relations(historyEvents, ({ }) => ({}));
export const universityCoursesRelations = relations(universityCourses, ({ }) => ({}));
export const facultyMembersRelations = relations(facultyMembers, ({ }) => ({}));

// Category tables
export const programCategories = pgTable("program_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProgramCategorySchema = createInsertSchema(programCategories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
});

export const newsCategories = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsCategorySchema = createInsertSchema(newsCategories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
});

export const videoCategories = pgTable("video_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVideoCategorySchema = createInsertSchema(videoCategories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type HistoryEvent = typeof historyEvents.$inferSelect;
export type InsertHistoryEvent = z.infer<typeof insertHistoryEventSchema>;

export type UniversityCourse = typeof universityCourses.$inferSelect;
export type InsertUniversityCourse = z.infer<typeof insertUniversityCourseSchema>;

export type FacultyMember = typeof facultyMembers.$inferSelect;
export type InsertFacultyMember = z.infer<typeof insertFacultyMemberSchema>;

export type ArticleComment = typeof articleComments.$inferSelect;
export type InsertArticleComment = z.infer<typeof insertArticleCommentSchema>;

export type ArticleLike = typeof articleLikes.$inferSelect;
export type InsertArticleLike = z.infer<typeof insertArticleLikeSchema>;

export type ProgramCategory = typeof programCategories.$inferSelect;
export type InsertProgramCategory = z.infer<typeof insertProgramCategorySchema>;

export type NewsCategory = typeof newsCategories.$inferSelect;
export type InsertNewsCategory = z.infer<typeof insertNewsCategorySchema>;

export type VideoCategory = typeof videoCategories.$inferSelect;
export type InsertVideoCategory = z.infer<typeof insertVideoCategorySchema>;

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  registrationLink: text("registration_link"),
  isPast: boolean("is_past").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for events
export const insertEventSchema = createInsertSchema(events, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  location: (schema) => schema.min(3, "Location must be at least 3 characters"),
});

// Event relations
export const eventsRelations = relations(events, ({ }) => ({}));

// Event type
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Newsletter broadcast schema (not stored in database, just for validation)
export const newsletterBroadcastSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  html: z.string().optional(),
  testEmail: z.string().email("Invalid email address").optional(),
  sendToAll: z.boolean().default(false)
});
