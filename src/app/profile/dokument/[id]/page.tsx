'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import { UNIVERSITY_NAMES } from '@/lib/universities';
import { COURSE_CODES } from '@/lib/courseCodes';
import { FileText, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import styles from '@/app/sell/sell.module.css';

type Props = {
    params: { id: string };
};

type DocumentRecord = {
    id: string;
    title: string;
    course_code: string | null;
    university: string | null;
    price: number;
    description: string | null;
    file_path: string | null;
    file_size: number | null;
    page_count: number | null;
    grade: string | null;
    semester: string | null;
    grade_proof_url: string | null;
    preview_page_count: number | null;
    grade_verified: boolean | null;
};

export default function EditDocumentPage({ params }: Props) {
    const supabase = createClient();
    const router = useRouter();
    const { showToast } = useToast();

    const [user, setUser] = useState<any>(null);
    const [documentData, setDocumentData] = useState<DocumentRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [university, setUniversity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [grade, setGrade] = useState('');
    const [year, setYear] = useState('');
    const [season, setSeason] = useState('');
    const [gradeProofUrl, setGradeProofUrl] = useState('');
    const [pdfMetadata, setPdfMetadata] = useState<{ pages: number; sizeMB: number } | null>(null);
    const [previewPages, setPreviewPages] = useState(1);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('id', params.id)
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                showToast('Fant ikke dokumentet', 'error');
                router.push('/profile');
                return;
            }

            setDocumentData(data);
            setTitle(data.title || '');
            setCourseCode(data.course_code || '');
            setUniversity(data.university || '');
            setPrice(data.price?.toString() || '');
            setDescription(data.description || '');
            setGrade(data.grade || '');
            setGradeProofUrl(data.grade_proof_url || '');
            if (data.semester) {
                const [seasonLabel, yearValue] = data.semester.split(' ');
                setSeason(seasonLabel || '');
                setYear(yearValue || '');
            }
            setPreviewPages(data.preview_page_count || 1);
            if (data.page_count) {
                const sizeMB = data.file_size ? parseFloat((data.file_size / (1024 * 1024)).toFixed(2)) : 0;
                setPdfMetadata({ pages: data.page_count, sizeMB });
            }
            setLoading(false);
        })();
    }, [params.id, router, showToast, supabase]);

    useEffect(() => {
        const totalPages = pdfMetadata?.pages || documentData?.page_count;
        if (totalPages) {
            setPreviewPages((prev) => Math.min(Math.max(1, prev), totalPages));
        }
    }, [pdfMetadata?.pages, documentData?.page_count]);

    async function handleFileChange(selectedFile: File | null) {
        if (!selectedFile) {
            setFile(null);
            if (documentData?.page_count) {
                const sizeMB = documentData.file_size ? parseFloat((documentData.file_size / (1024 * 1024)).toFixed(2)) : 0;
                setPdfMetadata({ pages: documentData.page_count, sizeMB });
            } else {
                setPdfMetadata(null);
            }
            return;
        }

        if (selectedFile.type !== 'application/pdf') {
            showToast('Kun PDF-filer er tillatt', 'error');
            return;
        }

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pageCount = pdfDoc.getPageCount();
            const sizeMB = parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2));
            setPdfMetadata({ pages: pageCount, sizeMB });
            setPreviewPages(Math.min(Math.max(1, previewPages), pageCount));
        } catch (error) {
            showToast('Kunne ikke lese PDF-metadata', 'error');
        }

        setFile(selectedFile);
    }

    function handleRemoveFile() {
        setFile(null);
        if (documentData?.page_count) {
            const sizeMB = documentData.file_size ? parseFloat((documentData.file_size / (1024 * 1024)).toFixed(2)) : 0;
            setPdfMetadata({ pages: documentData.page_count, sizeMB });
        } else {
            setPdfMetadata(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    async function handleUpdate() {
        if (!user || !documentData) return;
        if (!title || !courseCode || !university || !price) {
            showToast('Fyll ut alle obligatoriske felter', 'error');
            return;
        }
        if (grade && !gradeProofUrl && !documentData.grade_proof_url) {
            showToast('Legg til lenke til karakterbevis', 'error');
            return;
        }

        setSaving(true);
        let newFilePath = documentData.file_path;
        let newPageCount = documentData.page_count;
        let newFileSize = documentData.file_size;

        try {
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;
                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, file);
                if (uploadError) throw uploadError;
                newFilePath = filePath;
                newPageCount = pdfMetadata?.pages || newPageCount;
                newFileSize = file.size;
            }

            const semester = year && season ? `${season} ${year}` : null;
            const { error } = await supabase
                .from('documents')
                .update({
                    title,
                    course_code: courseCode.toUpperCase(),
                    university,
                    price: parseFloat(price),
                    description,
                    grade: grade || null,
                    semester,
                    grade_proof_url: grade ? (gradeProofUrl || documentData.grade_proof_url || null) : null,
                    preview_page_count: previewPages,
                    file_path: newFilePath,
                    page_count: newPageCount,
                    file_size: newFileSize,
                })
                .eq('id', documentData.id)
                .eq('user_id', user.id);

            if (error) throw error;

            if (file && documentData.file_path && documentData.file_path !== newFilePath) {
                await supabase.storage.from('documents').remove([documentData.file_path]);
            }

            showToast('Dokument oppdatert', 'success');
            router.push('/profile');
        } catch (error: any) {
            showToast('Kunne ikke oppdatere dokument: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <Header />
                <div className={styles.main}>
                    <div className={styles.container}>Laster dokument...</div>
                </div>
            </div>
        );
    }

    if (!documentData) return null;

    const totalPages = pdfMetadata?.pages || documentData.page_count || 1;

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Rediger dokument</h1>
                            <p className={styles.subtitle}>Oppdater informasjon og fil for dokumentet ditt.</p>
                        </div>
                        <Button variant="ghost" onClick={() => router.push('/profile')}>
                            Tilbake til profil
                        </Button>
                    </div>

                    <div className={styles.uploadCard}>
                        <div className={styles.dropzone}>
                            <div className={styles.icon}>
                                <FileText size={48} strokeWidth={1.5} />
                            </div>
                            <div className={styles.pdfBadge}>PDF</div>
                            {file ? (
                                <div className={styles.fileInfo}>
                                    <div>
                                        <h3>{file.name}</h3>
                                        {pdfMetadata && (
                                            <p className={styles.metadata}>
                                                {pdfMetadata.pages} sider • {pdfMetadata.sizeMB} MB
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className={styles.removeButton}
                                    >
                                        <X size={16} />
                                        Fjern valgt fil
                                    </Button>
                                </div>
                            ) : (
                                <div className={styles.fileInfo}>
                                    <div>
                                        <h3>Nåværende dokument</h3>
                                        {pdfMetadata && (
                                            <p className={styles.metadata}>
                                                {pdfMetadata.pages} sider • {pdfMetadata.sizeMB} MB
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Bytt fil
                                    </Button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                style={{ display: 'none' }}
                                accept="application/pdf"
                            />
                        </div>

                        <div className={styles.previewPanel}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>Forhåndsvisning av kort</h3>
                                    <p>Oppdaters automatisk etter hvert som du redigerer feltene.</p>
                                </div>
                            </div>
                            <DocumentCard
                                previewMode
                                id={documentData.id}
                                title={title || 'Dokument uten tittel'}
                                author={user?.user_metadata?.username || user?.email || 'Deg'}
                                university={university || 'Velg universitet'}
                                courseCode={(courseCode || '??').toUpperCase()}
                                price={price ? parseFloat(price) : 0}
                                pages={pdfMetadata?.pages || documentData.page_count || 0}
                                type="PDF"
                                grade={grade || undefined}
                                gradeVerified={documentData.grade_verified}
                            />
                            <div className={styles.previewMeta}>
                                <span>
                                    {pdfMetadata?.pages || documentData.page_count
                                        ? `${pdfMetadata?.pages || documentData.page_count} sider totalt`
                                        : 'Sidetall ukjent'}
                                </span>
                                <span>Viser {previewPages} sider i forhåndsvisning</span>
                            </div>
                        </div>

                        <div className={styles.form}>
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Dokumentinformasjon</h2>
                                    <span>Oppdater feltene under og lagre endringene</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Tittel på dokumentet</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>Fagkode</label>
                                        <AutocompleteInput
                                            value={courseCode}
                                            onChange={setCourseCode}
                                            suggestions={[...COURSE_CODES]}
                                            placeholder="Eks: MAT2000"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Universitet</label>
                                        <AutocompleteInput
                                            value={university}
                                            onChange={setUniversity}
                                            suggestions={UNIVERSITY_NAMES}
                                            placeholder="Velg universitet"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Pris (NOK)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            min={0}
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
                                    />
                                </div>
                            </section>

                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Tilleggsinformasjon</h2>
                                    <span>Valgfritt, men bygger tillit</span>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>Karakter</label>
                                        <select
                                            className={styles.input}
                                            value={grade}
                                            onChange={(e) => {
                                                setGrade(e.target.value);
                                                if (!e.target.value) setGradeProofUrl('');
                                            }}
                                        >
                                            <option value="">Ingen karakter</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                            <option value="E">E</option>
                                            <option value="F">F</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>År</label>
                                        <select
                                            className={styles.input}
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        >
                                            <option value="">Velg år</option>
                                            {['2025', '2024', '2023', '2022', '2021', '2020'].map((yr) => (
                                                <option key={yr} value={yr}>{yr}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Semester</label>
                                        <select
                                            className={styles.input}
                                            value={season}
                                            onChange={(e) => setSeason(e.target.value)}
                                        >
                                            <option value="">Velg semester</option>
                                            <option value="Vår">Vår</option>
                                            <option value="Sommer">Sommer</option>
                                            <option value="Høst">Høst</option>
                                        </select>
                                    </div>
                                </div>

                                {grade && (
                                    <div className={styles.formGroup}>
                                        <label>Lenke til karakterbevis</label>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            value={gradeProofUrl}
                                            onChange={(e) => setGradeProofUrl(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Antall forhåndsviste sider</label>
                                    <div className={styles.previewSlider}>
                                        <input
                                            type="range"
                                            min={1}
                                            max={totalPages}
                                            value={previewPages}
                                            onChange={(e) => setPreviewPages(Number(e.target.value))}
                                        />
                                        <div className={styles.sliderMeta}>
                                            Viser {previewPages} av {totalPages} sider
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Lagre endringer</h2>
                                    <span>Kontroller feltene før du lagrer</span>
                                </div>
                                <Button fullWidth size="lg" onClick={handleUpdate} disabled={saving}>
                                    {saving ? 'Lagrer...' : 'Oppdater dokument'}
                                </Button>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

