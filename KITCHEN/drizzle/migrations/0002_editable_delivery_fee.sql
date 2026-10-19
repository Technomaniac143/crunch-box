CREATE TABLE public.kitchen_delivery_settings (
 id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
 delivery_fee numeric(10,2) NOT NULL DEFAULT 50 CHECK (delivery_fee >= 0),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.kitchen_delivery_settings TO authenticated;
GRANT SELECT ON public.kitchen_delivery_settings TO anon;
GRANT ALL ON public.kitchen_delivery_settings TO service_role;
ALTER TABLE public.kitchen_delivery_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read delivery fee" ON public.kitchen_delivery_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owner creates delivery fee" ON public.kitchen_delivery_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner updates delivery fee" ON public.kitchen_delivery_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));