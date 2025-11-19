'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from './UserMenu.module.css';

export const UserMenu = () => {
    const [user, setUser] = useState<any>(null);
    const [username, setUsername] = useState<string>('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        checkUser();

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUsername(profile.username);
            }
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/'; // Hard refresh to home
    }

    if (!user) {
        return (
            <div className={styles.menu}>
                <Link href="/login">
                    <button className={styles.loginButton}>Logg inn</button>
                </Link>
                <Link href="/login">
                    <button className={styles.signupButton}>Bli medlem</button>
                </Link>
            </div>
        );
    }

    const greetingName = username || user.email?.split('@')[0] || 'deg';

    return (
        <div className={styles.menu} ref={dropdownRef}>
            <button
                className={styles.profileButton}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                Hei {greetingName}!
            </button>

            {showDropdown && (
                <div className={styles.dropdown}>
                    <div className={styles.greeting}>
                        Hei, {greetingName}!
                    </div>
                    <Link href="/profile" onClick={() => setShowDropdown(false)}>
                        <div className={styles.dropdownItem}>
                            PROFILE
                        </div>
                    </Link>
                    <div className={styles.dropdownItem} onClick={handleLogout}>
                        LOGOUT
                    </div>
                </div>
            )}
        </div>
    );
};
