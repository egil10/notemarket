-- Helper function to increment document view counts safely
create or replace function increment_document_view(doc_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update documents
  set view_count = coalesce(view_count, 0) + 1
  where id = doc_id;
end;
$$;

revoke all on function increment_document_view(uuid) from public;
grant execute on function increment_document_view(uuid) to authenticated;

-- RPC wrapper for Supabase client calls
create or replace function increment_document_views(doc_id uuid)
returns void
language sql
security definer
as $$
  select increment_document_view(doc_id);
$$;

revoke all on function increment_document_views(uuid) from public;
grant execute on function increment_document_views(uuid) to authenticated;

