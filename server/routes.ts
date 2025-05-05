import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@db";
import * as schema from "@shared/schema";
import {
  insertNewsArticleSchema,
  insertProgramSchema,
  insertTeamMemberSchema,
  insertVideoSchema,
  insertDonationSchema,
  insertVolunteerSchema,
  insertContactMessageSchema,
  insertNewsletterSubscriberSchema,
  videos,
} from "@shared/schema";
import * as bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@db";

const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session and authentication
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
      }),
      secret: process.env.SESSION_SECRET || "sunnah-foundation-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const admin = { id: 1, username: "admin", isAdmin: true };
      return done(null, admin);
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication endpoints
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Login successful", user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/check", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // News API endpoints
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllNewsArticles();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ error: "Failed to fetch news articles" });
    }
  });

  app.get("/api/news/featured", async (req, res) => {
    try {
      const featuredNews = await storage.getFeaturedNewsArticles();
      res.json(featuredNews);
    } catch (error) {
      console.error("Error fetching featured news:", error);
      res.status(500).json({ error: "Failed to fetch featured news" });
    }
  });

  app.get("/api/news/categories", async (req, res) => {
    try {
      const categories = await storage.getNewsCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching news categories:", error);
      res.status(500).json({ error: "Failed to fetch news categories" });
    }
  });

  app.get("/api/news/:slug", async (req, res) => {
    try {
      const article = await storage.getNewsArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.post("/api/news", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNewsArticleSchema.parse(req.body);
      const newArticle = await storage.createNewsArticle(validatedData);
      res.status(201).json(newArticle);
    } catch (error) {
      console.error("Error creating news article:", error);
      res
        .status(400)
        .json({ error: "Failed to create news article", details: error });
    }
  });

  app.put("/api/news/:id", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNewsArticleSchema.parse(req.body);
      const id = parseInt(req.params.id);
      const updatedArticle = await storage.updateNewsArticle(id, validatedData);
      res.json(updatedArticle);
    } catch (error) {
      console.error("Error updating news article:", error);
      res
        .status(400)
        .json({ error: "Failed to update news article", details: error });
    }
  });

  app.delete("/api/news/:id", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNewsArticle(id);
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting news article:", error);
      res.status(500).json({ error: "Failed to delete news article" });
    }
  });

  // Programs API endpoints
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getAllPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  app.get("/api/programs/featured", async (req, res) => {
    try {
      const featuredPrograms = await storage.getFeaturedPrograms();
      res.json(featuredPrograms);
    } catch (error) {
      console.error("Error fetching featured programs:", error);
      res.status(500).json({ error: "Failed to fetch featured programs" });
    }
  });

  app.get("/api/programs/categories", async (req, res) => {
    try {
      const categories = await storage.getProgramCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching program categories:", error);
      res.status(500).json({ error: "Failed to fetch program categories" });
    }
  });

  app.get("/api/programs/:slug", async (req, res) => {
    try {
      const program = await storage.getProgramBySlug(req.params.slug);
      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ error: "Failed to fetch program" });
    }
  });

  app.post("/api/programs", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProgramSchema.parse(req.body);
      const newProgram = await storage.createProgram(validatedData);
      res.status(201).json(newProgram);
    } catch (error) {
      console.error("Error creating program:", error);
      res
        .status(400)
        .json({ error: "Failed to create program", details: error });
    }
  });

  app.put("/api/programs/:id", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProgramSchema.parse(req.body);
      const id = parseInt(req.params.id);
      const updatedProgram = await storage.updateProgram(id, validatedData);
      res.json(updatedProgram);
    } catch (error) {
      console.error("Error updating program:", error);
      res
        .status(400)
        .json({ error: "Failed to update program", details: error });
    }
  });

  app.delete("/api/programs/:id", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProgram(id);
      res.json({ message: "Program deleted successfully" });
    } catch (error) {
      console.error("Error deleting program:", error);
      res.status(500).json({ error: "Failed to delete program" });
    }
  });

  // Team API endpoints
  app.get("/api/team/all", async (req, res) => {
    try {
      const teamMembers = await storage.getAllTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/team/leadership", async (req, res) => {
    try {
      const leadership = await storage.getLeadershipTeam();
      res.json(leadership);
    } catch (error) {
      console.error("Error fetching leadership team:", error);
      res.status(500).json({ error: "Failed to fetch leadership team" });
    }
  });

  app.post("/api/team", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const newMember = await storage.createTeamMember(validatedData);
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Error creating team member:", error);
      res
        .status(400)
        .json({ error: "Failed to create team member", details: error });
    }
  });

  app.put("/api/team/:id", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const id = parseInt(req.params.id);
      const updatedMember = await storage.updateTeamMember(id, validatedData);
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating team member:", error);
      res
        .status(400)
        .json({ error: "Failed to update team member", details: error });
    }
  });

  app.delete("/api/team/:id", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeamMember(id);
      res.json({ message: "Team member deleted successfully" });
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  // Videos API endpoints
  app.get("/api/videos", async (req, res) => {
    try {
      const allVideos = await storage.getAllVideos();
      res.json(allVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/featured", async (req, res) => {
    try {
      const featuredVideos = await storage.getFeaturedVideos();
      res.json(featuredVideos);
    } catch (error) {
      console.error("Error fetching featured videos:", error);
      res.status(500).json({ error: "Failed to fetch featured videos" });
    }
  });

  app.get("/api/videos/main-feature", async (req, res) => {
    try {
      const mainFeature = await storage.getMainFeatureVideo();
      res.json(mainFeature);
    } catch (error) {
      console.error("Error fetching main feature video:", error);
      res.status(500).json({ error: "Failed to fetch main feature video" });
    }
  });

  app.get("/api/videos/categories", async (req, res) => {
    try {
      const categories = await storage.getVideoCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching video categories:", error);
      res.status(500).json({ error: "Failed to fetch video categories" });
    }
  });

  app.post("/api/videos", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const newVideo = await storage.createVideo(validatedData);
      res.status(201).json(newVideo);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(400).json({ error: "Failed to create video", details: error });
    }
  });

  app.put("/api/videos/:id", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const id = parseInt(req.params.id);
      const updatedVideo = await storage.updateVideo(id, validatedData);
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(400).json({ error: "Failed to update video", details: error });
    }
  });

  app.delete("/api/videos/:id", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  // About page history endpoints
  app.get("/api/about/history", async (req, res) => {
    try {
      const history = await storage.getHistoryEvents();
      res.json(history);
    } catch (error) {
      console.error("Error fetching history events:", error);
      res.status(500).json({ error: "Failed to fetch history events" });
    }
  });

  app.post("/api/about/history", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = req.body;
      const newEvent = await db
        .insert(schema.historyEvents)
        .values(validatedData)
        .returning();
      res.status(201).json(newEvent[0]);
    } catch (error) {
      console.error("Error creating history event:", error);
      res.status(400).json({ error: "Failed to create history event" });
    }
  });

  app.put("/api/about/history/:id", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = req.body;
      const result = await db
        .update(schema.historyEvents)
        .set(validatedData)
        .where(eq(schema.historyEvents.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "History event not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating history event:", error);
      res.status(400).json({ error: "Failed to update history event" });
    }
  });

  app.delete("/api/about/history/:id", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await db
        .delete(schema.historyEvents)
        .where(eq(schema.historyEvents.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "History event not found" });
      }

      res.json({ message: "History event deleted successfully" });
    } catch (error) {
      console.error("Error deleting history event:", error);
      res.status(500).json({ error: "Failed to delete history event" });
    }
  });

  // University endpoints
  app.get("/api/university/courses", async (req, res) => {
    try {
      const courses = await storage.getUniversityCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching university courses:", error);
      res.status(500).json({ error: "Failed to fetch university courses" });
    }
  });

  app.post("/api/university/courses", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = req.body;
      const newCourse = await db
        .insert(schema.universityCourses)
        .values(validatedData)
        .returning();
      res.status(201).json(newCourse[0]);
    } catch (error) {
      console.error("Error creating university course:", error);
      res.status(400).json({ error: "Failed to create university course" });
    }
  });

  app.put(
    "/api/university/courses/:id",
    checkAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const validatedData = req.body;
        const result = await db
          .update(schema.universityCourses)
          .set(validatedData)
          .where(eq(schema.universityCourses.id, id))
          .returning();

        if (result.length === 0) {
          return res.status(404).json({ error: "University course not found" });
        }

        res.json(result[0]);
      } catch (error) {
        console.error("Error updating university course:", error);
        res.status(400).json({ error: "Failed to update university course" });
      }
    },
  );

  app.delete(
    "/api/university/courses/:id",
    checkAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const result = await db
          .delete(schema.universityCourses)
          .where(eq(schema.universityCourses.id, id))
          .returning();

        if (result.length === 0) {
          return res.status(404).json({ error: "University course not found" });
        }

        res.json({ message: "University course deleted successfully" });
      } catch (error) {
        console.error("Error deleting university course:", error);
        res.status(500).json({ error: "Failed to delete university course" });
      }
    },
  );

  app.get("/api/university/faculty", async (req, res) => {
    try {
      const faculty = await storage.getFacultyMembers();
      res.json(faculty);
    } catch (error) {
      console.error("Error fetching faculty members:", error);
      res.status(500).json({ error: "Failed to fetch faculty members" });
    }
  });

  app.post("/api/university/faculty", checkAuthenticated, async (req, res) => {
    try {
      const validatedData = req.body;
      const newFaculty = await db
        .insert(schema.facultyMembers)
        .values(validatedData)
        .returning();
      res.status(201).json(newFaculty[0]);
    } catch (error) {
      console.error("Error creating faculty member:", error);
      res.status(400).json({ error: "Failed to create faculty member" });
    }
  });

  app.put(
    "/api/university/faculty/:id",
    checkAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const validatedData = req.body;
        const result = await db
          .update(schema.facultyMembers)
          .set(validatedData)
          .where(eq(schema.facultyMembers.id, id))
          .returning();

        if (result.length === 0) {
          return res.status(404).json({ error: "Faculty member not found" });
        }

        res.json(result[0]);
      } catch (error) {
        console.error("Error updating faculty member:", error);
        res.status(400).json({ error: "Failed to update faculty member" });
      }
    },
  );

  app.delete(
    "/api/university/faculty/:id",
    checkAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const result = await db
          .delete(schema.facultyMembers)
          .where(eq(schema.facultyMembers.id, id))
          .returning();

        if (result.length === 0) {
          return res.status(404).json({ error: "Faculty member not found" });
        }

        res.json({ message: "Faculty member deleted successfully" });
      } catch (error) {
        console.error("Error deleting faculty member:", error);
        res.status(500).json({ error: "Failed to delete faculty member" });
      }
    },
  );

  // Donations endpoints
  app.get("/api/donations", checkAuthenticated, async (req, res) => {
    try {
      const donations = await db
        .select()
        .from(schema.donations)
        .orderBy(desc(schema.donations.createdAt));
      res.json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  app.post("/api/donations", async (req, res) => {
    try {
      const validatedData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(validatedData);
      res.status(201).json(donation);
    } catch (error) {
      console.error("Error processing donation:", error);
      res
        .status(400)
        .json({ error: "Failed to process donation", details: error });
    }
  });

  app.put("/api/donations/:id/status", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const result = await db
        .update(schema.donations)
        .set({ status })
        .where(eq(schema.donations.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Donation not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating donation status:", error);
      res.status(500).json({ error: "Failed to update donation status" });
    }
  });

  // Volunteers endpoints
  app.get("/api/volunteers", checkAuthenticated, async (req, res) => {
    try {
      const volunteers = await db
        .select()
        .from(schema.volunteers)
        .orderBy(desc(schema.volunteers.createdAt));
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ error: "Failed to fetch volunteers" });
    }
  });

  app.post("/api/volunteers", async (req, res) => {
    try {
      const validatedData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(validatedData);
      res.status(201).json(volunteer);
    } catch (error) {
      console.error("Error processing volunteer application:", error);
      res.status(400).json({
        error: "Failed to process volunteer application",
        details: error,
      });
    }
  });

  app.put(
    "/api/volunteers/:id/status",
    checkAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        const result = await db
          .update(schema.volunteers)
          .set({ status })
          .where(eq(schema.volunteers.id, id))
          .returning();

        if (result.length === 0) {
          return res
            .status(404)
            .json({ error: "Volunteer application not found" });
        }

        res.json(result[0]);
      } catch (error) {
        console.error("Error updating volunteer status:", error);
        res.status(500).json({ error: "Failed to update volunteer status" });
      }
    },
  );

  // Contact messages endpoints
  app.get("/api/contact", checkAuthenticated, async (req, res) => {
    try {
      const messages = await db
        .select()
        .from(schema.contactMessages)
        .orderBy(desc(schema.contactMessages.createdAt));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);

      // If user wants to subscribe to newsletter
      if (validatedData.newsletter) {
        try {
          await storage.subscribeToNewsletter({ email: validatedData.email });
        } catch (newsletterError) {
          console.error("Error subscribing to newsletter:", newsletterError);
          // Continue with contact message submission even if newsletter subscription fails
        }
      }

      res.status(201).json(message);
    } catch (error) {
      console.error("Error submitting contact message:", error);
      res
        .status(400)
        .json({ error: "Failed to submit contact message", details: error });
    }
  });

  app.put("/api/contact/:id/read", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isRead } = req.body;

      const result = await db
        .update(schema.contactMessages)
        .set({ isRead })
        .where(eq(schema.contactMessages.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Contact message not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating message read status:", error);
      res.status(500).json({ error: "Failed to update message read status" });
    }
  });

  app.delete("/api/contact/:id", checkAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await db
        .delete(schema.contactMessages)
        .where(eq(schema.contactMessages.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Contact message not found" });
      }

      res.json({ message: "Contact message deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ error: "Failed to delete contact message" });
    }
  });

  // Newsletter subscription endpoints
  app.get(
    "/api/newsletter/subscribers",
    checkAuthenticated,
    async (req, res) => {
      try {
        const subscribers = await db
          .select()
          .from(schema.newsletterSubscribers)
          .orderBy(desc(schema.newsletterSubscribers.createdAt));
        res.json(subscribers);
      } catch (error) {
        console.error("Error fetching newsletter subscribers:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch newsletter subscribers" });
      }
    },
  );

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscription = await storage.subscribeToNewsletter(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res
        .status(400)
        .json({ error: "Failed to subscribe to newsletter", details: error });
    }
  });

  app.delete(
    "/api/newsletter/subscribers/:id",
    checkAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const result = await db
          .delete(schema.newsletterSubscribers)
          .where(eq(schema.newsletterSubscribers.id, id))
          .returning();

        if (result.length === 0) {
          return res.status(404).json({ error: "Subscriber not found" });
        }

        res.json({ message: "Subscriber removed successfully" });
      } catch (error) {
        console.error("Error removing subscriber:", error);
        res.status(500).json({ error: "Failed to remove subscriber" });
      }
    },
  );

  app.delete(
    "/api/newsletter/subscribers/bulk",
    checkAuthenticated,
    express.json(),
    async (req, res) => {
      try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
          return res
            .status(400)
            .json({ error: "Invalid request: ids must be a non-empty array" });
        }

        // Using SQL for bulk operations
        const idStr = ids.join(",");
        await db
          .delete(schema.newsletterSubscribers)
          .where(sql`id IN (${idStr})`);

        res.json({ message: "Subscribers removed successfully" });
      } catch (error) {
        console.error("Error removing subscribers:", error);
        res.status(500).json({ error: "Failed to remove subscribers" });
      }
    },
  );

  // Admin stats endpoint
  app.get("/api/admin/stats", checkAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

// Middleware to check if user is authenticated
function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}
