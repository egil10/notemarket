import { createClient } from '@supabase/supabase-js';

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseAdmin = () => {
    if (!supabaseAdminInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase admin credentials are not configured');
        }

        supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false,
            },
        });
    }

    return supabaseAdminInstance;
};

