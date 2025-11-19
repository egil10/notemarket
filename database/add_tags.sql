-- Add tags column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add index for faster tag searches
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN (tags);

-- Add comment for documentation
COMMENT ON COLUMN documents.tags IS 'Array of tags for categorizing and filtering documents';
