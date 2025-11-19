-- Add file_size and page_count columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS page_count INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN documents.file_size IS 'File size in bytes';
COMMENT ON COLUMN documents.page_count IS 'Number of pages in the document';
