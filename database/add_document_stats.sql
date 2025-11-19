-- Add file_size and page_count columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS page_count INTEGER,
ADD COLUMN IF NOT EXISTS preview_page_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN documents.file_size IS 'File size in bytes';
COMMENT ON COLUMN documents.page_count IS 'Number of pages in the document';
COMMENT ON COLUMN documents.preview_page_count IS 'Number of preview pages visible before purchase';
COMMENT ON COLUMN documents.view_count IS 'Number of times the document page has been viewed';
