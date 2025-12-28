const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");
const { relations, sql } = require("drizzle-orm");

//zamanlar
const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
};


// Kullanıcı Tablosu
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "editor", "user"] })
    .notNull()
    .default("user"),
  avatarUrl: text("avatar_url"),
  ...timestamps,
});

// Mekan Tablosu
const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  category: text("category").default("Diğer").notNull(),
  addres: text("address").notNull(),

  // Durum
  status: text("status", { enum: ["yikildi", "risk altinda", "restore edildi", "degisti"] })
    .notNull()
    .default("yikildi"),

  // Slider Resimleri
  imageBeforeUrl: text("image_before_url").notNull(),
  imageAfterUrl: text("image_after_url").notNull(),
  yearBefore: integer("year_before").notNull(),
  yearAfter: integer("year_after").notNull(),
  ...timestamps,
});

// Hikaye/Anı Tablosu
const stories = sqliteTable("stories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  isApproved: integer("is_approved", { mode: "boolean" }).default(false),
  ...timestamps,

  // İlişkiler (Foreign Keys)
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
});

// Ziyaretçi Tablosu
const visitors = sqliteTable("visitors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  visitCount: integer("visit_count").default(1).notNull(),
  lastActive: integer("last_active", { mode: "timestamp" }).notNull(), // JS Date objesi için timestamp modu
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Duyuru/Haber Tablosu
const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(), // URL dostu başlık
  content: text("content").notNull(),
  imageUrl: text("image_url"), // varsa kapak resmi
  isActive: integer("is_active", { mode: "boolean" }).default(true), // Yayında mı?
  ...timestamps,
});

// Galeri Resimleri Tablosu (mekanlar için)
const locationImages = sqliteTable("location_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(),
  ...timestamps,

  // Mekan İlişkisi
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
});

// Duyuru Resimleri Tablosu (duyurular için)
const announcementImages = sqliteTable("announcement_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(),
  ...timestamps,

  announcementId: integer("announcement_id")
    .notNull()
    .references(() => announcements.id, { onDelete: "cascade" }),
});


// ilişkiler

// Kullanıcının birden fazla hikayesi olabilir
const usersRelations = relations(users, ({ many }) => ({
  stories: many(stories),
}));

// Bir mekanın birden fazla hikayesi olabilir
const locationsRelations = relations(locations, ({ many }) => ({
  stories: many(stories),
  images: many(locationImages), // Bir mekanın çok resmi olur
}));

// Duyuru ilişkileri
const announcementsRelations = relations(announcements, ({ many }) => ({
  images: many(announcementImages),
}));

const announcementImagesRelations = relations(announcementImages, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementImages.announcementId],
    references: [announcements.id],
  }),
}));

// Bir resim tek mekana aittir
const locationImagesRelations = relations(locationImages, ({ one }) => ({
  location: one(locations, {
    fields: [locationImages.locationId],
    references: [locations.id],
  }),
}));

// Bir hikaye tek kullanıcıya ve tek mekana aittir
const storiesRelations = relations(stories, ({ one }) => ({
  author: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [stories.locationId],
    references: [locations.id],
  }),
}));

module.exports = {
  users,
  locations,
  stories,
  visitors,
  usersRelations,
  locationsRelations,
  storiesRelations,
  announcements,
  announcementImages,
  announcementsRelations,
  announcementImagesRelations,
  locationImages,
  locationImagesRelations,
};