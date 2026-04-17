# SteerSolo Homepage Style Guide

## Overview
This document captures the complete UI/UX design system used on the homepage. Apply these styles consistently across all pages and components in the project.

---

## 1. Color Palette

### Primary Colors (African-Inspired)
- **Adire Indigo Blue** (Primary): `hsl(215 65% 25%)` - Main brand color
- **Nigerian Green** (Accent): `hsl(145 60% 38%)` - Success/action color
- **Gold/Amber** (Gold): `hsl(42 90% 55%)` - Highlight/premium color
- **Soft Cream/Sand** (Secondary): `hsl(40 30% 95%)` - Background accent

### Background Colors
- **Main Background**: `hsl(40 20% 98%)` - Warm off-white
- **Muted Background**: `hsl(40 20% 92%)` - Section backgrounds
- **Card Background**: `hsl(0 0% 100%)` - Pure white cards

### Text Colors
- **Foreground**: `hsl(220 45% 15%)` - Dark blue-gray
- **Muted Foreground**: `hsl(220 15% 45%)` - Secondary text

### Dark Mode Colors
- **Background**: `hsl(220 40% 8%)` - Deep dark blue
- **Primary**: `hsl(145 55% 45%)` - Brighter green
- **Accent**: `hsl(145 60% 45%)` - Vibrant green
- **Gold**: `hsl(42 85% 58%)` - Brighter gold

---

## 2. Typography

### Font Family
- **All Text**: `'Poppins', sans-serif`
- **Headings**: `'Poppins', sans-serif` with `font-semibold tracking-tight`

### Responsive Text Scale
```css
h1: text-3xl sm:text-4xl lg:text-5xl
h2: text-2xl sm:text-3xl
h3: text-xl sm:text-2xl
```

### Font Weights
- **Bold**: `font-bold` or `font-extrabold` for headings
- **Semibold**: `font-semibold` for subheadings
- **Medium**: `font-medium` for body text
- **Normal**: `font-normal` for regular text

---

## 3. Gradients

### Hero Gradient
```css
background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
```

### Adire Gradient
```css
background: linear-gradient(135deg, hsl(215 65% 30%), hsl(215 50% 45%));
```

### Gold Gradient
```css
background: linear-gradient(135deg, hsl(42 90% 55%), hsl(35 85% 50%));
```

### Card Gradient
```css
background: linear-gradient(180deg, hsl(0 0% 100%), hsl(40 30% 97%));
```

### Gradient Text
```css
.gradient-text {
  @apply bg-clip-text text-transparent;
  background-image: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
}
```

---

## 4. Shadows

### Elegant Shadow
```css
--shadow-elegant: 0 10px 40px -10px hsl(215 65% 25% / 0.15);
```

### Glow Shadow
```css
--shadow-glow: 0 0 30px hsl(145 60% 38% / 0.2);
```

### Gold Shadow
```css
--shadow-gold: 0 0 20px hsl(42 90% 55% / 0.3);
```

### Usage
- Cards: `box-shadow: var(--shadow-elegant);`
- Hover states: `box-shadow: var(--shadow-glow);`
- Premium elements: `box-shadow: var(--shadow-gold);`

---

## 5. Border Radius

### Standard Radius
```css
--radius: 0.75rem; /* 12px */
```

### Radius Classes
- **Large**: `rounded-lg` (var(--radius))
- **Medium**: `rounded-md` (calc(var(--radius) - 2px))
- **Small**: `rounded-sm` (calc(var(--radius) - 4px))
- **Extra Large**: `rounded-xl` (16px)
- **2X Large**: `rounded-2xl` (24px)

### Usage
- Cards: `rounded-xl` or `rounded-2xl`
- Buttons: `rounded-2xl`
- Badges: `rounded-full`
- Inputs: `rounded-lg`

---

## 6. Component Styles

### Cards (card-spotify class)
```css
.card-spotify {
  @apply relative overflow-hidden rounded-xl border border-border bg-card;
  box-shadow: var(--shadow-elegant);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-spotify:hover {
  @apply -translate-y-1;
  box-shadow: var(--shadow-elegant);
}
```

### African Card (with accent bar)
```css
.card-african {
  @apply relative overflow-hidden rounded-xl border border-border bg-card;
  box-shadow: var(--shadow-elegant);
}

.card-african::before {
  content: '';
  @apply absolute top-0 left-0 right-0 h-1;
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--gold)));
}
```

### Buttons

#### Primary Button (African Style)
```css
.btn-african {
  @apply relative overflow-hidden transition-all duration-300;
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
}

.btn-african::before {
  content: '';
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
  background: linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)));
}

.btn-african:hover::before {
  @apply opacity-100;
}
```

#### Button Sizes
- **Large**: `size="lg"` → `px-8 py-6 text-base`
- **Default**: `size="default"` → `px-4 py-2 text-sm`
- **Small**: `size="sm"` → `px-3 py-1.5 text-xs`

#### Button Variants
- **Primary**: Gradient background (primary to accent)
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Outline**: `border-2 border-primary/25 text-primary`
- **Ghost**: `hover:bg-accent/10`

### Badges
```css
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold;
}
```

### Inputs
```css
.input {
  @apply w-full px-4 py-3 rounded-lg border border-input bg-background;
  @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
}
```

---

## 7. Layout Patterns

### Container
```css
.container {
  @apply mx-auto px-4;
  max-width: 1280px;
}
```

### Section Spacing
- **Large Sections**: `py-24` or `py-20`
- **Medium Sections**: `py-16`
- **Small Sections**: `py-12`

---

## Theme Usage (PageThemeShell Surfaces)

Use the shared `PageThemeShell` and section surface utilities to keep page rhythm and brand balance consistent:

- **`primary` surfaces** (`theme-surface-primary`): use for page-intro/hero regions, high-priority education blocks, and first-view messaging.
- **`accent` surfaces** (`theme-surface-accent`): use for conversion sections, trust/benefit strips, and CTA-heavy blocks.
- **Neutral surfaces** (`theme-surface-neutral`): default for dense reading areas, forms, list content, and FAQs where legibility should dominate.

Rule of thumb:
1. Start with a `primary` top section.
2. Alternate to neutral for content-heavy middle sections.
3. Use `accent` sparingly to highlight conversion moments.

### Grid Layouts
- **3 Columns**: `grid md:grid-cols-3 gap-6`
- **2 Columns**: `grid md:grid-cols-2 gap-6`
- **4 Columns**: `grid md:grid-cols-2 lg:grid-cols-4 gap-6`

### Flex Layouts
- **Center**: `flex items-center justify-center`
- **Between**: `flex items-center justify-between`
- **Start**: `flex items-center justify-start`

---

## 8. Animations

### Fade Up
```css
.animate-fade-up {
  animation: fadeUp 0.6s ease-out forwards;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Fade In
```css
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Scale In
```css
.animate-scale-in {
  animation: scaleIn 0.4s ease-out forwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Slide In Right
```css
.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out forwards;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Float
```css
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Pulse Soft
```css
.animate-pulse-soft {
  animation: pulseSoft 2s ease-in-out infinite;
}

@keyframes pulseSoft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Shimmer
```css
.shimmer {
  @apply relative overflow-hidden;
}

.shimmer::after {
  content: '';
  @apply absolute inset-0 -translate-x-full;
  background: linear-gradient(
    90deg,
    transparent,
    hsl(var(--accent) / 0.1),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  to { transform: translateX(100%); }
}
```

### Stagger Delays
```css
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
```

---

## 9. Hover Effects

### Lift Effect
```css
.hover-lift {
  @apply transition-all duration-300;
}

.hover-lift:hover {
  @apply -translate-y-1;
  box-shadow: var(--shadow-elegant);
}
```

### Glow Effect
```css
.hover-glow:hover {
  box-shadow: var(--shadow-glow);
}
```

### Card Hover
```css
.card-hover {
  @apply transition-all duration-300;
}

.card-hover:hover {
  @apply -translate-y-1;
  box-shadow: var(--shadow-elegant);
}
```

---

## 10. Background Patterns

### Adire Pattern (Dots)
```css
.adire-pattern {
  background-image: 
    radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.05) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.05) 2px, transparent 2px);
  background-size: 30px 30px;
}
```

### Dense Adire Pattern
```css
.adire-pattern-dense {
  background-image: 
    radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.08) 1.5px, transparent 1.5px),
    radial-gradient(circle at 80% 80%, hsl(var(--accent) / 0.08) 1.5px, transparent 1.5px),
    radial-gradient(circle at 50% 50%, hsl(var(--gold) / 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Adire Lines
```css
.adire-lines {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    hsl(var(--primary) / 0.03) 10px,
    hsl(var(--primary) / 0.03) 11px
  );
}
```

### Adire Circles
```css
.adire-circles {
  background-image: 
    radial-gradient(circle at center, transparent 8px, hsl(var(--primary) / 0.05) 9px, transparent 10px);
  background-size: 40px 40px;
}
```

---

## 11. Glass Effects

### Glass Morphism
```css
.glass {
  @apply backdrop-blur-md;
  background: hsl(var(--background) / 0.8);
}
```

### Dark Glass
```css
.glass-dark {
  @apply backdrop-blur-md;
  background: hsl(var(--primary) / 0.9);
}
```

---

## 12. Section Dividers

### Gradient Divider
```css
.section-divider {
  @apply h-px w-full;
  background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), transparent);
}
```

---

## 13. Focus States

### Focus Ring
```css
.focus-ring {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}
```

---

## 14. Transitions

### Smooth Transition
```css
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Usage
- All interactive elements: `transition-all duration-300`
- Hover states: `transition-colors duration-200`
- Transform effects: `transition-transform duration-300`

---

## 15. Common Class Combinations

### Hero Section
```jsx
<section className="relative pt-28 md:pt-32 pb-12 overflow-hidden bg-mesh">
  <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent pointer-events-none" />
  <div className="container mx-auto px-4 relative z-10">
    {/* Content */}
  </div>
</section>
```

### Content Section
```jsx
<section className="py-16 bg-muted/30">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
        Section Title
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Section description
      </p>
    </div>
    {/* Content */}
  </div>
</section>
```

### Card Grid
```jsx
<div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
  {items.map((item) => (
    <div key={item.id} className="card-spotify p-6">
      {/* Card content */}
    </div>
  ))}
</div>
```

### CTA Section
```jsx
<section className="relative py-24 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(160,50%,28%)] to-accent" />
  <div className="container mx-auto px-4 text-center relative z-10">
    {/* CTA content */}
  </div>
</section>
```

---

## 16. Responsive Breakpoints

### Tailwind Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
- Start with mobile styles
- Add responsive classes for larger screens
- Use `sm:`, `md:`, `lg:`, `xl:` prefixes

---

## 17. Spacing Scale

### Padding
- **xs**: `p-2` (8px)
- **sm**: `p-3` (12px)
- **md**: `p-4` (16px)
- **lg**: `p-6` (24px)
- **xl**: `p-8` (32px)
- **2xl**: `p-10` (40px)
- **3xl**: `p-12` (48px)

### Margin
- **xs**: `m-2` (8px)
- **sm**: `m-3` (12px)
- **md**: `m-4` (16px)
- **lg**: `m-6` (24px)
- **xl**: `m-8` (32px)

### Gap
- **sm**: `gap-2` (8px)
- **md**: `gap-4` (16px)
- **lg**: `gap-6` (24px)
- **xl**: `gap-8` (32px)

---

## 18. Icon Styles

### Icon Sizes
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-5 h-5` (20px)
- **Large**: `w-6 h-6` (24px)
- **XL**: `w-8 h-8` (32px)

### Icon Colors
- **Primary**: `text-primary`
- **Accent**: `text-accent`
- **Gold**: `text-gold`
- **Muted**: `text-muted-foreground`
- **Destructive**: `text-destructive`

### Icon Containers
```jsx
<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
  <Icon className="w-6 h-6 text-primary" />
</div>
```

---

## 19. Badge Styles

### Badge Variants
```jsx
<Badge className="bg-primary/10 text-primary border-primary/20">
  Primary Badge
</Badge>

<Badge className="bg-accent/10 text-accent border-accent/20">
  Accent Badge
</Badge>

<Badge className="bg-gold/10 text-gold border-gold/20">
  Gold Badge
</Badge>
```

---

## 20. List Styles

### Check List
```jsx
<ul className="space-y-3">
  {items.map((item) => (
    <li key={item} className="flex items-center gap-3 text-sm">
      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
      {item}
    </li>
  ))}
</ul>
```

---

## Implementation Checklist

When applying these styles to any component:

1. ✅ Use Poppins font family
2. ✅ Apply African-inspired color palette
3. ✅ Use `card-spotify` class for cards
4. ✅ Use gradient backgrounds for hero sections
5. ✅ Apply `rounded-2xl` for buttons
6. ✅ Use `rounded-xl` for cards
7. ✅ Add `transition-all duration-300` for smooth effects
8. ✅ Apply `hover-lift` for interactive cards
9. ✅ Use `shadow-elegant` for card shadows
10. ✅ Apply responsive text scaling
11. ✅ Use consistent spacing (py-16, py-20, py-24)
12. ✅ Add animations with stagger delays
13. ✅ Use gradient text for emphasis
14. ✅ Apply glass effects for overlays
15. ✅ Use Adire patterns for backgrounds

---

## Quick Reference Classes

### Most Used Classes
```
card-spotify
btn-african
gradient-text
hover-lift
adire-pattern
glass
shadow-elegant
font-display
text-balance
```

### Common Combinations
```
className="card-spotify p-6 hover-lift"
className="btn-african text-white font-bold"
className="gradient-text font-bold"
className="adire-pattern absolute inset-0"
className="glass backdrop-blur-md"
```

---

*Last Updated: Based on homepage analysis*
*Apply these styles consistently across all pages and components.*
