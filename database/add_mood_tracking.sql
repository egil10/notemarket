-- Create mood_clicks table for tracking user mood interactions
CREATE TABLE IF NOT EXISTS mood_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mood TEXT NOT NULL CHECK (mood IN ('happy', 'neutral', 'sad')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users,
    ip_address TEXT,
    user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE mood_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert mood clicks (public analytics)
CREATE POLICY "Anyone can insert mood clicks"
    ON mood_clicks FOR INSERT
    WITH CHECK (true);

-- Allow anyone to read aggregated mood data (for analytics)
CREATE POLICY "Anyone can read mood clicks"
    ON mood_clicks FOR SELECT
    USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mood_clicks_mood ON mood_clicks(mood);
CREATE INDEX IF NOT EXISTS idx_mood_clicks_created_at ON mood_clicks(created_at);

-- Add comment
COMMENT ON TABLE mood_clicks IS 'Tracks user mood interactions (happy, neutral, sad) for fun analytics';

