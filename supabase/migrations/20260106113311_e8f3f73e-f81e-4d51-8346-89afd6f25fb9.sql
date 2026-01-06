-- Referral codes table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Referral tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  qualified_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view own code" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own code" ON public.referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can validate active codes" ON public.referral_codes
  FOR SELECT USING (is_active = true);

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to process referral rewards when order is paid
CREATE OR REPLACE FUNCTION public.process_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  referral_record public.referrals%ROWTYPE;
  referrer_bonus INTEGER := 50;
  referred_bonus INTEGER := 25;
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE referred_id = NEW.customer_id
    AND status = 'pending'
    LIMIT 1;
    
    IF FOUND THEN
      UPDATE public.referrals
      SET status = 'rewarded',
          qualified_at = now(),
          rewarded_at = now(),
          points_earned = referrer_bonus
      WHERE id = referral_record.id;
      
      INSERT INTO public.rewards_points (user_id, total_points)
      VALUES (referral_record.referrer_id, referrer_bonus)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        total_points = rewards_points.total_points + referrer_bonus,
        updated_at = now();
      
      INSERT INTO public.rewards_points (user_id, total_points)
      VALUES (referral_record.referred_id, referred_bonus)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        total_points = rewards_points.total_points + referred_bonus,
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER trigger_referral_reward
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_reward();

-- Seed sample courses
INSERT INTO public.courses (title, description, content, reward_points, is_active, image_url) VALUES
('Smart Shopping 101', 'Learn the fundamentals of safe and savvy online shopping', '<h2>Welcome to Smart Shopping!</h2><p>In this course, you will learn:</p><ul><li>How to identify trustworthy sellers</li><li>Tips for comparing prices effectively</li><li>Understanding delivery options and fees</li><li>Making secure payments online</li></ul><p>Complete this course to earn 50 reward points!</p>', 50, true, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'),
('Finding the Best Deals', 'Become a deal hunter and save money on every purchase', '<h2>Master the Art of Deal Hunting</h2><p>This course covers:</p><ul><li>When to buy for maximum savings</li><li>Using price comparison tools</li><li>Understanding discount codes and offers</li><li>Timing your purchases right</li></ul><p>Knowledge is power - learn to shop smarter!</p>', 30, true, 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400'),
('Product Care Guide', 'Keep your purchases in excellent condition for longer', '<h2>Caring for Your Products</h2><p>Topics covered:</p><ul><li>General product care tips by category</li><li>Storage best practices</li><li>Cleaning and maintenance routines</li><li>Extending product lifespan</li></ul><p>Make your purchases last longer!</p>', 25, true, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400');

-- Seed sample prizes
INSERT INTO public.rewards_prizes (title, description, points_required, stock_quantity, is_active, image_url) VALUES
('₦500 Shopping Credit', 'Get ₦500 off your next purchase on any store', 100, 50, true, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400'),
('Free Delivery Voucher', 'Free delivery on your next order (up to ₦1,000 value)', 50, 100, true, 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400'),
('10% Discount Code', 'Get 10% off your next order (maximum ₦2,000 discount)', 75, 75, true, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400'),
('Priority Support Badge', 'Get priority customer support for 30 days', 25, 200, true, 'https://images.unsplash.com/photo-1553775927-a071d5a6a39a?w=400');