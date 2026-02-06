

# Enhanced Marketing Canvas + Dashboard Tutorials

## Overview

Two main improvements: (1) upgrade the marketing poster editor with real download, image support, better templates, and social sharing; (2) add a "Tutorials" quick action on the shop owner dashboard linking to a new entrepreneur courses page.

---

## Part 1: Enhanced Canvas Editor

### Current Gaps
- Image tab shows "coming soon"
- Export button only saves to database, no actual file download
- No social media sharing
- Limited template variety
- No drag-and-drop element repositioning

### Changes to `src/components/marketing/CanvasEditor.tsx`

**1.1 Real Canvas Export via html-to-canvas approach**
- Use the native `HTMLCanvasElement` API to render the poster div to a canvas, then export as PNG/JPG
- Add an `exportAsImage` method that uses `document.createElement('canvas')` and manually draws elements (no external library needed since elements are simple text + images)
- Alternative simpler approach: use a hidden `<canvas>` element and draw text/images programmatically, OR use the browser's built-in `toDataURL` after rendering to an offscreen canvas

**1.2 Image Element Support**
- Enable the "image" tab to allow uploading images via the existing `ImageUpload` component or a file input
- Add image elements to the canvas that render as `<img>` tags with positioning
- Store image URLs (uploaded to storage via existing `upload.service.ts`)

**1.3 Drag-and-Drop Repositioning**
- Add `onMouseDown`/`onMouseMove`/`onMouseUp` handlers to canvas elements for basic drag support
- Track dragging state and update element x/y coordinates in real time

**1.4 More Pre-built Layouts/Templates**
- Add "Flash Sale", "New Arrival", "WhatsApp Status", "Instagram Story" layout presets
- Each layout will set canvas dimensions appropriate for the platform (e.g., 1080x1920 for Instagram Story, 400x400 for WhatsApp Status)

**1.5 Canvas Size Presets**
- Add a size selector: Instagram Post (1080x1080), Instagram Story (1080x1920), WhatsApp Status (1080x1920), Facebook Post (1200x630), Custom

**1.6 Delete Selected Element**
- Add a "Delete" button when an element is selected

### Changes to `src/pages/entrepreneur/PosterEditor.tsx`

**1.7 Real Download Implementation**
- Implement `handleExport` to convert the canvas div to an image blob using a utility function
- Trigger browser download with the correct filename and format (PNG/JPG)

**1.8 Social Media Share Button**
- Add a "Share" button next to Export
- Use `navigator.share()` API (Web Share API) when available (mobile browsers, some desktop)
- Fallback: show share links for WhatsApp (`https://api.whatsapp.com/send?text=...`), Twitter, Facebook
- For WhatsApp specifically: download the image first, then open WhatsApp with a pre-filled message prompting the user to attach it

---

## Part 2: Shop Owner Tutorials on Dashboard

### 2.1 New Page: `src/pages/entrepreneur/EntrepreneurCourses.tsx`
- Adapted from `CustomerCourses.tsx` pattern
- Fetches courses with `target_audience = 'shop_owner'`
- Shows Available / In Progress / Completed tabs
- Course content modal with sanitized HTML rendering
- Points display and "Mark as Complete" functionality
- Uses the shop owner navigation pattern (back to dashboard button) instead of customer sidebar

### 2.2 New Route in `src/App.tsx`
- Add `/courses` route protected for `ENTREPRENEUR` role
- Lazy-load `EntrepreneurCourses`

### 2.3 Dashboard Quick Action in `src/pages/Dashboard.tsx`
- Add a 7th quick action card:
  ```
  icon: BookOpen
  label: "Tutorials"
  description: "Learn & earn points"
  path: "/courses"
  color: "from-blue-500/20 to-blue-500/10"
  textColor: "text-blue-500"
  ```
- Also add it to the mobile menu items

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/marketing/CanvasEditor.tsx` | MODIFY | Add image support, drag-and-drop, real export, canvas size presets, delete element, more layouts |
| `src/pages/entrepreneur/PosterEditor.tsx` | MODIFY | Implement real download, add share button with Web Share API |
| `src/pages/entrepreneur/EntrepreneurCourses.tsx` | CREATE | Shop owner courses/tutorials page |
| `src/pages/Dashboard.tsx` | MODIFY | Add "Tutorials" to QuickActions array |
| `src/App.tsx` | MODIFY | Add `/courses` route for entrepreneurs |

---

## Technical Details

### Canvas Export (No External Library)

```typescript
const exportCanvas = async (format: 'png' | 'jpg'): Promise<Blob> => {
  const canvasEl = canvasRef.current;
  if (!canvasEl) throw new Error('Canvas not found');
  
  // Use html2canvas-like approach with native canvas
  const rect = canvasEl.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = rect.width * 2; // 2x for retina
  canvas.height = rect.height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  
  // Draw background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, rect.width, rect.height);
  
  // Draw each element
  for (const el of elements) {
    if (el.type === 'text') {
      if (el.backgroundColor) {
        ctx.fillStyle = el.backgroundColor;
        ctx.fillRect(el.x, el.y, el.width, el.height);
      }
      ctx.fillStyle = el.color || '#000';
      ctx.font = `${el.fontSize}px ${el.fontFamily}`;
      ctx.fillText(el.content, el.x + (el.backgroundColor ? 16 : 0), el.y + (el.fontSize || 24));
    } else if (el.type === 'image' && el.content) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise(r => { img.onload = r; img.src = el.content; });
      ctx.drawImage(img, el.x, el.y, el.width, el.height);
    }
  }
  
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 
      format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
  });
};
```

### Drag-and-Drop

```typescript
const [dragging, setDragging] = useState<{id: string; offsetX: number; offsetY: number} | null>(null);

const handleMouseDown = (e: React.MouseEvent, elId: string) => {
  const el = elements.find(e => e.id === elId);
  if (!el) return;
  setDragging({ id: elId, offsetX: e.clientX - el.x, offsetY: e.clientY - el.y });
  setSelectedElement(elId);
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!dragging) return;
  const canvasRect = canvasRef.current?.getBoundingClientRect();
  if (!canvasRect) return;
  updateElement(dragging.id, {
    x: e.clientX - canvasRect.left - dragging.offsetX + canvasRect.left,
    y: e.clientY - canvasRect.top - dragging.offsetY + canvasRect.top,
  });
};
```

### Web Share API

```typescript
const handleShare = async (blob: Blob) => {
  const file = new File([blob], 'poster.png', { type: 'image/png' });
  
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: posterName,
      text: `Check out this poster from ${shopData?.shop_name}!`,
      files: [file],
    });
  } else {
    // Fallback: download and show share links
    // Open WhatsApp with message
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out my latest promotion!')}`, '_blank');
  }
};
```

### Entrepreneur Courses Page
- Same pattern as `CustomerCourses.tsx` but without `CustomerSidebar`
- Uses a simple top nav with back button (matching Marketing page pattern)
- Calls `courseService.getCourses('shop_owner')` instead of `'customer'`

