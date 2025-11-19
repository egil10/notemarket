'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from './ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const UserMenu = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setUser(null);
    };

    if (loading) return null;

    if (user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', cursor: 'pointer' }}>
                        Hei, {user.user_metadata?.username || user.email?.split('@')[0]}
                    </span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Logg ut
                </Button>
            </div>
        );
    }

    return (
        <>
            <Link href="/login">
                <Button variant="ghost" size="sm">Logg inn</Button>
            </Link>
            <Link href="/login">
                <Button variant="primary" size="sm">Bli medlem</Button>
            </Link>
        </>
    );
};
