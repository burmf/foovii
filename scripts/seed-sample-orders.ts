import postgres from "postgres";
import { loadEnvFile } from "./utils/load-env";

loadEnvFile();

type SeedOrder = {
  store_slug: string;
  order_number: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  total_cents: number;
  currency?: string;
  notes?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
  created_at_offset_minutes?: number;
  completed_at_offset_minutes?: number;
};

const SAMPLE_ORDERS: SeedOrder[] = [
  {
    store_slug: "dodam",
    order_number: "DD-101",
    status: "completed",
    customer_name: "Sakura Tanaka",
    customer_phone: "+81-90-1111-1111",
    total_cents: 4200,
    currency: "AUD",
    created_at_offset_minutes: -120,
    completed_at_offset_minutes: -90,
    items: [
      { id: "bulgogi-bowl", name: "Bulgogi Bowl", price: 1800, quantity: 1 },
      {
        id: "kimchi-pancake",
        name: "Kimchi Pancake",
        price: 2400,
        quantity: 1,
      },
    ],
  },
  {
    store_slug: "dodam",
    order_number: "DD-102",
    status: "ready",
    customer_name: "Liam Nguyen",
    customer_email: "liam@example.com",
    total_cents: 3600,
    currency: "AUD",
    created_at_offset_minutes: -45,
    items: [{ id: "bibimbap", name: "Bibimbap", price: 1800, quantity: 2 }],
  },
  {
    store_slug: "soy38",
    order_number: "SO-050",
    status: "preparing",
    customer_name: "Mia Chen",
    total_cents: 2750,
    currency: "AUD",
    created_at_offset_minutes: -25,
    items: [
      { id: "pad-thai", name: "Pad Thai", price: 1350, quantity: 1 },
      { id: "thai-iced-tea", name: "Thai Iced Tea", price: 1400, quantity: 1 },
    ],
    notes: "Less spicy please.",
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. See config/.env.example.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
  });

  try {
    console.info("Seeding sample orders...");
    for (const order of SAMPLE_ORDERS) {
      const createdAt = new Date(
        Date.now() + (order.created_at_offset_minutes ?? 0) * 60 * 1000,
      );
      const completedAt = order.completed_at_offset_minutes
        ? new Date(Date.now() + order.completed_at_offset_minutes * 60 * 1000)
        : null;

      await sql`
        INSERT INTO public.orders (
          store_slug,
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          items,
          total_cents,
          currency,
          status,
          notes,
          created_at,
          completed_at
        ) VALUES (
          ${order.store_slug},
          ${order.order_number},
          ${order.customer_name ?? null},
          ${order.customer_phone ?? null},
          ${order.customer_email ?? null},
          ${sql.json(order.items)},
          ${order.total_cents},
          ${order.currency ?? "AUD"},
          ${order.status},
          ${order.notes ?? null},
          ${createdAt.toISOString()},
          ${completedAt ? completedAt.toISOString() : null}
        )
        ON CONFLICT (store_slug, order_number)
        DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_phone = EXCLUDED.customer_phone,
          customer_email = EXCLUDED.customer_email,
          items = EXCLUDED.items,
          total_cents = EXCLUDED.total_cents,
          currency = EXCLUDED.currency,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          created_at = EXCLUDED.created_at,
          completed_at = EXCLUDED.completed_at,
          updated_at = timezone('utc', now());
      `;
    }

    console.info(
      "Sample orders seeded. Verify via /api/orders/history or Supabase dashboard.",
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error("Failed to seed orders:", error);
  process.exit(1);
});
