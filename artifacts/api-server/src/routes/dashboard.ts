import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalOrdersRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable);

  const [revenueRow] = await db
    .select({ sum: sql<string>`coalesce(sum(total), 0)` })
    .from(ordersTable);

  const [pendingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));

  const [totalProductsRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.active, true));

  const [lowStockRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(sql`stock < 5 and active = true`);

  const topProducts = await db
    .select({
      productId: orderItemsTable.productId,
      productName: orderItemsTable.productName,
      sales: sql<number>`sum(${orderItemsTable.quantity})::int`,
      revenue: sql<string>`sum(${orderItemsTable.quantity} * ${orderItemsTable.price})`,
    })
    .from(orderItemsTable)
    .groupBy(orderItemsTable.productId, orderItemsTable.productName)
    .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
    .limit(5);

  res.json({
    totalOrders: totalOrdersRow?.count ?? 0,
    totalRevenue: parseFloat(revenueRow?.sum ?? "0"),
    pendingOrders: pendingRow?.count ?? 0,
    totalProducts: totalProductsRow?.count ?? 0,
    lowStockProducts: lowStockRow?.count ?? 0,
    topProducts: topProducts.map((p) => ({
      id: p.productId ?? 0,
      name: p.productName,
      sales: p.sales,
      revenue: parseFloat(p.revenue ?? "0"),
    })),
  });
});

router.get("/dashboard/recent-orders", async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  const result = await Promise.all(
    orders.map(async (order) => {
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
    })
  );

  res.json(result);
});

export default router;
