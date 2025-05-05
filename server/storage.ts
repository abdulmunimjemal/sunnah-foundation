import { db } from "@db";
import { eq, desc, sql, and, asc } from "drizzle-orm";
import { 
  users, 
  newsArticles, 
  programs, 
  teamMembers, 
  videos, 
  donations, 
  volunteers, 
  contactMessages,
  newsletterSubscribers,
  historyEvents,
  universityCourses,
  facultyMembers,
  type InsertNewsArticle,
  type InsertProgram,
  type InsertTeamMember,
  type InsertVideo,
  type InsertDonation,
  type InsertVolunteer,
  type InsertContactMessage,
  type InsertNewsletterSubscriber
} from "@shared/schema";
import * as bcrypt from 'bcryptjs';

export const storage = {
  // User functions
  async getUserById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  },

  async getUserByUsername(username: string) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  },

  // News article functions
  async getAllNewsArticles() {
    return db.select().from(newsArticles).orderBy(desc(newsArticles.date));
  },

  async getFeaturedNewsArticles(limit = 4) {
    return db.select().from(newsArticles).orderBy(desc(newsArticles.date)).limit(limit);
  },

  async getNewsArticleBySlug(slug: string) {
    const result = await db.select().from(newsArticles).where(eq(newsArticles.slug, slug));
    return result[0] || null;
  },

  async getNewsCategories() {
    const result = await db.select({ category: newsArticles.category }).from(newsArticles).groupBy(newsArticles.category);
    return result.map(item => item.category);
  },

  async createNewsArticle(article: InsertNewsArticle) {
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  },

  async updateNewsArticle(id: number, article: InsertNewsArticle) {
    const [updatedArticle] = await db
      .update(newsArticles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(newsArticles.id, id))
      .returning();
    return updatedArticle;
  },

  async deleteNewsArticle(id: number) {
    return db.delete(newsArticles).where(eq(newsArticles.id, id));
  },

  // Program functions
  async getAllPrograms() {
    return db.select().from(programs);
  },

  async getFeaturedPrograms(limit = 6) {
    return db.select().from(programs).limit(limit);
  },

  async getProgramBySlug(slug: string) {
    const result = await db.select().from(programs).where(eq(programs.slug, slug));
    return result[0] || null;
  },

  async getProgramCategories() {
    const result = await db.select({ category: programs.category }).from(programs).groupBy(programs.category);
    return result.map(item => item.category);
  },

  async createProgram(program: InsertProgram) {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  },

  async updateProgram(id: number, program: InsertProgram) {
    const [updatedProgram] = await db
      .update(programs)
      .set({ ...program, updatedAt: new Date() })
      .where(eq(programs.id, id))
      .returning();
    return updatedProgram;
  },

  async deleteProgram(id: number) {
    return db.delete(programs).where(eq(programs.id, id));
  },

  // Team member functions
  async getAllTeamMembers() {
    return db.select().from(teamMembers);
  },

  async getLeadershipTeam() {
    return db.select().from(teamMembers).where(eq(teamMembers.isLeadership, true));
  },

  async createTeamMember(member: InsertTeamMember) {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  },

  async updateTeamMember(id: number, member: InsertTeamMember) {
    const [updatedMember] = await db
      .update(teamMembers)
      .set({ ...member, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return updatedMember;
  },

  async deleteTeamMember(id: number) {
    return db.delete(teamMembers).where(eq(teamMembers.id, id));
  },

  // Video functions
  async getAllVideos() {
    return db.select().from(videos).orderBy(desc(videos.date));
  },

  async getFeaturedVideos(limit = 3) {
    return db.select().from(videos).where(eq(videos.isFeatured, true)).limit(limit);
  },

  async getMainFeatureVideo() {
    const result = await db.select().from(videos).where(eq(videos.isMainFeature, true)).limit(1);
    return result[0] || null;
  },

  async getVideoCategories() {
    const result = await db.select({ category: videos.category }).from(videos).groupBy(videos.category);
    return result.map(item => item.category);
  },

  async createVideo(video: InsertVideo) {
    // Set as main feature if it's the first video
    const count = await db.select({ count: sql<number>`count(*)` }).from(videos);
    const isFirst = count[0].count === 0;
    
    const [newVideo] = await db
      .insert(videos)
      .values({
        ...video,
        isMainFeature: isFirst ? true : false
      })
      .returning();
    return newVideo;
  },

  async updateVideo(id: number, video: InsertVideo) {
    const [updatedVideo] = await db
      .update(videos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo;
  },

  async deleteVideo(id: number) {
    return db.delete(videos).where(eq(videos.id, id));
  },

  // History events for about page
  async getHistoryEvents() {
    return db.select().from(historyEvents).orderBy(asc(historyEvents.year));
  },

  // University endpoints
  async getUniversityCourses() {
    return db.select().from(universityCourses);
  },

  async getFacultyMembers() {
    return db.select().from(facultyMembers);
  },

  // Donation functions
  async createDonation(donation: InsertDonation) {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  },

  // Volunteer functions
  async createVolunteer(volunteer: InsertVolunteer) {
    const [newVolunteer] = await db.insert(volunteers).values(volunteer).returning();
    return newVolunteer;
  },

  // Contact message functions
  async createContactMessage(message: InsertContactMessage) {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  },

  // Newsletter subscriber functions
  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber) {
    // Check if email already exists
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, subscriber.email));
    
    if (existing.length > 0) {
      return existing[0]; // Already subscribed
    }
    
    // Create new subscription
    const [newSubscriber] = await db.insert(newsletterSubscribers).values(subscriber).returning();
    return newSubscriber;
  },

  // Admin stats
  async getAdminStats() {
    const articlesCount = await db.select({ count: sql<number>`count(*)` }).from(newsArticles);
    const programsCount = await db.select({ count: sql<number>`count(*)` }).from(programs);
    const teamCount = await db.select({ count: sql<number>`count(*)` }).from(teamMembers);
    const videosCount = await db.select({ count: sql<number>`count(*)` }).from(videos);
    const donationsCount = await db.select({ count: sql<number>`count(*)` }).from(donations);
    const volunteersCount = await db.select({ count: sql<number>`count(*)` }).from(volunteers);
    const contactsCount = await db.select({ count: sql<number>`count(*)` }).from(contactMessages);

    return {
      articles: articlesCount[0].count,
      programs: programsCount[0].count,
      team: teamCount[0].count,
      videos: videosCount[0].count,
      donations: donationsCount[0].count,
      volunteers: volunteersCount[0].count,
      contacts: contactsCount[0].count
    };
  }
};
