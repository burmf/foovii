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
  const today = new Date().toISOString().split('T')[0];
  
  const result = await sql`
    SELECT COUNT(*) as count
    FROM orders
    WHERE store_slug = ${storeSlug}
    AND created_at::date = ${today}::date
  `;
  
  const count = parseInt(result[0].count as string) + 1;
  return `${storePrefix}-${count.toString().padStart(3, '0')}`;
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
      ${JSON.stringify(data.items)},
      ${data.total_cents},
      ${data.currency || 'AUD'},
      ${data.notes || null},
      'pending'
    )
    RETURNING *
  `;
  
  const order = result[0];
  return {
    ...order,
    items: JSON.parse(order.items as string),
  } as Order;
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
  
  return result.map((order) => ({
    ...order,
    items: JSON.parse(order.items as string),
  })) as Order[];
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
  return {
    ...order,
    items: JSON.parse(order.items as string),
  } as Order;
}
