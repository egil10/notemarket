import { createClient } from '@supabase/supabase-js';

// This script fixes the storage policy to allow authenticated users to view documents
async function fixStoragePolicy() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials in environment variables');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('Fixing storage policy...');

    try {
        // Drop the old restrictive policy
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: `DROP POLICY IF EXISTS "Users can download their own documents" ON storage.objects;`
        });

        if (dropError) {
            console.error('Error dropping old policy:', dropError);
        } else {
            console.log('✓ Dropped old policy');
        }

        // Create new policy that allows authenticated users to view documents
        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `CREATE POLICY "Authenticated users can view documents"
                  ON storage.objects FOR SELECT
                  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');`
        });

        if (createError) {
            console.error('Error creating new policy:', createError);
        } else {
            console.log('✓ Created new policy');
        }

        console.log('\n✅ Storage policy fixed! PDF previews should now work.');
    } catch (error) {
        console.error('Unexpected error:', error);
        process.exit(1);
    }
}

fixStoragePolicy();
