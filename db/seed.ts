import { Pool } from 'pg'; // Use pg Pool for direct connection
import { drizzle } from 'drizzle-orm/node-postgres'; // Use drizzle adapter for node-postgres
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import * as bcrypt from 'bcryptjs';
import { eq } from "drizzle-orm";

// Create a pg Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL configuration for development to allow self-signed certificates
  // In production, ensure your DATABASE_URL from Aiven includes ?sslmode=require
  ssl:{ rejectUnauthorized: false }
});

// Create a drizzle instance using the pg Pool
const db = drizzle(pool, { schema });

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Check if DATABASE_URL is set (important!)
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set in .env file for seeding.",
      );
    }

    // Seed program categories
    const existingProgramCategories = await db.select().from(schema.programCategories);
    
    if (existingProgramCategories.length === 0) {
      await db.insert(schema.programCategories).values([
        { name: "Youth Development" },
        { name: "Education" },
        { name: "Community Service" },
        { name: "Family Support" },
        { name: "Community Engagement" }
      ]);
      
      console.log("Program categories seeded");
    } else {
      console.log("Program categories already exist, skipping");
    }
    
    // Seed news categories
    const existingNewsCategories = await db.select().from(schema.newsCategories);
    
    if (existingNewsCategories.length === 0) {
      await db.insert(schema.newsCategories).values([
        { name: "Event" },
        { name: "Program" },
        { name: "Community" },
        { name: "Partnership" },
        { name: "Announcement" }
      ]);
      
      console.log("News categories seeded");
    } else {
      console.log("News categories already exist, skipping");
    }
    
    // Seed video categories
    const existingVideoCategories = await db.select().from(schema.videoCategories);
    
    if (existingVideoCategories.length === 0) {
      await db.insert(schema.videoCategories).values([
        { name: "Lecture" },
        { name: "Interview" },
        { name: "Event" },
        { name: "Tutorial" },
        { name: "Documentary" }
      ]);
      
      console.log("Video categories seeded");
    } else {
      console.log("Video categories already exist, skipping");
    }

    // Create session table if it doesn't exist
    // Note: Drizzle execute might not work the same way with pg as with neon.
    // It's often better to let migrations handle table creation.
    // However, keeping the existing logic for now.
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    console.log("Session table created/verified");

    // Create admin user
    const existingUsers = await db.select().from(schema.users).where(sql`${schema.users.username} = 'admin'`);
    
    if (existingUsers.length === 0) {
      const hashedPassword = await bcrypt.hash("adminPassword123", 10);
      
      await db.insert(schema.users).values({
        username: "admin",
        password: hashedPassword,
        isAdmin: true
      });
      
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Seed news articles
    const existingArticles = await db.select().from(schema.newsArticles);
    
    if (existingArticles.length === 0) {
      await db.insert(schema.newsArticles).values([
        {
          title: "Sunnah Foundation's Annual Conference Attracts Global Attendance",
          excerpt: "Our recent conference brought together scholars and attendees from over 20 countries to discuss contemporary challenges and solutions.",
          content: "The Sunnah Foundation's Annual Conference was a tremendous success this year, attracting participants from more than 20 countries. The conference focused on contemporary challenges facing Muslims globally and explored Islamic solutions grounded in the Prophetic tradition. Renowned scholars presented on topics ranging from family values in modern society to environmental stewardship in Islam. Workshops and panel discussions provided practical guidance for implementing Islamic principles in daily life. The event concluded with a commitment to expand educational resources and community outreach programs in the coming year.",
          date: new Date("2023-06-15"),
          imageUrl: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          category: "Event",
          author: "Fatuma Ahmed",
          slug: "annual-conference-global-attendance"
        },
        {
          title: "New Youth Leadership Program Launches This Summer",
          excerpt: "Our innovative program will empower young Muslims with leadership skills and Islamic knowledge for today's challenges.",
          content: "The Sunnah Foundation is proud to announce the launch of our new Youth Leadership Program scheduled to begin this summer. This innovative initiative aims to empower young Muslims aged 15-21 with leadership skills, Islamic knowledge, and practical tools to navigate contemporary challenges while maintaining their Islamic identity. The program includes mentorship from established community leaders, workshops on effective communication and project management, and opportunities to develop and implement community service projects. Applications are now open on our website, with scholarship opportunities available for qualified candidates.",
          date: new Date("2023-05-28"),
          imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          category: "Program",
          author: "Mohammed Ali",
          slug: "youth-leadership-program-launch"
        },
        {
          title: "Foundation Volunteers Serve 5,000 Meals in Community Initiative",
          excerpt: "Our dedicated volunteers partnered with local organizations to provide meals and essential supplies to those in need.",
          content: "In a remarkable display of community service, Sunnah Foundation volunteers recently completed a major initiative providing over 5,000 meals to those in need. Working in partnership with local food banks and community organizations, our volunteers not only distributed nutritious meals but also essential supplies including hygiene kits and winter clothing. The initiative, which ran for two weeks, reached homeless individuals, low-income families, and elderly community members who struggle with food insecurity. This effort highlights our commitment to embodying the Prophetic values of compassion and service to humanity regardless of background or faith.",
          date: new Date("2023-05-10"),
          imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          category: "Community",
          author: "Aisha Ibrahim",
          slug: "volunteers-serve-meals-community"
        },
        {
          title: "Sunnah Foundation Announces Partnership with Global Education Network",
          excerpt: "This collaboration will expand our educational offerings and provide greater access to Islamic knowledge worldwide.",
          content: "The Sunnah Foundation is excited to announce a strategic partnership with the Global Education Network, an established organization specializing in online learning platforms. This collaboration will significantly expand our educational reach, allowing us to offer our Islamic studies courses and programs to students worldwide through state-of-the-art digital learning tools. The partnership includes plans to develop multilingual course materials, implement interactive learning approaches, and provide certification programs recognized by international educational institutions. This initiative represents a major step in our mission to make authentic Islamic knowledge accessible to diverse communities across the globe.",
          date: new Date("2023-04-22"),
          imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          category: "Partnership",
          author: "Yusuf Omar",
          slug: "partnership-global-education-network"
        }
      ]);
      
      console.log("News articles seeded");
    } else {
      console.log("News articles already exist, skipping");
    }

    // Seed programs
    const existingPrograms = await db.select().from(schema.programs);
    
    if (existingPrograms.length === 0) {
      await db.insert(schema.programs).values([
        {
          title: "Youth Mentorship Program",
          description: "Guidance and support for young Muslims navigating contemporary challenges while staying connected to their faith.",
          longDescription: "The Youth Mentorship Program pairs young Muslims with knowledgeable, trained mentors who provide guidance, support, and Islamic knowledge relevant to youth experiences. Through regular one-on-one sessions, group activities, and educational workshops, participants develop a stronger connection to their faith, build confidence in their Muslim identity, and receive practical advice for navigating school, career planning, and social pressures. The program spans 8 months with ongoing support and resources available to graduates.",
          category: "Youth Development",
          imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          slug: "youth-mentorship"
        },
        {
          title: "Quran Learning Program",
          description: "Comprehensive courses for Quran memorization, recitation, and understanding its deeper meanings.",
          longDescription: "The Quran Learning Program offers structured classes for students of all ages and proficiency levels, from beginners learning Arabic letters to advanced students pursuing complete memorization (hifz). Our qualified instructors employ effective teaching methods combining traditional and modern approaches to tajweed (proper recitation), memorization techniques, and tafsir (interpretation). Classes are available in-person and online with flexible scheduling options. The program includes regular progress assessments, certification upon completion of major milestones, and special events to celebrate achievements.",
          category: "Education",
          imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          slug: "quran-learning"
        },
        {
          title: "Community Food Bank",
          description: "Providing nutritious meals and essential groceries to families and individuals in need within our community.",
          longDescription: "Our Community Food Bank operates weekly to provide nutritious food packages to individuals and families experiencing food insecurity. The program distributes culturally appropriate groceries, fresh produce, and ready-to-eat meals prepared according to Islamic dietary guidelines. Beyond food distribution, the program connects recipients with additional resources and support services when needed. The food bank is operated by dedicated volunteers and sustained through donations from community members and local businesses. Anyone in need is welcome regardless of religious background.",
          category: "Community Service",
          imageUrl: "https://images.unsplash.com/photo-1593113598332-cd59a0c3a5bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          slug: "community-food-bank"
        },
        {
          title: "Family Counseling Services",
          description: "Professional guidance to help Muslim families navigate challenges and strengthen their bonds.",
          longDescription: "The Family Counseling Services program offers confidential, professional counseling services rooted in Islamic principles and modern psychological approaches. Our qualified counselors, who understand both Islamic values and contemporary family dynamics, provide guidance for couples experiencing marital difficulties, parents seeking effective parenting strategies, families navigating intergenerational challenges, and individuals coping with personal struggles. Services include pre-marital counseling, conflict resolution, grief support, and parenting workshops. All sessions are offered in a judgment-free environment with flexible scheduling and sliding scale fees to ensure accessibility.",
          category: "Family Support",
          imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          slug: "family-counseling"
        },
        {
          title: "Islamic Studies Courses",
          description: "In-depth classes covering various aspects of Islamic theology, history, and practice.",
          longDescription: "Our Islamic Studies Courses provide systematic, comprehensive education in foundational Islamic sciences for adults seeking deeper knowledge. The curriculum covers Aqeedah (Islamic theology), Fiqh (jurisprudence) of worship and daily life, Seerah (Prophetic biography), Islamic history, and contemporary issues from an Islamic perspective. Courses are designed in progressive levels from introductory to advanced, taught by qualified scholars with traditional training and academic credentials. Classes are offered in semester formats with flexible evening and weekend scheduling, available both in-person and online. Students receive comprehensive study materials and certification upon completion.",
          category: "Education",
          imageUrl: "https://images.unsplash.com/photo-1603695762547-fba8b83ba9f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          slug: "islamic-studies"
        },
        {
          title: "Community Outreach Events",
          description: "Building bridges with other communities through cultural exchanges and educational activities.",
          longDescription: "Our Community Outreach Events program organizes regular activities designed to foster mutual understanding and positive relationships between Muslims and the broader community. Events include open houses at our facility, participation in interfaith dialogues, educational presentations at schools and community organizations, and collaborative service projects addressing community needs. The program also coordinates emergency response and disaster relief efforts, demonstrating Islamic values through action. These initiatives help combat misconceptions about Islam while creating meaningful connections across diverse faith and cultural backgrounds.",
          category: "Community Engagement",
          imageUrl: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          slug: "community-outreach"
        }
      ]);
      
      console.log("Programs seeded");
    } else {
      console.log("Programs already exist, skipping");
    }

    // Seed team members
    const existingTeamMembers = await db.select().from(schema.teamMembers);
    
    if (existingTeamMembers.length === 0) {
      await db.insert(schema.teamMembers).values([
        {
          name: "Dr. Kemal Abubeker",
          title: "Executive Director",
          bio: "Ph.D. in Islamic Governance with over 15 years of experience in community leadership and development in Ethiopia.",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
          socialLinks: JSON.stringify({
            linkedin: "https://linkedin.com/in/kemal-abubeker",
            twitter: "https://twitter.com/kemal_abubeker",
            email: "kemal.abubeker@sunnahfoundation.org"
          }),
          isLeadership: true
        },
        {
          name: "Dr. Samira Hassan",
          title: "Academic Director",
          bio: "Specialist in Islamic curriculum development for Horn of Africa contexts, with extensive teaching experience in Addis Ababa.",
          imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
          socialLinks: JSON.stringify({
            linkedin: "https://linkedin.com/in/samira-hassan",
            twitter: "https://twitter.com/samira_hassan",
            email: "samira.hassan@sunnahfoundation.org"
          }),
          isLeadership: true
        },
        {
          name: "Sheikh Dawud Idris",
          title: "Spiritual Advisor",
          bio: "Renowned Ethiopian scholar with expertise in Fiqh, Hadith sciences, and promoting interfaith dialogue.",
          imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
          socialLinks: JSON.stringify({
            linkedin: "https://linkedin.com/in/dawud-idris",
            twitter: "https://twitter.com/dawud_idris",
            email: "dawud.idris@sunnahfoundation.org"
          }),
          isLeadership: true
        },
        {
          name: "Zainab Mohammed",
          title: "Community Outreach Director",
          bio: "Dedicated to building bridges and fostering development within Ethiopian Muslim communities through educational and social initiatives.",
          imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
          socialLinks: JSON.stringify({
            linkedin: "https://linkedin.com/in/zainab-mohammed",
            twitter: "https://twitter.com/zainab_mohammed",
            email: "zainab.mohammed@sunnahfoundation.org"
          }),
          isLeadership: true
        }
      ]);
      
      console.log("Team members seeded");
    } else {
      console.log("Team members already exist, skipping");
    }

    // Seed videos
    const existingVideos = await db.select().from(schema.videos);
    
    if (existingVideos.length === 0) {
      await db.insert(schema.videos).values([
        {
          title: "Understanding the Essence of Sunnah in Modern Times",
          description: "An in-depth discussion with renowned scholars about implementing the prophetic tradition in contemporary life.",
          thumbnailUrl: "https://images.unsplash.com/photo-1556761175-129418cb2dfe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
          videoUrl: "https://example.com/videos/sunnah-modern-times",
          duration: "42:15",
          views: 4328,
          date: new Date("2023-05-15"),
          category: "Islamic Knowledge",
          isFeatured: true,
          isMainFeature: true
        },
        {
          title: "Family Values in Islam",
          description: "Exploring the importance of family bonds and parenting in Islamic tradition.",
          thumbnailUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          videoUrl: "https://example.com/videos/family-values",
          duration: "24:15",
          views: 2356,
          date: new Date("2023-04-22"),
          category: "Family",
          isFeatured: true,
          isMainFeature: false
        },
        {
          title: "Importance of Seeking Knowledge",
          description: "How the pursuit of knowledge is emphasized in Islamic teachings.",
          thumbnailUrl: "https://images.unsplash.com/photo-1554679665-f5537f187268?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          videoUrl: "https://example.com/videos/seeking-knowledge",
          duration: "18:42",
          views: 1982,
          date: new Date("2023-04-10"),
          category: "Education",
          isFeatured: true,
          isMainFeature: false
        },
        {
          title: "Charity and Compassion",
          description: "Understanding the concept of giving and empathy in Islam.",
          thumbnailUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          videoUrl: "https://example.com/videos/charity-compassion",
          duration: "21:08",
          views: 1745,
          date: new Date("2023-03-28"),
          category: "Community Service",
          isFeatured: true,
          isMainFeature: false
        }
      ]);
      
      console.log("Videos seeded");
    } else {
      console.log("Videos already exist, skipping");
    }

    // Seed history events for about page
    const existingHistoryEvents = await db.select().from(schema.historyEvents);
    
    if (existingHistoryEvents.length === 0) {
      await db.insert(schema.historyEvents).values([
        {
          year: 2005,
          title: "Foundation Established",
          description: "The Sunnah Foundation was established by a group of dedicated scholars and community leaders with a vision to provide authentic Islamic education and community services.",
          imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sortOrder: 1
        },
        {
          year: 2008,
          title: "First Community Center",
          description: "Acquired our first dedicated facility to serve as a community center, offering prayer spaces, classrooms, and meeting areas for various educational and social programs.",
          imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sortOrder: 2
        },
        {
          year: 2012,
          title: "Launch of Educational Programs",
          description: "Developed and launched comprehensive Islamic studies curriculum and Quran learning programs for all age groups, taught by qualified instructors.",
          imageUrl: "https://images.unsplash.com/photo-1522661067900-ab829854a57f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sortOrder: 3
        },
        {
          year: 2015,
          title: "Community Services Expansion",
          description: "Expanded our services to include food bank, counseling services, and youth mentorship programs to address the diverse needs of our community.",
          imageUrl: "https://images.unsplash.com/photo-1593113630400-ea4288922497?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sortOrder: 4
        },
        {
          year: 2018,
          title: "Sunnah University Established",
          description: "Founded Sunnah University to offer accredited degree programs in Islamic studies and related disciplines, combining traditional knowledge with contemporary relevance.",
          imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sortOrder: 5
        },
        {
          year: 2020,
          title: "Launch of Daewa TV",
          description: "Created Daewa TV as our media platform to produce and distribute educational content, lectures, and inspirational programming to a global audience.",
          imageUrl: "https://images.unsplash.com/photo-1579165466741-7f35e4755183?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sortOrder: 6
        },
        {
          year: 2023,
          title: "Global Outreach Initiative",
          description: "Launched international partnerships to extend our educational programs and community service models to underserved Muslim communities worldwide.",
          imageUrl: "https://images.unsplash.com/photo-1553267751-1c148a7280a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sortOrder: 7
        }
      ]);
      
      console.log("History events seeded");
    } else {
      console.log("History events already exist, skipping");
    }

    // Seed university courses
    const existingCourses = await db.select().from(schema.universityCourses);
    
    if (existingCourses.length === 0) {
      await db.insert(schema.universityCourses).values([
        {
          title: "Bachelor of Arts in Islamic Studies (Ethiopian Focus)",
          description: "A comprehensive undergraduate program covering fundamental Islamic sciences, history, and contemporary applications relevant to Ethiopia.",
          level: "Undergraduate",
          duration: "4 years",
          instructors: JSON.stringify(["Dr. Kemal Abubeker", "Dr. Samira Hassan", "Sheikh Dawud Idris"]),
          imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Master of Arts in Islamic Theology & Ethiopian Muslim Heritage",
          description: "Advanced study of Islamic theology, philosophy, and the rich Muslim heritage of Ethiopia.",
          level: "Graduate",
          duration: "2 years",
          instructors: JSON.stringify(["Dr. Kemal Abubeker", "Dr. Medina Ismael"]),
          imageUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Diploma in Quranic Sciences & Amharic/Oromo Tafsir",
          description: "Specialized program focusing on Quranic exegesis, recitation, memorization, with tafsir resources in local languages.",
          level: "Diploma",
          duration: "1 year",
          instructors: JSON.stringify(["Sheikh Dawud Idris", "Sheikh Nur Hussein"]),
          imageUrl: "https://images.unsplash.com/photo-1584269600519-bdcf7847670b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Certificate in Hadith Studies & Ethiopian Sanad",
          description: "In-depth study of prophetic traditions, their authenticity, compilation, and application, including local chains of transmission (sanad).",
          level: "Certificate",
          duration: "6 months",
          instructors: JSON.stringify(["Dr. Samira Hassan", "Sheikh Dawud Idris"]),
          imageUrl: "https://images.unsplash.com/photo-1590596615969-1f070fdc809d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Contemporary Islamic Jurisprudence in the Ethiopian Context",
          description: "Explores the application of Islamic legal principles to modern issues and challenges facing Ethiopian Muslims.",
          level: "Graduate",
          duration: "1 year",
          instructors: JSON.stringify(["Dr. Kemal Abubeker", "Dr. Rashid Usman"]),
          imageUrl: "https://images.unsplash.com/photo-1531158644838-63cb9a38770b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        }
      ]);
      
      console.log("University courses seeded");
    } else {
      console.log("University courses already exist, skipping");
    }

    // Seed faculty members
    const existingFaculty = await db.select().from(schema.facultyMembers);
    
    if (existingFaculty.length === 0) {
      await db.insert(schema.facultyMembers).values([
        {
          name: "Dr. Kemal Abubeker",
          title: "Professor of Islamic Governance",
          specialization: "Islamic Political Thought and Ethiopian Muslim History",
          bio: "Ph.D. from a leading African university with 20 years of experience in academic research, teaching, and community development in Ethiopia.",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
        },
        {
          name: "Dr. Samira Hassan",
          title: "Associate Professor",
          specialization: "Hadith Sciences and Muslim Women's Studies in the Horn of Africa",
          bio: "Expert in Hadith methodology with a special focus on the narratives and contributions of Muslim women in Ethiopian tradition.",
          imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
        },
        {
          name: "Sheikh Dawud Idris",
          title: "Senior Lecturer",
          specialization: "Quranic Sciences, Recitation (Qira'at), and Ethiopian Tafsir Traditions",
          bio: "Certified Quran teacher with Ijazah in multiple Qira'at, expertise in Tafsir, and deep knowledge of Ethiopian Islamic scholarly traditions.",
          imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
        },
        {
          name: "Dr. Medina Ismael",
          title: "Assistant Professor",
          specialization: "Islamic History and Civilization in East Africa",
          bio: "Historian specializing in the early Islamic history of Ethiopia and the Horn of Africa, and its contributions to regional culture and scholarship.",
          imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
        },
        {
          name: "Sheikh Nur Hussein",
          title: "Instructor",
          specialization: "Fiqh (Islamic Jurisprudence) and Usul al-Fiqh in Ethiopian Contexts",
          bio: "Traditional Islamic scholar with training in multiple schools of Islamic law, focusing on their application within Ethiopian Muslim communities.",
          imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
        },
        {
          name: "Dr. Rashid Usman",
          title: "Visiting Professor",
          specialization: "Contemporary Islamic Thought and Social Issues in Ethiopia",
          bio: "Scholar focusing on Islamic responses to modern philosophical, ethical, and social challenges relevant to Ethiopian society.",
          imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
        }
      ]);
      
      console.log("Faculty members seeded");
    } else {
      console.log("Faculty members already exist, skipping");
    }

    // Seed site settings
    const existingSettings = await db.select().from(schema.siteSettings);
    
    if (existingSettings.length === 0) {
      await db.insert(schema.siteSettings).values([
        {
          key: "daewa_tv_url",
          value: "https://www.youtube.com/channel/UCxxxxxxxxxx",
          label: "Daewa TV YouTube Channel",
          description: "URL to the Sunnah Foundation's Daewa TV YouTube channel",
          group: "urls",
          type: "url"
        },
        {
          key: "sunnah_university_url",
          value: "https://university.sunnahfoundation.org",
          label: "Sunnah University Website",
          description: "URL to the Sunnah University website",
          group: "urls",
          type: "url"
        },
        {
          key: "contact_email",
          value: "contact@sunnahfoundation.org",
          label: "Contact Email",
          description: "Primary contact email address",
          group: "emails",
          type: "email"
        },
        {
          key: "facebook_url",
          value: "https://www.facebook.com/sunnahfoundation",
          label: "Facebook Page",
          description: "URL to the Sunnah Foundation's Facebook page",
          group: "social",
          type: "url"
        },
        {
          key: "twitter_url",
          value: "https://twitter.com/sunnahfoundation",
          label: "Twitter Profile",
          description: "URL to the Sunnah Foundation's Twitter profile",
          group: "social",
          type: "url"
        },
        {
          key: "instagram_url",
          value: "https://www.instagram.com/sunnahfoundation",
          label: "Instagram Profile",
          description: "URL to the Sunnah Foundation's Instagram profile",
          group: "social",
          type: "url"
        }
      ]);
      
      console.log("Site settings seeded");
    } else {
      console.log("Site settings already exist, skipping");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  } finally {
    // Ensure the connection pool is closed after seeding
    await pool.end();
    console.log("Database connection pool closed.");
  }
}

seed();
