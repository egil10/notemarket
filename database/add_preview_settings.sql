-- Add preview_page_count column to control how many pages are visible before purchase
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS preview_page_count INTEGER DEFAULT 1;

COMMENT ON COLUMN documents.preview_page_count IS 'Number of pages visible to non-owners as preview';

