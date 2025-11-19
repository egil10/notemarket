-- Create the documents table
create table documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price numeric not null,
  course_code text,
  university text,
  file_path text not null, -- Path in Supabase Storage
  user_id uuid references auth.users default auth.uid() not null
);

-- Enable Row Level Security (RLS)
alter table documents enable row level security;

-- Create a policy that allows anyone to read documents
create policy "Documents are public"
  on documents for select
  using ( true );

-- Create a policy that allows authenticated users to insert their own documents
create policy "Users can insert their own documents"
  on documents for insert
  with check ( auth.uid() = user_id );

-- Create a storage bucket for documents
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

-- Storage Policy: Allow authenticated users to upload files
create policy "Authenticated users can upload documents"
  on storage.objects for insert
  with check ( bucket_id = 'documents' and auth.role() = 'authenticated' );

-- Storage Policy: Allow users to download their own files (or purchased ones - simplified for now)
create policy "Users can download their own documents"
  on storage.objects for select
  using ( bucket_id = 'documents' and auth.uid() = owner );
