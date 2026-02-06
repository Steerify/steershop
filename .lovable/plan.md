
# Fix Engagement Reminders, Add Video Support, WhatsApp Community Notification, and Fix Storefront Buttons

## 1. Engagement Reminders -- Verify and Harden

The engagement reminders edge function has 5 scenarios that are structurally correct. However, there are reliability issues to fix:

- **Scenario 2 (No Shop Created)**: Currently queries ALL `shop_owner` profiles older than 48h, then checks for shops one-by-one in a loop. This is inefficient and could time out with many users. Will optimize with a single query using a LEFT JOIN approach.
- **Scenario 4 (No Sales)**: The store link in the email uses `shop.id` instead of `shop_slug`, so links won't work. Will fix to use the shop slug.
- **General**: Add a try/catch around each scenario so one failure doesn't block all others.

## 2. Video Support for Tutorials/Courses

The `courses` table currently has no `video_url` column. Will add one.

**Database:**
- Add `video_url` TEXT column to `courses` table

**Admin Courses page (`AdminCourses.tsx`):**
- Add a `video_url` text input field in the form for pasting a video URL (YouTube, direct MP4, etc.)
- Display a video indicator in the courses table

**Course display pages (`EntrepreneurCourses.tsx`, `CustomerCourses.tsx`):**
- In the course content modal, if `video_url` exists, render a `<video>` element (for direct URLs) or an iframe (for YouTube) above the HTML content
- For direct video files: autoplay muted, loop, max 10 seconds enforced via `timeupdate` event listener that pauses at 10s

## 3. Video Support for Products

The `products` table already has a `video_url` column. However, it's not used anywhere in the UI.

**Product creation (`Products.tsx`):**
- Add a video upload section below the image upload using a new `VideoUpload` component
- Accept MP4, WebM, MOV files up to 20MB
- Client-side duration check: if video > 10 seconds, reject with an error message (browser-side compression of video is not reliably possible, so we enforce the limit instead)
- Upload to a `product-videos` storage bucket

**Product display (Storefront + ProductDetails):**
- In `ShopStorefront.tsx` product cards: if `video_url` exists, show a looping muted video instead of the static image
- In `ProductDetails.tsx`: show the video player prominently with controls

**Product service (`product.service.ts`):**
- Include `video_url` in create and update operations

## 4. WhatsApp Community Notification

Add a dismissible banner/notification prompting users to join the SteerSolo WhatsApp community.

- Create a `WhatsAppCommunityBanner` component shown at the top of authenticated pages (Dashboard, CustomerDashboard)
- Uses `localStorage` to track dismissal so it doesn't reappear after closed 3 times
- Shows a WhatsApp icon, message about joining the community, and a "Join Now" button linking to the WhatsApp group invite URL
- Dismissible with an X button

## 5. Fix Storefront Buttons (from screenshot)

The storefront header buttons ("Contact Us", "Take Tour", cart) have inconsistent styling and don't wrap well on mobile.

**Fix in `ShopStorefront.tsx`:**
- Make all three buttons consistent: same size, same variant style
- On mobile, stack "Contact Us" and "Take Tour" below the shop info, and keep the cart button floating or in the header
- Ensure proper `flex-wrap` and `gap` so buttons don't overlap on small screens
- Give all buttons `min-h-[44px]` for touch targets

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | CREATE | Add `video_url` to `courses`, create `product-videos` bucket |
| `supabase/functions/engagement-reminders/index.ts` | MODIFY | Add per-scenario error handling, fix shop link URL, optimize queries |
| `src/pages/admin/AdminCourses.tsx` | MODIFY | Add video_url field to course form |
| `src/pages/entrepreneur/EntrepreneurCourses.tsx` | MODIFY | Render video in course content modal |
| `src/pages/customer/CustomerCourses.tsx` | MODIFY | Render video in course content modal |
| `src/components/VideoUpload.tsx` | CREATE | New component for uploading short videos with duration validation |
| `src/pages/Products.tsx` | MODIFY | Add video upload to product form |
| `src/services/product.service.ts` | MODIFY | Include video_url in create/update |
| `src/pages/ShopStorefront.tsx` | MODIFY | Show video on product cards, fix button layout |
| `src/pages/ProductDetails.tsx` | MODIFY | Show video player on product detail page |
| `src/components/WhatsAppCommunityBanner.tsx` | CREATE | Dismissible banner for WhatsApp community |
| `src/pages/Dashboard.tsx` | MODIFY | Add WhatsAppCommunityBanner |
| `src/pages/customer/CustomerDashboard.tsx` | MODIFY | Add WhatsAppCommunityBanner |

## Technical Details

### Video Duration Validation (Client-side)
```typescript
const validateVideoDuration = (file: File, maxSeconds: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration <= maxSeconds);
    };
    video.onerror = () => resolve(false);
    video.src = URL.createObjectURL(file);
  });
};
```

### Course Video Rendering
```typescript
// If video_url exists, show above content
{course.video_url && (
  <video 
    src={course.video_url} 
    controls 
    className="w-full rounded-lg"
    controlsList="nodownload"
  />
)}
```

### Storefront Button Fix
```typescript
// Wrap buttons properly with consistent styling
<div className="flex flex-wrap items-center gap-2">
  {shop.whatsapp_number && (
    <Button variant="outline" size="sm" onClick={...}>
      <MessageCircle className="w-4 h-4 mr-2" />
      Contact Us
    </Button>
  )}
  <TourButton ... />
  {getTotalItems() > 0 && (
    <Button size="sm" onClick={...}>
      <ShoppingCart className="w-4 h-4 mr-2" />
      Cart ({getTotalItems()})
    </Button>
  )}
</div>
```

### Engagement Reminders Fix
- Wrap each scenario in its own try/catch so failures are isolated
- Fix Scenario 4 store link: change `shop/${shop.id}` to use shop slug (query `shop_slug` from shops table)
