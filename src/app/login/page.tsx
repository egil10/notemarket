'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './login.module.css';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/sell'); // Redirect to sell page after login
                router.refresh();
            } else {
                // Sign Up with metadata
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                        data: {
                            username,
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                setMessage('Sjekk e-posten din for å bekrefte kontoen!');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{isLogin ? 'Velkommen tilbake' : 'Opprett konto'}</h1>
                <p className={styles.subtitle}>
                    {isLogin
                        ? 'Logg inn for å selge og kjøpe dokumenter'
                        : 'Bli med i Norges største studentmarked'}
                </p>

                <form onSubmit={handleAuth} className={styles.form}>
                    {!isLogin && (
                        <>
                            <div className={styles.formGroup}>
                                <label>Brukernavn</label>
                                <input
                                    type="text"
                                    required
                                    minLength={3}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="student_ola"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Fullt Navn</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ola Nordmann"
                                />
                            </div>
                        </>
                    )}

                    <div className={styles.formGroup}>
                        <label>E-post</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ola@student.no"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Passord</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    {message && <div className={styles.success}>{message}</div>}

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Laster...' : (isLogin ? 'Logg inn' : 'Registrer deg')}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p>
                        {isLogin ? 'Har du ikke konto?' : 'Har du allerede konto?'}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className={styles.switchButton}
                        >
                            {isLogin ? 'Registrer deg' : 'Logg inn'}
                        </button>
                    </p>
                    <Link href="/" className={styles.backLink}>← Tilbake til forsiden</Link>
                </div>
            </div>
        </div>
    );
}
