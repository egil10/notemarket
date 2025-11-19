'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        setUser(user);
        await fetchProfile(user.id);
        await fetchUserDocuments(user.id);
        setLoading(false);
    }

    async function fetchProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setProfile(data);
            setFullName(data.full_name || '');
            setAvatarUrl(data.avatar_url || '');
        }
    }

    async function fetchUserDocuments(userId: string) {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) {
            setDocuments(data);
        }
    }

    async function handleSave() {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            alert('Feil ved lagring: ' + error.message);
        } else {
            alert('Profil oppdatert!');
            setEditing(false);
            await fetchProfile(user.id);
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <Header />
                <div className={styles.loading}>Laster profil...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatar}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>

                        <div className={styles.info}>
                            {editing ? (
                                <>
                                    <div className={styles.formGroup}>
                                        <label>Fullt Navn</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Ditt fulle navn"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Avatar URL</label>
                                        <input
                                            type="text"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className={styles.actions}>
                                        <Button onClick={handleSave}>Lagre</Button>
                                        <Button variant="ghost" onClick={() => setEditing(false)}>
                                            Avbryt
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 className={styles.name}>{profile?.full_name || 'Ingen navn'}</h1>
                                    <p className={styles.username}>@{profile?.username || 'ukjent'}</p>
                                    <p className={styles.email}>{user.email}</p>
                                    <Button onClick={() => setEditing(true)}>Rediger profil</Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{documents.length}</span>
                            <span className={styles.statLabel}>Dokumenter</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>0</span>
                            <span className={styles.statLabel}>Salg</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>0 NOK</span>
                            <span className={styles.statLabel}>Inntekt</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Mine dokumenter</h2>
                        {documents.length === 0 ? (
                            <div className={styles.empty}>
                                <p>Du har ikke lastet opp noen dokumenter enda.</p>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {documents.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        id={doc.id}
                                        title={doc.title}
                                        author={profile?.username || 'Deg'}
                                        university={doc.university || 'Ukjent'}
                                        courseCode={doc.course_code || 'N/A'}
                                        price={doc.price}
                                        pages={0}
                                        type="Dokument"
                                        rating={0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
