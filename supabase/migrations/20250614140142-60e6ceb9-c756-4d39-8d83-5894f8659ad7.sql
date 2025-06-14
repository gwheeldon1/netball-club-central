-- Add system settings table for admin-configurable values
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify system settings
CREATE POLICY "admin_can_manage_settings" ON public.system_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.guardians g ON g.id = ur.guardian_id
    WHERE g.id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  )
);

-- Insert default monthly subscription price setting
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, created_by)
VALUES 
  ('monthly_subscription_price_pence', '2500', 'number', 'Monthly subscription price per child in pence (£25.00)', auth.uid()),
  ('subscription_currency', 'GBP', 'string', 'Currency for subscriptions', auth.uid()),
  ('subscription_billing_day', '1', 'number', 'Day of month for billing (1-28)', auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();

-- Update subscriptions table to link to players properly
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Update payments table to support subscription billing
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'subscription', -- subscription, one_time, refund
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;