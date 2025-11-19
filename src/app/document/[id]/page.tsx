'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import { generateDocumentFilename } from '@/lib/universities';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
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

            // Increment view count (fire-and-forget style with await to satisfy TS)
            const { error: viewError } = await supabase.rpc('increment_document_views', { doc_id: data.id });
            if (viewError) {
                console.error('Feil ved increment_document_views:', viewError);
            }

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
                document.title,
                document.course_code || '',
                document.university || '',
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

    const previewLimit = document.preview_page_count || 1;
    const totalPages = document.page_count || previewLimit;
    const maxViewablePages = isOwner ? totalPages : previewLimit;
    const lockedPages = !isOwner ? Math.max(totalPages - previewLimit, 0) : 0;
    const isOnLockedPage = currentPage > maxViewablePages;

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        // Allow navigation to one page beyond preview limit to show locked state
        const maxNavigablePage = maxViewablePages + (lockedPages > 0 ? 1 : 0);
        if (currentPage < maxNavigablePage) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={styles.preview}>
                            <h3>Forhåndsvisning</h3>
                            {pdfUrl ? (
                                <div className={styles.multiPreview} onContextMenu={(e) => e.preventDefault()}>
                                    <div className={styles.previewMetaRow}>
                                        <span>Side {currentPage} av {totalPages}</span>
                                        {!isOwner && lockedPages > 0 && (
                                            <span className={styles.lockedBadge}>{lockedPages} sider låst</span>
                                        )}
                                    </div>
                                    <div className={styles.carouselContainer}>
                                        {isOnLockedPage ? (
                                            <div className={styles.lockedPanel}>
                                                <h4>+ {lockedPages} sider</h4>
                                                <p>Kjøp dokumentet for å låse opp resten.</p>
                                            </div>
                                        ) : (
                                            <div className={styles.carouselFrame}>
                                                <span className={styles.pageIndicator}>Side {currentPage}</span>
                                                <iframe
                                                    src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0&scrollbar=0&zoom=100`}
                                                    className={styles.pdfFrame}
                                                    title={`PDF Preview page ${currentPage}`}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    style={{ pointerEvents: isOwner ? 'auto' : 'none' }}
                                                />
                                            </div>
                                        )}
                                        <div className={styles.carouselControls}>
                                            <button
                                                className={styles.carouselButton}
                                                onClick={handlePrevPage}
                                                disabled={currentPage === 1}
                                                aria-label="Forrige side"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                className={styles.carouselButton}
                                                onClick={handleNextPage}
                                                disabled={currentPage >= maxViewablePages + (lockedPages > 0 ? 1 : 0)}
                                                aria-label="Neste side"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                    <span className={styles.badge}>
                                        👁 {document.view_count ?? 0} visninger
                                    </span>
                                    {document.page_count && (
                                        <span className={styles.badge}>
                                            {document.page_count} sider
                                        </span>
                                    )}
                                    {document.file_size && (
                                        <span className={styles.badge}>
                                            {(document.file_size / (1024 * 1024)).toFixed(1)} MB
                                        </span>
                                    )}
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
