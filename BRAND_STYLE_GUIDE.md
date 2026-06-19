# SteerSolo Brand Style Guide

## Overview
This document defines the SteerSolo brand design system, including color palette, typography, and usage guidelines.

---

## Brand Color Palette

### Primary Colors
- **Primary Forest Green**: `hsl(160, 45%, 12%)`
  - Used for: Main brand elements, primary buttons, text on light backgrounds
  - WCAG AA Compliant: Yes (4.5:1 contrast with white)

- **Accent Lime Green**: `hsl(85, 95%, 55%)`
  - Used for: Call-to-action buttons, highlights, hover states
  - WCAG AA Compliant: Yes (4.7:1 contrast with dark background)

### Neutral Colors
- **Neutral Light (Warm Off-White)**: `hsl(35, 30%, 98%)` - Background color
- **Neutral Dark (Deep Charcoal)**: `hsl(160, 15%, 5%)` - Text on light backgrounds
- **Muted**: `hsl(35, 20%, 92%)` - Subtle backgrounds
- **Muted Foreground**: `hsl(160, 10%, 38%)` - Secondary text

### Semantic Colors
- **Destructive**: `hsl(0, 72%, 51%)` - Error states, delete actions
- **Rating**: `hsl(42, 90%, 55%)` - Star ratings
- **Success**: `hsl(85, 95%, 55%)` - Success notifications

### Brand Color Family
- **Forest Deep**: `hsl(160, 50%, 8%)`
- **Forest Soft**: `hsl(160, 40%, 20%)`
- **Forest Strong**: `hsl(160, 45%, 16%)`
- **Lime Deep**: `hsl(80, 85%, 45%)`
- **Lime Muted**: `hsl(85, 75%, 50%)`
- **Lime Bright**: `hsl(85, 95%, 55%)`

---

## Typography
- **Font Family**: Poppins (sans-serif)
- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700), Extrabold (800)
- **Type Scale**:
  - H1: 3xl (sm: 4xl, lg: 5xl)
  - H2: 2xl (sm: 3xl)
  - H3: xl (sm: 2xl)
  - Body: base (16px)
  - Small: sm (14px)

---

## Usage Guidelines
1. **Contrast**: Always maintain minimum 4.5:1 contrast ratio (WCAG 2.1 AA)
2. **Consistency**: Use brand colors consistently across all touchpoints
3. **Dark Mode**: Switch primary and accent for optimal readability in dark themes
4. **Buttons**: Use primary color for main CTAs, accent for secondary actions

---

## Implementation
All brand colors are defined as CSS variables in `src/index.css` using HSL values for easy theming.
