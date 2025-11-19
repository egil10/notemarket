import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(request: NextRequest) {
    try {
        const { accessToken } = await request.json();
        if (!accessToken) {
            return NextResponse.json({ error: 'Mangler tilgangstoken' }, { status: 400 });
        }

        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Ugyldig token' }, { status: 401 });
        }

        const userId = userData.user.id;

        const { data: documents, error: docsError } = await supabaseAdmin
            .from('documents')
            .select('file_path')
            .eq('user_id', userId);

        if (docsError) {
            return NextResponse.json({ error: docsError.message }, { status: 500 });
        }

        const filesToRemove = (documents || [])
            .map((doc) => doc.file_path)
            .filter((path): path is string => Boolean(path));

        if (filesToRemove.length > 0) {
            await supabaseAdmin.storage.from('documents').remove(filesToRemove);
        }

        await supabaseAdmin.from('documents').delete().eq('user_id', userId);
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Ukjent feil' }, { status: 500 });
    }
}

