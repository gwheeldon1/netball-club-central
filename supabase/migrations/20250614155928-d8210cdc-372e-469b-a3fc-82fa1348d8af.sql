-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Insert default system settings for subscription pricing
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, created_by)
VALUES 
  ('subscription_monthly_price_pence', '1500', 'integer', 'Monthly subscription price in pence (£15.00)', NULL),
  ('subscription_currency', 'GBP', 'string', 'Default currency for subscriptions', NULL),
  ('stripe_success_url', '/subscription-success', 'string', 'Relative URL for successful subscription', NULL),
  ('stripe_cancel_url', '/children', 'string', 'Relative URL for cancelled subscription', NULL)
ON CONFLICT (setting_key) DO NOTHING;