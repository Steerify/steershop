

# Marketing Mastery Courses for Shop Owners + Admin Engagement Button Confirmation

## Admin Engagement Reminders Button -- CONFIRMED WORKING

The "Run Engagement Reminders Now" button already exists on the Admin Dashboard (`/admin`). When clicked, it:

1. Calls the `engagement-reminders` backend function
2. Scans ALL users for: incomplete registrations (24h+), no shop created (48h+), no products (72h+), no sales (7 days+)
3. Sends appropriate reminder emails (with AI-generated tips for no-sales scenario)
4. Shows results summary with counts for each category
5. Prevents duplicate emails (same type not re-sent within 7 days)

No changes needed here -- it is fully functional.

---

## New Courses: Shop Owner Marketing Masterclass Series

I will insert 5 comprehensive courses into the database via the admin courses system, all targeted at `shop_owner` audience. These courses cover every marketing tool available on the platform.

### Course 1: "WhatsApp Marketing Mastery"
**Reward Points:** 40

Covers:
- Setting up your WhatsApp business number on SteerSolo
- How the storefront "Contact Seller" button drives WhatsApp conversations
- Crafting compelling WhatsApp Status posts to promote products
- Using order confirmation messages as a re-engagement tool
- Best times to post WhatsApp Status updates in Nigeria
- Creating a WhatsApp broadcast list from your customer base
- Responding quickly to boost your shop's reputation

### Course 2: "Create Eye-Catching Marketing Posters with AI"
**Reward Points:** 50

Covers:
- Navigating the Marketing Hub and Poster Library
- Choosing the right template for your campaign (Instagram Story, WhatsApp Status, etc.)
- Using the AI Assistant to generate headlines and promotional copy
- Customizing colors, text, and branding on the canvas editor
- Downloading and sharing posters across social media
- Creating seasonal and holiday-themed promotions
- Step-by-step: Making your first "Flash Sale" poster in under 5 minutes

### Course 3: "Boost Your Sales with Product Listings That Convert"
**Reward Points:** 35

Covers:
- Writing product titles that catch attention and rank in search
- Crafting descriptions that answer buyer questions before they ask
- Taking great product photos with just your phone
- Using the image upload and compression features effectively
- Setting competitive prices in the Nigerian market
- Managing stock quantities to create urgency
- Adding services with booking features to expand your offerings

### Course 4: "Build Trust & Get Verified on SteerSolo"
**Reward Points:** 45

Covers:
- Why verification badges increase sales (trust psychology)
- How to complete KYC Level 2 verification (BVN + Bank)
- How shop verification works (rating 4.0+ and consistent sales)
- Encouraging customers to leave reviews after purchase
- Responding to reviews professionally (positive and negative)
- Setting up your bank details and Paystack for seamless payments
- How the "Verified Business" badge appears on your storefront

### Course 5: "Growing Your Customer Base: The Complete Guide"
**Reward Points:** 50

Covers:
- Sharing your unique store link on social media platforms
- Using the referral system to grow organically
- Understanding your shop analytics and what metrics matter
- Google Business Profile setup via Marketing Services
- Booking a free marketing consultation session
- Leveraging featured shop placements for visibility
- Creating special offers and discount codes
- Re-engagement: how the platform automatically reminds inactive buyers
- Tips for Nigerian market: local trends, payment preferences, delivery expectations

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/AdminDashboard.tsx` | No change | Already has the engagement reminders button |
| Database (courses table) | INSERT | Add 5 new courses via code that runs on admin page or direct insert |

Since courses are created through the admin UI (which writes to the database), I will create a one-time seed script that inserts these 5 courses directly into the `courses` table. This is cleaner than requiring you to manually type each course through the admin form.

## Technical Approach

I will create a utility component/page or a simple function that the admin can trigger once to seed these courses. Alternatively, I can insert them via a database migration. The migration approach is cleaner since it's a one-time operation.

### Database Insert (Migration)

```sql
INSERT INTO courses (title, description, content, image_url, reward_points, is_active, target_audience) VALUES
  ('WhatsApp Marketing Mastery', '...', '<detailed HTML content>', 'unsplash-url', 40, true, 'shop_owner'),
  ('Create Eye-Catching Marketing Posters with AI', '...', '<detailed HTML content>', 'unsplash-url', 50, true, 'shop_owner'),
  -- ... 3 more courses
```

Each course will have rich HTML content with:
- Structured headings (h2, h3)
- Ordered step-by-step lists
- Bold key terms
- Practical tips and examples specific to the Nigerian market
- Links to relevant platform pages (e.g., /marketing, /identity-verification)

---

## Expected Outcomes

| Item | Result |
|------|--------|
| Admin engagement button | Already working -- confirmed |
| Course 1: WhatsApp Marketing | Teaches WhatsApp selling strategies |
| Course 2: AI Poster Creation | Teaches the Marketing Hub + Poster Editor |
| Course 3: Product Listings | Teaches product optimization |
| Course 4: Trust & Verification | Teaches KYC and review management |
| Course 5: Customer Growth | Comprehensive growth guide |
| All courses | Targeted to shop_owner, active, with reward points |

