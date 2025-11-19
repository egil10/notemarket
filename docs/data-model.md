# Supabase Data Model

This reference captures the schema, storage layout, and row-level security rules used by NoteMarket. Consult it before touching SQL scripts in `database/`.

## Tables

### `documents`

Defined in `database/supabase_schema.sql`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` (PK, default `gen_random_uuid()`) | Public identifier exposed to UI |
| `created_at` | `timestamptz` (default `now()`) | Used for ordering on home/search |
| `title` | `text` | Required |
| `description` | `text` | Optional long-form description |
| `price` | `numeric` | Stored in NOK; UI displays `{price},-` |
| `course_code` | `text` | Uppercased before insert for consistency |
| `university` | `text` | Human-readable name; abbreviations resolved in UI |
| `file_path` | `text` | Path inside `documents` bucket |
| `user_id` | `uuid` (FK `auth.users`) | Owner of the document |
| `file_size` | `bigint` (added via app insert) | Not in base SQL but stored from `/sell` page |
| `page_count` | `int` | Extracted via `pdf-lib` |
| `tags` | `text[]` | Optional; used for client-side filtering |
| `grade` | `text` | Optional grade (A–F) |
| `semester` | `text` | Combined string like “Høst 2024” |
| `grade_proof_url` | `text` | Evidence link when grade is provided |
| `grade_verified` | `boolean` | Defaults to `false`; surfaced in UI |
| `preview_page_count` | `int` | Number of pages shown to buyers before purchase |
| `view_count` | `bigint` | Auto-incremented when users open the document page |

Row-Level Security:

- `Documents are public` → anyone can `SELECT`.
- `Users can insert their own documents` → `INSERT` allowed when `auth.uid() = user_id`.

### `profiles`

Defined in `database/supabase_setup.sql`. Mirrors Supabase Auth users.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` (PK, FK `auth.users`) | Matches Supabase user ID |
| `updated_at` | `timestamptz` | Updated on profile save |
| `username` | `text` unique, min length 3 | Displayed in profile, fallback author |
| `full_name` | `text` | Optional |
| `avatar_url` | `text` | Public URL to avatar |
| `website` | `text` | Not yet surfaced in UI |

RLS Policies:

- Public can `SELECT`.
- Users can `INSERT`/`UPDATE` their own row (`auth.uid() = id`).

Trigger `on_auth_user_created` calls `public.handle_new_user()` to insert a profile each time a Supabase auth user is created (copies metadata `username`, `full_name`, `avatar_url`).

## Storage Buckets

### `documents`

- Created in `supabase_schema.sql`.
- Initially private (not public).
- Policies:
  - Upload: authenticated users only when `bucket_id = 'documents'`.
  - Select: replaced by `database/storage_policies/supabase_storage_fix.sql` to allow all authenticated users to preview PDFs (`auth.role() = 'authenticated'`).
- Access patterns:
  - `/sell` uploads via `supabase.storage.from('documents').upload`.
  - `/document/[id]` generates signed URLs (`createSignedUrl`) for preview.
  - Owners download via `supabase.storage.download`.

### `avatars`

- Created in `database/supabase_avatars.sql`.
- Public bucket (anyone can view).
- Folder structure: `${user.id}/avatar.ext`.
- Policies ensure only the owner (`auth.uid()`) can upload/update files under their folder.
- `/profile` uses `.upload(..., { upsert: true })` and `getPublicUrl` to store avatar URLs.

## Auxiliary SQL Scripts

- `database/add_document_stats.sql`, `add_grade_system.sql`, `add_tags.sql`: extend the schema with stats, grade metadata, and tagging support (run as needed).
- `database/add_document_stats.sql` introduces computed stats; review before adding analytics features.

## Data Flow Summary

1. **Uploading**: authenticated user → `/sell` page → Supabase Storage (`documents`) → insert metadata row.
2. **Browsing**: unauthenticated/anonymous visitor → Supabase `SELECT` policies allow reading `documents`.
3. **Profiles**: trigger ensures `profiles` row exists; `/profile` updates `full_name` and `avatar_url`.
4. **Previews**: `documents` bucket requires authentication for `SELECT`, so visitors must log in before previewing; consider loosening if public previews desired (commented SQL in `database/storage_policies/supabase_storage_fix.sql`).

Keep this document synchronized with SQL scripts whenever you add columns, policies, or storage buckets. Update both the SQL files and this markdown to avoid drift between documentation and infrastructure.

