'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/SuccessModal';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from './sell.module.css';

export default function SellPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
        } else {
            setUser(user);
        }
        setLoading(false);
    }

    async function handleUpload() {
        if (!file || !user) return;
        setUploading(true);

        try {
            // 1. Upload File
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Insert Metadata
            const { error: dbError } = await supabase
                .from('documents')
                .insert({
                    title,
                    course_code: courseCode,
                    price: parseFloat(price),
                    description,
                    file_path: filePath,
                    user_id: user.id,
                    university: 'Unknown' // Placeholder
                });

            if (dbError) throw dbError;

            setShowSuccess(true);
            // Reset form
            setFile(null);
            setTitle('');
            setCourseCode('');
            setPrice('');
            setDescription('');
        } catch (error: any) {
            alert('Error uploading: ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    if (loading) return <div className={styles.page}>Loading...</div>;

    if (!user) return null; // Will redirect

    return (
        <div className={styles.page}>
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Gratulerer! 🎉"
                message="Dokumentet ditt er nå publisert og tilgjengelig for salg!"
            />
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Selg dine dokumenter</h1>
                        <p className={styles.subtitle}>
                            Last opp notater, sammendrag eller eksamensbesvarelser og tjen penger.
                        </p>
                    </div>

                    <div className={styles.uploadCard}>
                        <div className={styles.dropzone}>
                            <div className={styles.icon}>📄</div>
                            {file ? (
                                <h3>{file.name}</h3>
                            ) : (
                                <>
                                    <h3>Dra og slipp filen din her</h3>
                                    <p>eller</p>
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                    />
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        Velg fil fra datamaskin
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Tittel på dokumentet</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Eks: Sammendrag av JUS101"
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Fagkode</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                        placeholder="Eks: JUS101"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Pris (NOK)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="100"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Beskrivelse</label>
                                <textarea
                                    rows={4}
                                    className={styles.textarea}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Beskriv hva dokumentet inneholder..."
                                />
                            </div>

                            <Button fullWidth size="lg" onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Laster opp...' : 'Last opp og publiser'}
                            </Button>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
