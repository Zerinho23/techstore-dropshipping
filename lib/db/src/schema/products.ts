import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 12, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id"),
  imageUrl: text("image_url"),
  imageUrls: text("image_urls"),
  aliexpressUrl: text("aliexpress_url"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sku: text("sku"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
