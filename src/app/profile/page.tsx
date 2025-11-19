'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { Edit3, Trash2, AlertTriangle } from 'lucide-react';
import styles from './profile.module.css';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [deletingProfile, setDeletingProfile] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const { showToast } = useToast();

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

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarUrl(urlData.publicUrl);
        } catch (error: any) {
            showToast('Feil ved opplasting: ' + error.message, 'error');
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
            showToast('Feil ved lagring: ' + error.message, 'error');
        } else {
            showToast('Profil oppdatert!', 'success');
            setEditing(false);
            await fetchProfile(user.id);
        }
    }

    async function handleDeleteDocument(docId: string, filePath?: string | null) {
        if (!user) return;
        const confirmed = window.confirm('Er du sikker på at du vil slette dette dokumentet?');
        if (!confirmed) return;
        setDeletingDocId(docId);
        try {
            if (filePath) {
                await supabase.storage.from('documents').remove([filePath]);
            }
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', docId)
                .eq('user_id', user.id);
            if (error) throw error;
            setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
            showToast('Dokument slettet', 'success');
        } catch (error: any) {
            showToast('Kunne ikke slette dokumentet: ' + error.message, 'error');
        } finally {
            setDeletingDocId(null);
        }
    }

    async function handleDeleteProfile() {
        if (!user || deletingProfile) return;
        const confirmed = window.confirm('Dette vil slette kontoen og alle dokumentene dine permanent. Fortsett?');
        if (!confirmed) return;
        setDeletingProfile(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Fant ikke aktiv sesjon');
            }
            const response = await fetch('/api/profile/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: session.access_token }),
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || 'Ukjent feil');
            }
            await supabase.auth.signOut();
            showToast('Profilen din er slettet.', 'success');
            router.push('/');
        } catch (error: any) {
            showToast('Kunne ikke slette profil: ' + error.message, 'error');
        } finally {
            setDeletingProfile(false);
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
                                        <label>Profilbilde</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                        {avatarUrl && (
                                            <img
                                                src={avatarUrl}
                                                alt="Preview"
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    marginTop: '0.5rem',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        )}
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
                                <Button onClick={() => router.push('/sell')}>Last opp første dokument</Button>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {documents.map((doc) => (
                                    <div key={doc.id} className={styles.docCard}>
                                        <DocumentCard
                                            id={doc.id}
                                            title={doc.title}
                                            author={profile?.username || 'Deg'}
                                            university={doc.university || 'Ukjent'}
                                            courseCode={doc.course_code || 'N/A'}
                                            price={doc.price}
                                            pages={doc.page_count || 0}
                                            type="Dokument"
                                            rating={0}
                                            grade={doc.grade}
                                            gradeVerified={doc.grade_verified}
                                            viewCount={doc.view_count || 0}
                                        />
                                        <div className={styles.docMeta}>
                                            <span>Oppdatert {new Date(doc.updated_at || doc.created_at).toLocaleDateString('nb-NO')}</span>
                                            <span>{doc.preview_page_count || 1} forhåndsviste sider</span>
                                        </div>
                                        <div className={styles.docActions}>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => router.push(`/profile/dokument/${doc.id}`)}
                                            >
                                                <Edit3 size={16} />
                                                Rediger
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                                                disabled={deletingDocId === doc.id}
                                            >
                                                <Trash2 size={16} />
                                                {deletingDocId === doc.id ? 'Sletter...' : 'Slett'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.section} ${styles.dangerSection}`}>
                        <div className={styles.dangerCopy}>
                            <h2>Slett profil</h2>
                            <p>
                                Sletting av profilen vil fjerne alle dokumenter, statistikk og brukerdata permanent. Denne handlingen
                                kan ikke angres.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            className={styles.dangerButton}
                            onClick={handleDeleteProfile}
                            disabled={deletingProfile}
                        >
                            <AlertTriangle size={16} />
                            {deletingProfile ? 'Sletter profil...' : 'Slett profilen min'}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
