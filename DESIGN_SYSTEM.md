# NoteMarket Design System

This document outlines the design system for NoteMarket to ensure consistency across all pages and components.

## Design Philosophy

NoteMarket uses a **Swiss Academic** aesthetic with:
- Sharp, clean edges (minimal border radius)
- Bold shadows for depth and interaction feedback
- Academic color palette (forest green + burnt orange)
- High contrast typography
- Structured, grid-based layouts

---

## Colors

### Primary Palette
```css
--primary: #1a4731;        /* Deep Forest Green - Academic, Trustworthy */
--primary-dark: #113021;   /* Darker variant for hover states */
--accent: #d94e28;         /* Burnt Orange - Alert/Action */
```

### Neutrals (Paper Tones)
```css
--background: #f9f9f7;     /* Warm Paper White */
--surface: #ffffff;        /* Pure white for cards */
--surface-alt: #f0f0ed;    /* Light Grey/Beige for sections */
```

### Typography Colors
```css
--text-main: #1a1a1a;      /* Near Black - Sharp Contrast */
--text-muted: #595959;     /* Muted text */
--border: #e0e0e0;         /* Light borders */
--border-strong: #1a1a1a;  /* Strong structural lines */
```

### UI Colors
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

---

## Typography

### Font Families
- **Headings**: `Outfit` (Google Font) - Bold, modern sans-serif
- **Body**: `Inter` (Google Font) - Clean, readable

### Font Sizes
```css
h1: 2.5rem (40px)
h2: 2rem (32px)
h3: 1.5rem (24px)
h4: 1.25rem (20px)
Body: 1rem (16px)
Small: 0.875rem (14px)
```

### Font Weights
- **Headings**: 600-700 (Semi-bold to Bold)
- **Body**: 400-500 (Regular to Medium)
- **Labels**: 500-600 (Medium to Semi-bold)

---

## Spacing

Use consistent spacing scale:
```css
0.25rem (4px)   - Tiny gaps
0.5rem (8px)    - Small gaps
0.75rem (12px)  - Medium-small
1rem (16px)     - Base unit
1.5rem (24px)   - Medium
2rem (32px)     - Large
3rem (48px)     - Extra large
4rem (64px)     - Section spacing
```

---

## Border Radius

**Sharp edges** are key to the Swiss Academic aesthetic:
```css
--radius-sm: 2px;   /* Minimal rounding */
--radius-md: 4px;   /* Slight rounding */
--radius-lg: 0px;   /* Completely sharp (brutalist) */
```

For most UI elements, use **0.5rem (8px)** or **1rem (16px)** for a modern but structured feel.

---

## Shadows

### Standard Shadow
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```
Use for cards, inputs, and elevated surfaces.

### Hover Shadow (Bold)
```css
box-shadow: 4px 4px 0px rgba(0, 0, 0, 1);
```
**This is the signature NoteMarket hover effect** - a hard, offset shadow that creates a retro, academic feel.

### Subtle Shadow
```css
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
```
Use for very subtle elevation.

---

## Borders

### Standard Border
```css
border: 1px solid #e5e7eb;
```
Use for cards, inputs, and containers.

### Strong Border
```css
border: 2px solid #1a1a1a;
```
Use for emphasis or structural elements.

---

## Buttons

### Primary Button
- **Background**: `#2563eb` (Blue) or `#1a4731` (Green)
- **Text**: White
- **Border**: None or `1px solid` matching background
- **Border Radius**: `0.5rem`
- **Padding**: `0.75rem 1.5rem`
- **Hover**: Add `4px 4px 0px rgba(0, 0, 0, 1)` shadow + slight translate

### Secondary Button
- **Background**: Transparent or light gray
- **Text**: Dark
- **Border**: `1px solid #d1d5db`
- **Hover**: Same bold shadow effect

### Ghost Button
- **Background**: Transparent
- **Text**: Inherit
- **Border**: None
- **Hover**: Background color change

---

## Cards

### Standard Card
```css
background: white;
border-radius: 1rem;
padding: 1.5rem - 2rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
border: 1px solid #e5e7eb;
transition: all 0.2s ease;
```

### Hover State
```css
transform: translateY(-2px);
box-shadow: 4px 4px 0px rgba(0, 0, 0, 1);
```

---

## Inputs

### Standard Input
```css
padding: 0.75rem 1rem;
border: 1px solid #d1d5db;
border-radius: 0.5rem;
background: white;
transition: all 0.2s ease;
```

### Focus State
```css
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
outline: none;
```

---

## Transitions

Use smooth transitions for interactive elements:
```css
transition: all 0.2s ease;
```

Common properties to transition:
- `transform`
- `box-shadow`
- `background-color`
- `border-color`

---

## Component Patterns

### Stat Cards
- Grid layout (3 columns on desktop, 1 on mobile)
- Bold number (2rem, primary color)
- Label below (0.875rem, muted)
- Hover: lift + bold shadow

### Document Cards
- Image/preview on top
- Metadata badges
- Title + author
- Price + rating at bottom
- Hover: lift + shadow

### Forms
- Clear labels above inputs
- Consistent spacing between fields
- Error messages in red below field
- Submit button at bottom (full width on mobile)

---

## Accessibility

- **Contrast**: Maintain WCAG AA standards (4.5:1 for normal text)
- **Focus States**: Always visible with blue outline
- **Interactive Elements**: Minimum 44x44px touch target
- **Alt Text**: Required for all images

---

## Best Practices

1. **Consistency**: Use design tokens from `globals.css`
2. **Spacing**: Use the spacing scale, avoid arbitrary values
3. **Colors**: Stick to the defined palette
4. **Shadows**: Use the bold hover shadow for all interactive elements
5. **Borders**: Keep edges sharp (small border radius)
6. **Typography**: Use Outfit for headings, Inter for body
7. **Transitions**: Always smooth (0.2s ease)

---

## Quick Reference

**Hover Effect (Signature)**:
```css
.element:hover {
    transform: translateY(-2px);
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 1);
}
```

**Card Base**:
```css
background: white;
border-radius: 1rem;
padding: 2rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
border: 1px solid #e5e7eb;
```

**Input Base**:
```css
padding: 0.75rem 1rem;
border: 1px solid #d1d5db;
border-radius: 0.5rem;
```
