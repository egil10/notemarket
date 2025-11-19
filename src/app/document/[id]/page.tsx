'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import styles from './document.module.css';

export default function DocumentPage() {
    const params = useParams();
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (params.id) {
            fetchDocument();
        }
    }, [params.id]);

    async function fetchDocument() {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) {
            console.error('Error fetching document:', error);
        } else {
            setDocument(data);
            // Get signed URL for PDF
            const { data: urlData } = await supabase.storage
                .from('documents')
                .createSignedUrl(data.file_path, 3600); // 1 hour expiry

            if (urlData) {
                setPdfUrl(urlData.signedUrl);
            }
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <Header />
                <div className={styles.loading}>Laster dokument...</div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className={styles.page}>
                <Header />
                <div className={styles.error}>
                    <h1>Dokument ikke funnet</h1>
                    <Link href="/search">
                        <Button>Tilbake til søk</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={styles.preview}>
                            <h3>Forhåndsvisning</h3>
                            {pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    className={styles.pdfViewer}
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className={styles.noPreview}>
                                    <p>Forhåndsvisning ikke tilgjengelig</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.details}>
                            <div className={styles.header}>
                                <h1 className={styles.title}>{document.title}</h1>
                                <div className={styles.meta}>
                                    <span className={styles.badge}>{document.course_code || 'N/A'}</span>
                                    <span className={styles.badge}>{document.university || 'Ukjent'}</span>
                                </div>
                            </div>

                            <div className={styles.price}>
                                <span className={styles.priceAmount}>{document.price} NOK</span>
                            </div>

                            <div className={styles.description}>
                                <h3>Beskrivelse</h3>
                                <p>{document.description || 'Ingen beskrivelse tilgjengelig.'}</p>
                            </div>

                            <div className={styles.actions}>
                                <Button size="lg" fullWidth>
                                    Kjøp dokument
                                </Button>
                                <p className={styles.disclaimer}>
                                    Betaling kommer snart! Dette er en forhåndsvisning.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
