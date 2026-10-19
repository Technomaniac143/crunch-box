-- ==============================================================================
-- Migration 0003: Orders, Realtime Pipeline, State Machine & Menu Reconciliation
-- ==============================================================================

-- 1. Custom Types
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending_payment',
    'new',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'picked_up',
    'delivered',
    'rejected',
    'cancelled',
    'refund_pending',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM (
    'unpaid',
    'paid',
    'failed',
    'refund_pending',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Hardening: Drop open first-account-admin trigger
DROP TRIGGER IF EXISTS on_auth_user_created_kitchen ON auth.users;
DROP FUNCTION IF EXISTS public.grant_first_kitchen_admin();

-- 3. Business Settings Table
CREATE TABLE IF NOT EXISTS public.kitchen_business_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  accepting_orders boolean NOT NULL DEFAULT true,
  opening_time text NOT NULL DEFAULT '18:00',
  closing_time text NOT NULL DEFAULT '03:00',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  delivery_fee int NOT NULL DEFAULT 50 CHECK (delivery_fee >= 0),
  delivery_fee_paise int NOT NULL DEFAULT 5000 CHECK (delivery_fee_paise >= 0),
  sound_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.kitchen_business_settings (id, accepting_orders, opening_time, closing_time, timezone, delivery_fee, delivery_fee_paise, sound_enabled)
VALUES (true, true, '18:00', '03:00', 'Asia/Kolkata', 50, 5000, true)
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.kitchen_business_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.kitchen_business_settings TO authenticated;
GRANT ALL ON public.kitchen_business_settings TO service_role;

ALTER TABLE public.kitchen_business_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Read business settings" ON public.kitchen_business_settings FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Kitchen updates business settings" ON public.kitchen_business_settings FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 4. Order Number Sequence
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1040;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text LANGUAGE sql AS $$
  SELECT 'CB-' || nextval('public.order_number_seq')::text;
$$;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT public.next_order_number(),
  access_token text NOT NULL DEFAULT gen_random_uuid()::text,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  landmark text,
  special_instructions text,
  subtotal_paise int NOT NULL CHECK (subtotal_paise >= 0),
  delivery_fee_paise int NOT NULL CHECK (delivery_fee_paise >= 0),
  total_paise int NOT NULL CHECK (total_paise >= 0),
  refund_amount_paise int CHECK (refund_amount_paise >= 0),
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_lookup ON public.orders(id, access_token);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.menu_items(id),
  product_name text NOT NULL,
  variant_id uuid REFERENCES public.menu_item_variants(id),
  variant_name text,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price_paise int NOT NULL CHECK (unit_price_paise >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

CREATE TABLE IF NOT EXISTS public.order_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_status_events(order_id);

-- Order touches updated_at
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Grants & RLS for Orders
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT ALL ON public.order_items TO service_role;

GRANT SELECT, INSERT ON public.order_status_events TO anon, authenticated;
GRANT ALL ON public.order_status_events TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Kitchen staff manage all orders" ON public.orders FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public creates pending orders" ON public.orders FOR INSERT TO anon, authenticated
    WITH CHECK (status = 'pending_payment' AND payment_status = 'unpaid');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public reads own order with token" ON public.orders FOR SELECT TO anon, authenticated
    USING (access_token = current_setting('request.headers', true)::json->>'x-order-token' OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Kitchen staff manage order items" ON public.order_items FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public inserts pending order items" ON public.order_items FOR INSERT TO anon, authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.status = 'pending_payment'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Kitchen staff manage order events" ON public.order_status_events FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 7. Atomic State Machine RPC
CREATE OR REPLACE FUNCTION public.transition_order_status(
  p_order_id uuid,
  p_to_status public.order_status,
  p_note text DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_allowed boolean := false;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only kitchen staff can transition order status.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- Validate transitions
  IF v_order.status = 'new' AND p_to_status IN ('accepted', 'rejected') THEN v_allowed := true;
  ELSIF v_order.status = 'accepted' AND p_to_status IN ('preparing', 'cancelled') THEN v_allowed := true;
  ELSIF v_order.status = 'preparing' AND p_to_status = 'ready_for_pickup' THEN v_allowed := true;
  ELSIF v_order.status = 'ready_for_pickup' AND p_to_status = 'picked_up' THEN v_allowed := true;
  ELSIF v_order.status = 'picked_up' AND p_to_status = 'delivered' THEN v_allowed := true;
  END IF;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Illegal status transition from % to %', v_order.status, p_to_status;
  END IF;

  UPDATE public.orders
  SET 
    status = p_to_status,
    payment_status = CASE 
      WHEN p_to_status IN ('rejected', 'cancelled') AND payment_status = 'paid' THEN 'refund_pending'::public.payment_status 
      ELSE payment_status 
    END,
    refund_amount_paise = CASE 
      WHEN p_to_status IN ('rejected', 'cancelled') THEN total_paise 
      ELSE refund_amount_paise 
    END,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  INSERT INTO public.order_status_events (order_id, status, note)
  VALUES (p_order_id, p_to_status, p_note);

  RETURN v_order;
END;
$$;
GRANT EXECUTE ON FUNCTION public.transition_order_status(uuid, public.order_status, text) TO authenticated;

-- 8. Customer Order Lookup RPC
CREATE OR REPLACE FUNCTION public.get_customer_order(
  p_order_id uuid,
  p_access_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'customer_name', o.customer_name,
    'customer_phone', o.customer_phone,
    'delivery_address', o.delivery_address,
    'landmark', o.landmark,
    'special_instructions', o.special_instructions,
    'subtotal_paise', o.subtotal_paise,
    'delivery_fee_paise', o.delivery_fee_paise,
    'total_paise', o.total_paise,
    'created_at', o.created_at,
    'items', (
      SELECT jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'variant_name', oi.variant_name,
        'quantity', oi.quantity,
        'unit_price_paise', oi.unit_price_paise
      ))
      FROM public.order_items oi WHERE oi.order_id = o.id
    ),
    'history', (
      SELECT jsonb_agg(jsonb_build_object(
        'status', ose.status,
        'created_at', ose.created_at
      ) ORDER BY ose.created_at ASC)
      FROM public.order_status_events ose WHERE ose.order_id = o.id
    )
  ) INTO v_result
  FROM public.orders o
  WHERE o.id = p_order_id AND o.access_token = p_access_token;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_customer_order(uuid, text) TO anon, authenticated;

-- 9. Authoritative Menu Corrections & Seeds
-- A. Insert 7 Piece Chicken Box if not present
DO $$
DECLARE
  v_item_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = '7 Piece Chicken Box') THEN
    INSERT INTO public.menu_items (name, category, description, sort_order)
    VALUES ('7 Piece Chicken Box', 'Chicken', '1 Lollipop, 2 Strips, 2 Wings, 1 Leg and 1 Chest.', 8)
    RETURNING id INTO v_item_id;

    INSERT INTO public.menu_item_variants (item_id, name, price, sort_order)
    VALUES (v_item_id, '7 Pieces', 399, 1);
  END IF;
END $$;

-- B. Add Peri Peri variants to French Fries if missing
DO $$
DECLARE
  v_fries_id uuid;
BEGIN
  SELECT id INTO v_fries_id FROM public.menu_items WHERE name = 'French Fries' LIMIT 1;
  IF v_fries_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.menu_item_variants WHERE item_id = v_fries_id AND name = 'Regular Peri Peri') THEN
      INSERT INTO public.menu_item_variants (item_id, name, price, sort_order) VALUES
      (v_fries_id, 'Regular Peri Peri', 69, 4),
      (v_fries_id, 'Medium Peri Peri', 99, 5),
      (v_fries_id, 'Large Peri Peri', 129, 6);
    END IF;
  END IF;
END $$;

-- C. Update Combo prices to Authoritative Business Prices
UPDATE public.menu_item_variants
SET price = 259
WHERE name = 'Standard' AND item_id IN (SELECT id FROM public.menu_items WHERE name = 'Combo 1');

UPDATE public.menu_item_variants
SET price = 389
WHERE name = 'Standard' AND item_id IN (SELECT id FROM public.menu_items WHERE name = 'Combo 2');

UPDATE public.menu_item_variants
SET price = 249
WHERE name = 'Standard' AND item_id IN (SELECT id FROM public.menu_items WHERE name = 'Combo 3');
