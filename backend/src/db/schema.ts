import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  city: text("city"),
});
