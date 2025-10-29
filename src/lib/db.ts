import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
});

export type Order = {
  id: string;
  store_slug: string;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  items: OrderItem[];
  total_cents: number;
  currency: string;
  status: OrderStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
};

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export async function generateOrderNumber(storeSlug: string): Promise<string> {
  const storePrefix = storeSlug.substring(0, 2).toUpperCase();
  
  const result = await sql`
    SELECT order_number
    FROM orders
    WHERE store_slug = ${storeSlug}
    AND order_number LIKE ${storePrefix + '-%'}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  let nextNumber = 1;
  if (result.length > 0) {
    const lastOrderNumber = result[0].order_number as string;
    const lastNumber = parseInt(lastOrderNumber.split('-')[1]);
    nextNumber = lastNumber + 1;
  }
  
  return `${storePrefix}-${nextNumber.toString().padStart(3, '0')}`;
}

export async function createOrder(data: {
  store_slug: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: OrderItem[];
  total_cents: number;
  currency?: string;
  notes?: string;
}): Promise<Order> {
  const orderNumber = await generateOrderNumber(data.store_slug);
  
  const result = await sql`
    INSERT INTO orders (
      store_slug,
      order_number,
      customer_name,
      customer_phone,
      customer_email,
      items,
      total_cents,
      currency,
      notes,
      status
    ) VALUES (
      ${data.store_slug},
      ${orderNumber},
      ${data.customer_name || null},
      ${data.customer_phone || null},
      ${data.customer_email || null},
      ${sql.json(data.items)},
      ${data.total_cents},
      ${data.currency || 'AUD'},
      ${data.notes || null},
      'pending'
    )
    RETURNING *
  `;
  
  const order = result[0];
  return order as Order;
}

export async function getOrders(filters?: {
  store_slug?: string;
  status?: OrderStatus | OrderStatus[];
  limit?: number;
}): Promise<Order[]> {
  let query = sql`SELECT * FROM orders WHERE 1=1`;
  
  if (filters?.store_slug) {
    query = sql`${query} AND store_slug = ${filters.store_slug}`;
  }
  
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = sql`${query} AND status = ANY(${filters.status})`;
    } else {
      query = sql`${query} AND status = ${filters.status}`;
    }
  }
  
  query = sql`${query} ORDER BY created_at DESC`;
  
  if (filters?.limit) {
    query = sql`${query} LIMIT ${filters.limit}`;
  }
  
  const result = await query;
  
  return result as unknown as Order[];
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const completedAt = status === 'completed' ? new Date() : null;
  
  const result = await sql`
    UPDATE orders
    SET status = ${status},
        completed_at = ${completedAt}
    WHERE id = ${orderId}
    RETURNING *
  `;
  
  if (result.length === 0) {
    throw new Error('Order not found');
  }
  
  const order = result[0];
  return order as Order;
}

export type Analytics = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  avgFulfillmentTime: number | null;
  completedOrders: number;
  pendingOrders: number;
  hourlyData: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
  comparison?: {
    revenue: number;
    orders: number;
    avgOrderValue: number;
  };
};

export type OrderHistoryResult = {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
};

export async function getOrderHistory(filters?: {
  startDate?: string;
  endDate?: string;
  storeSlug?: string;
  statuses?: string[];
  orderNumber?: string;
  limit?: number;
  offset?: number;
}): Promise<OrderHistoryResult> {
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  let countQuery = sql`SELECT COUNT(*) as total FROM orders WHERE 1=1`;
  let dataQuery = sql`SELECT * FROM orders WHERE 1=1`;

  if (filters?.startDate) {
    countQuery = sql`${countQuery} AND created_at >= ${filters.startDate}`;
    dataQuery = sql`${dataQuery} AND created_at >= ${filters.startDate}`;
  }

  if (filters?.endDate) {
    countQuery = sql`${countQuery} AND created_at <= ${filters.endDate}`;
    dataQuery = sql`${dataQuery} AND created_at <= ${filters.endDate}`;
  }

  if (filters?.storeSlug) {
    countQuery = sql`${countQuery} AND store_slug = ${filters.storeSlug}`;
    dataQuery = sql`${dataQuery} AND store_slug = ${filters.storeSlug}`;
  }

  if (filters?.statuses && filters.statuses.length > 0) {
    countQuery = sql`${countQuery} AND status = ANY(${filters.statuses})`;
    dataQuery = sql`${dataQuery} AND status = ANY(${filters.statuses})`;
  }

  if (filters?.orderNumber) {
    countQuery = sql`${countQuery} AND order_number ILIKE ${'%' + filters.orderNumber + '%'}`;
    dataQuery = sql`${dataQuery} AND order_number ILIKE ${'%' + filters.orderNumber + '%'}`;
  }

  dataQuery = sql`${dataQuery} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const [countResult, dataResult] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  const total = parseInt(countResult[0].total as string);
  const orders = dataResult as unknown as Order[];

  return {
    orders,
    total,
    limit,
    offset,
  };
}

export async function getAnalytics(filters?: {
  store_slug?: string;
  startDate?: Date;
  endDate?: Date;
  compareWithPrevious?: boolean;
}): Promise<Analytics> {
  const startDate = filters?.startDate || new Date(new Date().setHours(0, 0, 0, 0));
  const endDate = filters?.endDate || new Date(new Date().setHours(23, 59, 59, 999));
  
  let query = sql`
    SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(total_cents), 0) as total_revenue,
      COALESCE(AVG(total_cents), 0) as avg_order_value,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
      COUNT(CASE WHEN status IN ('pending', 'preparing', 'ready') THEN 1 END) as pending_orders,
      AVG(
        CASE 
          WHEN completed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 60
        END
      ) as avg_fulfillment_minutes
    FROM orders
    WHERE created_at >= ${startDate.toISOString()}
    AND created_at <= ${endDate.toISOString()}
    AND status != 'cancelled'
  `;
  
  if (filters?.store_slug) {
    query = sql`${query} AND store_slug = ${filters.store_slug}`;
  }
  
  const result = await query;
  const stats = result[0];
  
  let hourlyQuery = sql`
    SELECT
      TO_CHAR(created_at, 'HH24:00') as hour,
      COUNT(*) as orders,
      COALESCE(SUM(total_cents), 0) as revenue
    FROM orders
    WHERE created_at >= ${startDate.toISOString()}
    AND created_at <= ${endDate.toISOString()}
    AND status != 'cancelled'
  `;
  
  if (filters?.store_slug) {
    hourlyQuery = sql`${hourlyQuery} AND store_slug = ${filters.store_slug}`;
  }
  
  hourlyQuery = sql`${hourlyQuery}
    GROUP BY TO_CHAR(created_at, 'HH24:00')
    ORDER BY hour
  `;
  
  const hourlyResult = await hourlyQuery;
  
  const analytics: Analytics = {
    totalRevenue: parseFloat(stats.total_revenue as string) / 100,
    totalOrders: parseInt(stats.total_orders as string),
    avgOrderValue: parseFloat(stats.avg_order_value as string) / 100,
    avgFulfillmentTime: stats.avg_fulfillment_minutes ? parseFloat(stats.avg_fulfillment_minutes as string) : null,
    completedOrders: parseInt(stats.completed_orders as string),
    pendingOrders: parseInt(stats.pending_orders as string),
    hourlyData: hourlyResult.map((row) => ({
      hour: row.hour as string,
      orders: parseInt(row.orders as string),
      revenue: parseFloat(row.revenue as string) / 100,
    })),
  };
  
  if (filters?.compareWithPrevious) {
    const duration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - duration);
    const prevEndDate = new Date(startDate.getTime() - 1);
    
    let compQuery = sql`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_cents), 0) as total_revenue,
        COALESCE(AVG(total_cents), 0) as avg_order_value
      FROM orders
      WHERE created_at >= ${prevStartDate.toISOString()}
      AND created_at <= ${prevEndDate.toISOString()}
      AND status != 'cancelled'
    `;
    
    if (filters?.store_slug) {
      compQuery = sql`${compQuery} AND store_slug = ${filters.store_slug}`;
    }
    
    const compResult = await compQuery;
    const compStats = compResult[0];
    
    analytics.comparison = {
      revenue: parseFloat(compStats.total_revenue as string) / 100,
      orders: parseInt(compStats.total_orders as string),
      avgOrderValue: parseFloat(compStats.avg_order_value as string) / 100,
    };
  }
  
  return analytics;
}
