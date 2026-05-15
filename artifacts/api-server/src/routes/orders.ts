import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  return {
    ...order,
    total: parseFloat(order.total),
    createdAt: order.createdAt.toISOString(),
    items: items.map((item) => ({
      ...item,
      price: parseFloat(item.price),
      createdAt: undefined,
    })),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const orders = parsed.data.status
    ? await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.status, parsed.data.status))
        .orderBy(desc(ordersTable.createdAt))
    : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

  const result = await Promise.all(orders.map(buildOrder));
  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, ...orderData } = parsed.data;

  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "El carrito está vacío" });
    return;
  }

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const [order] = await db
    .insert(ordersTable)
    .values({ ...orderData, total: String(total), status: "pending" })
    .returning();

  for (const cartItem of cartItems) {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, cartItem.productId));

    await db.insert(orderItemsTable).values({
      orderId: order.id,
      productId: cartItem.productId,
      productName: product?.name ?? "Producto",
      quantity: cartItem.quantity,
      price: cartItem.price,
      imageUrl: product?.imageUrl ?? null,
    });
  }

  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  const result = await buildOrder(order);
  res.status(201).json(result);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Pedido no encontrado" });
    return;
  }

  const result = await buildOrder(order);
  res.json(GetOrderResponse.parse(result));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Pedido no encontrado" });
    return;
  }

  const result = await buildOrder(order);
  res.json(UpdateOrderStatusResponse.parse(result));
});

export default router;
