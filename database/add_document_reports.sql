-- Create document_reports table for reporting inappropriate documents
CREATE TABLE IF NOT EXISTS document_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    ip_address INET,
    user_agent TEXT
);

-- Add check constraint for status
ALTER TABLE document_reports 
ADD CONSTRAINT check_status 
CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Enable Row Level Security
ALTER TABLE document_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert reports (even anonymous users)
CREATE POLICY "Anyone can report documents"
    ON document_reports
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view their own reports"
    ON document_reports
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_document_reports_document_id ON document_reports(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reports_user_id ON document_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_document_reports_status ON document_reports(status);
CREATE INDEX IF NOT EXISTS idx_document_reports_created_at ON document_reports(created_at DESC);

-- Add comments
COMMENT ON TABLE document_reports IS 'Stores user reports about inappropriate or problematic documents';
COMMENT ON COLUMN document_reports.document_id IS 'The document being reported';
COMMENT ON COLUMN document_reports.user_id IS 'User who submitted the report (null for anonymous)';
COMMENT ON COLUMN document_reports.reason IS 'Reason for the report';
COMMENT ON COLUMN document_reports.status IS 'Status: pending, reviewed, resolved, or dismissed';
COMMENT ON COLUMN document_reports.ip_address IS 'IP address of the reporter (for moderation)';
COMMENT ON COLUMN document_reports.user_agent IS 'User agent of the reporter (for moderation)';

