'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import { generateDocumentFilename } from '@/lib/universities';
import Link from 'next/link';
import styles from './document.module.css';

export default function DocumentPage() {
    const params = useParams();
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [username, setUsername] = useState<string>('user');
    const supabase = createClient();
    const { showToast } = useToast();

    useEffect(() => {
        if (params.id) {
            fetchDocument();
        }
    }, [params.id]);

    async function fetchDocument() {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) {
            console.error('Error fetching document:', error);
        } else {
            setDocument(data);
            setIsOwner(user?.id === data.user_id);

            // Get signed URL for PDF
            const { data: urlData, error: urlError } = await supabase.storage
                .from('documents')
                .createSignedUrl(data.file_path, 3600); // 1 hour expiry

            if (urlData) {
                setPdfUrl(urlData.signedUrl);
            } else {
                console.error('Error creating signed URL:', urlError);
            }

            // Fetch username if owner
            if (user?.id === data.user_id) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', data.user_id)
                    .single();

                if (profileData?.username) {
                    setUsername(profileData.username);
                }
            }
        }
        setLoading(false);
    }

    async function handleDownload() {
        if (!document) return;

        const { data, error } = await supabase.storage
            .from('documents')
            .download(document.file_path);

        if (error) {
            showToast('Feil ved nedlasting: ' + error.message, 'error');
        } else {
            // Create a download link with smart filename
            const filename = generateDocumentFilename(
                document.course_code || 'DOCUMENT',
                document.title,
                username
            );

            const url = window.URL.createObjectURL(data);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = filename;
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
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
                                {isOwner ? (
                                    <>
                                        <Button size="lg" fullWidth onClick={handleDownload}>
                                            Last ned ditt dokument
                                        </Button>
                                        <p className={styles.disclaimer}>
                                            Dette er ditt dokument. Du kan laste det ned når som helst.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Button size="lg" fullWidth>
                                            Kjøp dokument
                                        </Button>
                                        <p className={styles.disclaimer}>
                                            Betaling kommer snart! Dette er en forhåndsvisning.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
