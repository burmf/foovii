-- Orders table, indexes, triggers, and analytics helpers for Foovii

CREATE TYPE IF NOT EXISTS public.order_status AS ENUM (
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled'
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  items JSONB NOT NULL,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'AUD',
  status public.order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  completed_at TIMESTAMPTZ NULL
);

ALTER TABLE public.orders
  ADD CONSTRAINT orders_store_slug_order_number_unique
  UNIQUE (store_slug, order_number);

CREATE INDEX IF NOT EXISTS orders_store_created_idx
  ON public.orders (store_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS orders_status_created_idx
  ON public.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS orders_store_status_created_idx
  ON public.orders (store_slug, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_touch_updated_at ON public.orders;
CREATE TRIGGER orders_touch_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_orders_updated_at();

COMMENT ON TABLE public.orders IS 'Customer orders from QR menu system';
COMMENT ON COLUMN public.orders.order_number IS 'Human-readable order number (e.g., DD-001) scoped per store';
COMMENT ON COLUMN public.orders.items IS 'Order line items as JSON array';
COMMENT ON COLUMN public.orders.status IS 'Order workflow status';

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_service_role_rw" ON public.orders;
CREATE POLICY "orders_service_role_rw" ON public.orders
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "orders_authenticated_read" ON public.orders;
CREATE POLICY "orders_authenticated_read" ON public.orders
  FOR SELECT
  USING (auth.role() IN ('service_role', 'authenticated'));

CREATE OR REPLACE VIEW public.order_history_view AS
SELECT
  o.id,
  o.store_slug,
  o.order_number,
  o.customer_name,
  o.customer_phone,
  o.customer_email,
  o.total_cents,
  o.currency,
  o.status,
  o.notes,
  o.created_at,
  o.updated_at,
  o.completed_at,
  date_trunc('day', o.created_at) AS order_date,
  extract(hour FROM o.created_at) AS order_hour
FROM public.orders o;

CREATE OR REPLACE VIEW public.order_metrics_view AS
SELECT
  o.store_slug,
  date_trunc('hour', o.created_at) AS hour_bucket,
  COUNT(*) FILTER (WHERE o.status != 'cancelled') AS total_orders,
  COUNT(*) FILTER (WHERE o.status = 'completed') AS completed_orders,
  COUNT(*) FILTER (WHERE o.status IN ('pending','preparing','ready')) AS open_orders,
  COALESCE(SUM(o.total_cents), 0) AS total_cents,
  COALESCE(SUM(o.total_cents) FILTER (WHERE o.status = 'completed'), 0) AS completed_cents,
  AVG(
    CASE
      WHEN o.completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (o.completed_at - o.created_at)) / 60
    END
  ) AS avg_fulfillment_minutes
FROM public.orders o
GROUP BY o.store_slug, date_trunc('hour', o.created_at);
