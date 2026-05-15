import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  GetCartQueryParams,
  AddCartItemBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildCart(sessionId: string) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const [product] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, item.productId));

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(item.price),
        product: product
          ? {
              ...product,
              price: parseFloat(product.price),
              comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
              createdAt: product.createdAt.toISOString(),
            }
          : null,
      };
    })
  );

  const total = enrichedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

  return { items: enrichedItems, total, itemCount };
}

router.get("/cart", async (req, res): Promise<void> => {
  const parsed = GetCartQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cart = await buildCart(parsed.data.sessionId);
  res.json(cart);
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity, sessionId } = parsed.data;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId)
      )
    );

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      quantity,
      price: product.price,
    });
  }

  const cart = await buildCart(sessionId);
  res.status(201).json(cart);
});

router.patch("/cart/items/:id", async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Item no encontrado" });
    return;
  }

  if (parsed.data.quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.id));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: parsed.data.quantity, updatedAt: new Date() })
      .where(eq(cartItemsTable.id, params.data.id));
  }

  const cart = await buildCart(item.sessionId);
  res.json(cart);
});

router.delete("/cart/items/:id", async (req, res): Promise<void> => {
  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Item no encontrado" });
    return;
  }

  const sessionId = item.sessionId;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.id));

  const cart = await buildCart(sessionId);
  res.json(cart);
});

export default router;
