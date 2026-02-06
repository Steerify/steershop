

# Fix Auto Marketing Tool

## Problems Found

1. **Template data format mismatch**: The poster templates stored in the database use a completely different data structure than what the CanvasEditor expects. Templates use center-based coordinates, `fontWeight`, `textAlign`, and a `canvas` wrapper object -- but the editor expects top-left coordinates, `fontFamily`, and a flat structure with `background` at root level. This means every template loads broken or blank.

2. **Unsupported element types**: Templates reference `qrcode` and `shape` types that the editor doesn't render.

3. **Placeholder variables not resolved**: Templates use `{{shop_name}}`, `{{discount}}`, `{{code}}` etc. but the editor never substitutes them.

4. **Mobile responsiveness issues**: The PosterEditor page uses a fixed `h-[calc(100vh-56px)]` layout that doesn't work on mobile. The AI assistant panel overlaps the canvas. The tools panel is cramped.

5. **Touch support missing**: Canvas drag only uses mouse events -- no touch support for mobile users.

6. **No default canvas data for new posters**: Creating a new poster shows a blank canvas with no elements and no guidance.

## Solution

### 1. Fix template data transformation (PosterEditor.tsx)

Add a `transformTemplateData()` function that converts the database template format into CanvasEditor format when loading a template:
- Extract `background` from `canvas.backgroundColor`
- Extract `canvasSize` from `canvas.width/height`  
- Convert center-based `x/y` to top-left `x/y`
- Add default `width/height` to text elements that lack them
- Map `fontWeight: "bold"` to appropriate `fontFamily` (e.g., Montserrat)
- Replace `{{shop_name}}` placeholders with actual shop name
- Skip unsupported types (`qrcode`, `shape`)

### 2. Update all 12 database templates

Replace all template_data in the `poster_templates` table with data that matches the CanvasEditor format directly. Each template will have:
- Proper `elements` array with `x`, `y`, `width`, `height`, `fontSize`, `fontFamily`, `color`
- Root-level `background` string
- Root-level `canvasSize` object
- Better, more varied designs suited for Nigerian market (Naira prices, WhatsApp CTAs, vibrant colors)

### 3. Make CanvasEditor mobile responsive

- Change the layout to stack vertically on mobile (canvas on top, tools panel below)
- Make the tools panel a collapsible bottom sheet on mobile
- Reduce MAX_DISPLAY dynamically based on screen width
- Add touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`) for drag support

### 4. Make PosterEditor page mobile responsive

- Change from fixed height to min-height with scroll
- AI Assistant panel: show as a slide-over/modal on mobile instead of side panel
- Toolbar: ensure all buttons fit on small screens (already partially done with hidden text)

### 5. Add default starter content for new posters

When no template or existing poster ID is provided, initialize with a simple starter layout so users aren't staring at a blank canvas.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/marketing/CanvasEditor.tsx` | Add touch support, responsive MAX_DISPLAY, mobile layout, collapsible tools panel |
| `src/pages/entrepreneur/PosterEditor.tsx` | Add `transformTemplateData()`, default starter content, mobile-friendly AI panel, responsive layout |
| `src/components/marketing/TemplateCard.tsx` | Minor: improve touch targets for mobile |
| `src/components/marketing/PosterLibrary.tsx` | Minor: make category tabs horizontally scrollable on mobile |
| Database migration | Update all 12 poster_templates with correct format template_data |

## Technical Details

### Template Data Transformation

```typescript
const transformTemplateData = (raw: any, shopName: string): CanvasData => {
  // Handle already-correct format
  if (raw.background && Array.isArray(raw.elements) && raw.elements[0]?.width) {
    return raw as CanvasData;
  }
  
  // Transform from DB format
  const canvas = raw.canvas || {};
  const background = canvas.backgroundColor || raw.background || "#ffffff";
  const canvasSize = {
    width: canvas.width || 1080,
    height: canvas.height || 1080,
    label: "Custom",
  };
  
  const elements = (raw.elements || [])
    .filter(el => el.type === "text" || el.type === "image")
    .map(el => ({
      id: el.id,
      type: el.type,
      content: el.content?.replace(/\{\{shop_name\}\}/g, shopName) || "",
      x: el.x - (el.width || 400) / 2,  // center to top-left
      y: el.y - (el.height || 60) / 2,
      width: el.width || 400,
      height: el.height || (el.fontSize || 24) * 1.5,
      fontSize: el.fontSize,
      fontFamily: el.fontWeight === "bold" ? "Montserrat" : "Inter",
      color: el.color,
    }));
  
  return { elements, background, canvasSize };
};
```

### Touch Events for Canvas

```typescript
const handleTouchStart = (e: React.TouchEvent, elId: string) => {
  e.stopPropagation();
  const touch = e.touches[0];
  // Same logic as handleMouseDown but using touch coordinates
};
const handleTouchMove = (e: React.TouchEvent) => {
  const touch = e.touches[0];
  // Same logic as handleMouseMove
};
```

### Responsive Canvas Display

```typescript
const [screenWidth, setScreenWidth] = useState(window.innerWidth);
useEffect(() => {
  const handler = () => setScreenWidth(window.innerWidth);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

const MAX_DISPLAY = screenWidth < 640 ? Math.min(screenWidth - 32, 360) : 420;
```
