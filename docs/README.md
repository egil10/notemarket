# NoteMarket Documentation

This folder collects the living documentation for the NoteMarket project. It is meant to be the single place future contributors check first when they need to understand the product vision, design language, technology stack, or data model.

## Available Guides

- `design-language.md` – Swiss Academic visual identity, fonts, color tokens, and reusable UI conventions.
- `product-architecture.md` – High-level system overview covering the Next.js app, Supabase services, and request flows.
- `data-model.md` – Supabase tables, storage buckets, and auth policies that power uploads, profiles, and previews.
- `grade-verification.md` – Admin runbook for reviewing karakterbevis, toggling `grade_verified`, and handling disputes.

## How to Use This Folder

1. Read `design-language.md` before touching CSS or components to keep the visual identity consistent.
2. Read `product-architecture.md` when onboarding or before making structural changes to routing, auth, or API access.
3. Read `data-model.md` when you need to modify Supabase tables, policies, or storage behavior.

Feel free to add more markdown files as the platform grows (e.g., payment architecture, analytics, deployment runbooks). Keep the tone practical and update the docs whenever you change related code.

