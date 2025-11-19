# Database Setup Scripts

This folder contains SQL scripts for setting up the Supabase database.

## Scripts

### Initial Setup
Run these scripts in order when setting up a new Supabase project:

1. **`supabase_schema.sql`** - Creates the main `documents` table and storage bucket
2. **`supabase_setup.sql`** - Creates the `profiles` table and user trigger
3. **`supabase_avatars.sql`** - Creates the `avatars` storage bucket and policies
4. **`supabase_storage_fix.sql`** - Updates storage policies for PDF viewing

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
