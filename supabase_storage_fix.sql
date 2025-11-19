-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can download their own documents" ON storage.objects;

-- Create a new policy that allows authenticated users to view documents
-- This enables PDF preview for everyone
create policy "Authenticated users can view documents"
  on storage.objects for select
  using ( bucket_id = 'documents' and auth.role() = 'authenticated' );

-- Optional: If you want to allow public viewing (no login required), use this instead:
-- create policy "Public can view documents"
--   on storage.objects for select
--   using ( bucket_id = 'documents' );
