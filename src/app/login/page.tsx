'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import styles from './login.module.css';

const passwordRules = [
    { label: 'Minst 8 tegn', test: (value: string) => value.length >= 8 },
    { label: 'Minst én stor bokstav', test: (value: string) => /[A-Z]/.test(value) },
    { label: 'Minst én liten bokstav', test: (value: string) => /[a-z]/.test(value) },
    { label: 'Minst ett tall', test: (value: string) => /\d/.test(value) },
    { label: 'Minst ett spesialtegn', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const passwordRuleStatuses = useMemo(
        () => passwordRules.map(rule => ({ ...rule, passed: rule.test(password) })),
        [password]
    );
    const isPasswordStrong = isLogin || passwordRuleStatuses.every(rule => rule.passed);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (!isLogin && !isPasswordStrong) {
                setError('Passordet må oppfylle alle kravene.');
                return;
            }

            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Hard refresh to home page
                window.location.href = '/';
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

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
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
                        <div className={styles.passwordField}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {!isLogin && (
                            <div className={styles.passwordRequirements}>
                                {passwordRuleStatuses.map((rule) => (
                                    <div
                                        key={rule.label}
                                        className={`${styles.requirement} ${rule.passed ? styles.requirementMet : ''}`}
                                    >
                                        {rule.passed ? <Check size={14} /> : <X size={14} />}
                                        <span>{rule.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    {message && <div className={styles.success}>{message}</div>}

                    <Button type="submit" fullWidth disabled={loading || !isPasswordStrong}>
                        {loading ? 'Laster...' : (isLogin ? 'Logg inn' : 'Registrer deg')}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span>Eller fortsett med</span>
                </div>
                <button
                    type="button"
                    className={styles.googleButton}
                    onClick={handleGoogleAuth}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 533.5 544.3" aria-hidden="true">
                        <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272.1v95.3h147.3c-6.4 34.4-25.7 63.5-54.6 83l88.2 68.3c51.5-47.4 80.5-117.4 80.5-196.2z" />
                        <path fill="#34a853" d="M272.1 544.3c73.6 0 135.3-24.4 180.3-66.2l-88.2-68.3c-24.5 16.5-55.9 26.2-92.1 26.2-70.9 0-131-47.9-152.6-112.3l-91.5 70.5c47.4 94 145.1 150.1 243.9 150.1z" />
                        <path fill="#fbbc05" d="M119.5 323.7c-10.9-32.4-10.9-67.6 0-100l-91.5-70.5c-40.4 80.1-40.4 160.9 0 241l91.5-70.5z" />
                        <path fill="#ea4335" d="M272.1 107.4c38.6-.6 75.6 13.9 103.9 40.7l77.7-77.7C400.2 24 339.9 0 272.1 0 173.2 0 75.5 56.1 28.1 150.2l91.5 70.5c21.5-64.4 81.6-112.3 152.5-112.3z" />
                    </svg>
                    <span>Google</span>
                </button>

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
