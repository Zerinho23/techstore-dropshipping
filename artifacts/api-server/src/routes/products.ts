import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, search, featured, limit = 100, offset = 0 } = parsed.data;

  const conditions = [];

  if (category) {
    const cat = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, category))
      .limit(1);
    if (cat[0]) {
      conditions.push(eq(productsTable.categoryId, cat[0].id));
    }
  }

  if (search) {
    conditions.push(ilike(productsTable.name, `%${search}%`));
  }

  if (featured === "true") {
    conditions.push(eq(productsTable.featured, true));
  }

  conditions.push(eq(productsTable.active, true));

  const products = await db
    .select()
    .from(productsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit ?? 100)
    .offset(offset ?? 0)
    .orderBy(productsTable.createdAt);

  const result = products.map((p) => ({
    ...p,
    price: parseFloat(p.price),
    comparePrice: p.comparePrice ? parseFloat(p.comparePrice) : null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(result);
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      ...parsed.data,
      price: String(parsed.data.price),
      comparePrice: parsed.data.comparePrice != null ? String(parsed.data.comparePrice) : null,
    })
    .returning();

  res.status(201).json({
    ...product,
    price: parseFloat(product.price),
    comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
    createdAt: product.createdAt.toISOString(),
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  res.json(GetProductResponse.parse({
    ...product,
    price: parseFloat(product.price),
    comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
    createdAt: product.createdAt.toISOString(),
  }));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price != null) updateData.price = String(parsed.data.price);
  if (parsed.data.comparePrice != null) updateData.comparePrice = String(parsed.data.comparePrice);

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  res.json(UpdateProductResponse.parse({
    ...product,
    price: parseFloat(product.price),
    comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
    createdAt: product.createdAt.toISOString(),
  }));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
