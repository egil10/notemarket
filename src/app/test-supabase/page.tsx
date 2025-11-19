'use client';

import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('documents').select('count').limit(1);
        
        if (error) {
            // If table doesn't exist, it might still throw a specific error we can catch
            // But for now, any error means connection failed or config is wrong
            throw error;
        }
        
        setStatus('Connection Successful! Supabase is reachable.');
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error occurred');
        setStatus('Connection Failed');
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Supabase Connection Test</h1>
      <div style={{ 
        padding: '1rem', 
        borderRadius: '8px', 
        backgroundColor: error ? '#fee2e2' : '#dcfce7',
        color: error ? '#991b1b' : '#166534',
        marginTop: '1rem'
      }}>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <strong>Error Details:</strong>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}
