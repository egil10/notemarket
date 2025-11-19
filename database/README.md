# Database Setup Scripts

This folder contains SQL scripts for setting up the Supabase database.

## Scripts

### Initial Setup
Run these scripts in order when setting up a new Supabase project:

1. **`supabase_schema.sql`** – Creates the main `documents` table and storage bucket.
2. **`supabase_setup.sql`** – Creates the `profiles` table + trigger.
3. **`supabase_avatars.sql`** – Sets up the public `avatars` bucket/policies.
4. **`add_document_stats.sql`** – Adds `file_size`, `page_count`, `preview_page_count`, and `view_count`.
5. **`add_view_triggers.sql`** – Creates the RPC helpers that increment `view_count`.
6. **`storage_policies/supabase_storage_fix.sql`** – Loosens storage policy so authenticated users can preview PDFs.
7. **Optional**: `add_tags.sql`, `add_grade_system.sql`, `add_preview_settings.sql` (if not already covered in step 4).

## How to Run

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the SQL from each file
5. Run the query

## Notes

- Run scripts in the order listed above
- Some scripts may fail if tables/policies already exist (this is normal)
- Storage policies control who can view/upload files
