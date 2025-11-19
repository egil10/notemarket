'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import styles from './search.module.css';

export default function SearchPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchDocuments();
    }, []);

    async function fetchDocuments() {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
        } else {
            setDocuments(data || []);
        }
        setLoading(false);
    }

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Kjøp dokumenter</h1>
                        <p className={styles.subtitle}>
                            Bla gjennom tusenvis av studiematerialer fra studenter over hele Norge
                        </p>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Laster dokumenter...</div>
                    ) : documents.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Ingen dokumenter funnet enda.</p>
                            <p>Vær den første til å laste opp!</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {documents.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    id={doc.id}
                                    title={doc.title}
                                    author="Anonym" // We'll fetch from profiles later
                                    university={doc.university || 'Ukjent'}
                                    courseCode={doc.course_code || 'N/A'}
                                    price={doc.price}
                                    pages={0} // Not stored yet
                                    type="Dokument"
                                    rating={0} // Not implemented yet
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
