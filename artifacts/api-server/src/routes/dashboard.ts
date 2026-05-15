import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { sql, eq, desc, and, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/summary", async (_req, res): Promise<void> => {
  // Basic counts
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

  const [deliveredRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(eq(ordersTable.status, "delivered"));

  const [totalProductsRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.active, true));

  const [lowStockRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(sql`stock < 5 and active = true`);

  // Average order value
  const [avgRow] = await db
    .select({ avg: sql<string>`coalesce(avg(total), 0)` })
    .from(ordersTable);

  // Top products
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

  // Revenue by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const revenueByDayRaw = await db
    .select({
      date: sql<string>`date(created_at)::text`,
      revenue: sql<string>`coalesce(sum(total), 0)`,
      orders: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, thirtyDaysAgo))
    .groupBy(sql`date(created_at)`)
    .orderBy(sql`date(created_at)`);

  // Fill in missing days with 0
  const revenueMap = new Map(revenueByDayRaw.map((r) => [r.date, r]));
  const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = revenueMap.get(key);
    revenueByDay.push({
      date: key,
      revenue: row ? parseFloat(row.revenue) : 0,
      orders: row?.orders ?? 0,
    });
  }

  // Orders by status
  const ordersByStatusRaw = await db
    .select({
      status: ordersTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  // Low stock items (specific products)
  const lowStockItems = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      stock: productsTable.stock,
      imageUrl: productsTable.imageUrl,
    })
    .from(productsTable)
    .where(sql`stock < 5 and active = true`)
    .orderBy(productsTable.stock)
    .limit(6);

  const totalOrders = totalOrdersRow?.count ?? 0;
  const totalRevenue = parseFloat(revenueRow?.sum ?? "0");

  res.json({
    totalOrders,
    totalRevenue,
    pendingOrders: pendingRow?.count ?? 0,
    deliveredOrders: deliveredRow?.count ?? 0,
    totalProducts: totalProductsRow?.count ?? 0,
    lowStockProducts: lowStockRow?.count ?? 0,
    avgOrderValue: parseFloat(avgRow?.avg ?? "0"),
    topProducts: topProducts.map((p) => ({
      id: p.productId ?? 0,
      name: p.productName,
      sales: p.sales,
      revenue: parseFloat(p.revenue ?? "0"),
    })),
    revenueByDay,
    ordersByStatus: ordersByStatusRaw,
    lowStockItems,
  });
});

router.get("/recent-orders", async (_req, res): Promise<void> => {
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
        })),
      };
    })
  );

  res.json(result);
});

export default router;
