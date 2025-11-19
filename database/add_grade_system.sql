-- Add grade system columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS grade VARCHAR(2),
ADD COLUMN IF NOT EXISTS grade_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS grade_proof_url TEXT,
ADD COLUMN IF NOT EXISTS semester VARCHAR(20);

-- Add comments
COMMENT ON COLUMN documents.grade IS 'Grade achieved (A, B, C, D, E, F)';
COMMENT ON COLUMN documents.grade_verified IS 'Whether grade has been verified by admin';
COMMENT ON COLUMN documents.grade_proof_url IS 'URL to grade proof (screenshot, transcript)';
COMMENT ON COLUMN documents.semester IS 'Semester (e.g., "Høst 2024", "Vår 2025")';

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_documents_grade ON documents(grade);
CREATE INDEX IF NOT EXISTS idx_documents_semester ON documents(semester);
CREATE INDEX IF NOT EXISTS idx_documents_grade_verified ON documents(grade_verified);
