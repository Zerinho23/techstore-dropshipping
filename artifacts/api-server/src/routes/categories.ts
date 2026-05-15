import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { CreateCategoryBody } from "@workspace/api-zod";
import { sql, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);

  const result = await Promise.all(
    categories.map(async (cat) => {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(productsTable)
        .where(eq(productsTable.categoryId, cat.id));
      return {
        ...cat,
        productCount: countRow?.count ?? 0,
      };
    })
  );

  res.json(result);
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [category] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...category, productCount: 0 });
});

export default router;
