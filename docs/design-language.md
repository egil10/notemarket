# Swiss Academic Design Language

This document captures the visual identity NoteMarket uses across every page and component. It is distilled from `DESIGN_SYSTEM.md`, `src/app/globals.css`, and the current UI implementation so new work stays on brand.

## Core Principles

1. **Swiss Academic**: Minimalist, grid-driven layouts with sharp edges and strong structural lines.
2. **Tactile Shadows**: Interactive elements lift using the signature offset shadow `var(--shadow-hover)` (`4px 4px 0px rgba(0, 0, 0, 1)`).
3. **High Contrast Typography**: Clear hierarchy using Outfit for headings and Inter for body text.
4. **Paper-inspired Palette**: Warm neutrals for backgrounds, forest green for trust, burnt orange for emphasis.

## Typography

- Loaded globally via `next/font/google` in `src/app/layout.tsx`.
  - `Outfit` → CSS variable `--font-outfit`; applied to all headings (`h1`–`h6`) with `font-weight: 600`.
  - `Inter` → CSS variable `--font-inter`; default `body` font for paragraphs, buttons, and forms.
- Letter spacing: headings use `letter-spacing: -0.03em` to achieve a tight academic look.
- Suggested scale (from `DESIGN_SYSTEM.md`):
  - `h1`: 40px, `h2`: 32px, `h3`: 24px, `h4`: 20px, body: 16px, small: 14px.

## Color & Tokens (`src/app/globals.css`)

| Token | Value | Usage |
| --- | --- | --- |
| `--primary` | `#1a4731` | Actions, highlights, stat numbers |
| `--primary-dark` | `#113021` | Hover state for primary surfaces |
| `--accent` | `#d94e28` | Alerts, callouts, badges |
| `--background` | `#f9f9f7` | Body background (paper white) |
| `--surface` | `#ffffff` | Cards, dialogs |
| `--surface-alt` | `#f0f0ed` | Section dividers |
| `--text-main` | `#1a1a1a` | Headings, copy |
| `--text-muted` | `#595959` | Secondary labels |
| `--border` | `#e0e0e0` | Card outlines, inputs |
| `--border-strong` | `#1a1a1a` | Grid lines, structural accents |

Utility tokens:

- Radii: `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 0px` (prefer sharp corners; only round when necessary).
- Shadows: `--shadow-sm` (subtle resting elevation), `--shadow-hover` (bold hover state).

## Spacing & Layout

Adopt the spacing ladder defined in `DESIGN_SYSTEM.md` (4px increments up to 64px). Combine with CSS grid/flex layouts to maintain Swiss-style structure:

- Section padding: `3rem–4rem`.
- Card padding: `1.5rem–2rem`.
- Maintain consistent gutters; use CSS `gap` instead of manual margins where possible.

## Interaction Patterns

- Hover state: `transform: translateY(-2px); box-shadow: var(--shadow-hover);`.
- Focus state: use visible outlines (`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)` or similar) for accessibility.
- Buttons:
  - Primary: solid `--primary` background, white text, rounded by `0.5rem`, hover darkens + adds hover shadow.
  - Secondary: transparent/neutral background, 1px border using `--border`, same hover behavior.
  - Ghost: borderless, rely on text color changes and underline.

## Component Notes

- **Header / Navigation**: Use uppercase or semi-bold links with generous spacing. `UserMenu` sits on the right with avatar initials fallback.
- **Hero**: Large typographic lockup, search input styled with structural border and `Button` overlay to mirror real search bars.
- **DocumentCard**:
  - Top preview uses placeholder block with document type label.
  - Metadata row uses `Badge` component (neutral variant) + university label derived from `getUniversityAbbreviation`.
  - Price uses numeric only with trailing `,-` to signal NOK.
  - Grade badge overlays the preview and mirrors grade verification status.
- **Forms** (`/sell`, `/login`, `/profile`):
  - Labels always above inputs.
  - Inputs share `.input` styles (padding 12–16px, 1px border, 0.5rem radius).
  - Toasts communicate success/error with consistent colors (`success: #10b981`, `error: #ef4444`, `info: #3b82f6`).

## Asset & Iconography

- Icons from `lucide-react`, stroke weight ~1.5 to stay crisp.
- Illustrations minimal; rely on typography and blocks of color.
- PDF placeholders intentionally abstract—better preview generation can replace them later without changing card layout.

## Implementation Checklist

When creating or updating UI, confirm the following:

1. **Tokens**: Use CSS variables from `globals.css` or extend that file instead of hardcoding new colors/shadows.
2. **Typography**: Headings use Outfit; body text uses Inter; confirm `var(--font-*)` classes exist on parent container.
3. **Spacing**: Stick to the spacing scale (4/8/12/16/24/32/48/64).
4. **Shadows**: Interactive elements use the hover shadow pattern; static elements use `--shadow-sm`.
5. **Accessibility**: Maintain contrast ratios, visible focus states, and minimum tap targets.

Document updates: if you add new tokens, fonts, or interaction rules, update this file and `src/app/globals.css` together so future contributors remain aligned.

