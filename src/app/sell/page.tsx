'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/SuccessModal';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { UNIVERSITY_NAMES } from '@/lib/universities';
import { COURSE_CODES } from '@/lib/courseCodes';
import { FileText, X, Info } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import styles from './sell.module.css';

export default function SellPage() {
    const supabase = createClient();
    const router = useRouter();
    const { showToast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [pdfMetadata, setPdfMetadata] = useState<{ pages: number; sizeMB: number } | null>(null);
    const [previewPages, setPreviewPages] = useState(1);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadProgressMax, setUploadProgressMax] = useState(0);
    const [progressMode, setProgressMode] = useState<'pages' | 'size'>('pages');
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressTargetRef = useRef(0);

    // Form State
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [university, setUniversity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [grade, setGrade] = useState('');
    const [year, setYear] = useState('');
    const [season, setSeason] = useState('');
    const [gradeProofUrl, setGradeProofUrl] = useState('');

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (pdfMetadata?.pages) {
            setPreviewPages(prev => Math.min(Math.max(1, prev), pdfMetadata.pages));
        }
    }, [pdfMetadata?.pages]);

    const progressPercent = uploadProgressMax > 0 ? Math.min(uploadProgress / uploadProgressMax, 1) * 100 : 0;
    const progressUnit = progressMode === 'pages' ? 'sider' : 'MB';
    const progressCurrentDisplay = progressMode === 'pages'
        ? Math.floor(uploadProgress)
        : uploadProgressMax > 0
            ? uploadProgress.toFixed(2)
            : '0.00';
    const progressMaxDisplay = progressMode === 'pages'
        ? uploadProgressMax
        : uploadProgressMax > 0
            ? uploadProgressMax.toFixed(2)
            : '0.00';

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
        } else {
            setUser(user);
        }
        setLoading(false);
    }

    async function extractPdfMetadata(file: File) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pageCount = pdfDoc.getPageCount();
            const sizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));

            setPdfMetadata({ pages: pageCount, sizeMB });
            setPreviewPages(Math.max(1, Math.min(pageCount, 3)));
        } catch (error) {
            console.error('Error extracting PDF metadata:', error);
            showToast('Kunne ikke lese PDF-metadata', 'error');
        }
    }

    async function handleFileChange(selectedFile: File | null) {
        if (!selectedFile) {
            setFile(null);
            setPdfMetadata(null);
            return;
        }

        // Validate PDF file type
        if (selectedFile.type !== 'application/pdf') {
            showToast('Kun PDF-filer er tillatt', 'error');
            return;
        }

        setFile(selectedFile);
        await extractPdfMetadata(selectedFile);
    }

    function handleRemoveFile() {
        setFile(null);
        setPdfMetadata(null);
        setPreviewPages(1);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }

    const clearProgressInterval = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    };

    const startProgress = (max: number, mode: 'pages' | 'size') => {
        if (max <= 0) return;
        progressTargetRef.current = max;
        setProgressMode(mode);
        setUploadProgress(0);
        setUploadProgressMax(max);
        clearProgressInterval();

        const step = mode === 'pages' ? 1 : Math.max(max / 40, 0.05);
        progressIntervalRef.current = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= max - step) {
                    return prev;
                }
                return prev + step;
            });
        }, 250);
    };

    const finishProgress = () => {
        if (progressTargetRef.current > 0) {
            setUploadProgress(progressTargetRef.current);
        }
        clearProgressInterval();
        progressTargetRef.current = 0;
    };

    useEffect(() => {
        return () => {
            clearProgressInterval();
        };
    }, []);

    async function handleUpload() {
        if (!file || !user) return;

        // Validate grade proof if grade is selected
        if (grade && !gradeProofUrl) {
            showToast('Vennligst legg ved bevis for karakter (URL til karakterbevis)', 'error');
            return;
        }

        const totalPages = pdfMetadata?.pages || 0;
        const totalSizeMB = pdfMetadata?.sizeMB || parseFloat((file.size / (1024 * 1024)).toFixed(2));
        const usePages = totalPages > 0;
        const progressMax = usePages ? totalPages : totalSizeMB;

        setUploading(true);
        if (progressMax > 0) {
            startProgress(progressMax, usePages ? 'pages' : 'size');
        }

        try {
            // 1. Upload File
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Combine year and season into semester string
            const semester = year && season ? `${season} ${year}` : null;

            // 2. Insert Metadata
            const { error: dbError } = await supabase
                .from('documents')
                .insert({
                    title,
                    course_code: courseCode.toUpperCase(),
                    university,
                    price: parseFloat(price),
                    description,
                    file_path: filePath,
                    user_id: user.id,
                    file_size: file.size,
                    page_count: pdfMetadata?.pages || null,
                    tags: [],
                    grade: grade || null,
                    semester: semester,
                    grade_proof_url: gradeProofUrl || null,
                    grade_verified: false,
                    preview_page_count: previewPages,
                });

            if (dbError) throw dbError;

            setShowSuccess(true);
            // Reset form
            setFile(null);
            setPdfMetadata(null);
            setTitle('');
            setCourseCode('');
            setUniversity('');
            setPrice('');
            setDescription('');
            setGrade('');
            setYear('');
            setSeason('');
            setGradeProofUrl('');
            setPreviewPages(1);
        } catch (error: any) {
            showToast('Error uploading: ' + error.message, 'error');
        } finally {
            finishProgress();
            setUploading(false);
            setUploadProgress(0);
            setUploadProgressMax(0);
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
                                        Fjern fil
                                    </Button>
                                    {uploading && uploadProgressMax > 0 && (
                                        <div className={styles.progressWrapper}>
                                            <div className={styles.progressMeta}>
                                                <span>Laster opp...</span>
                                                <span>
                                                    {progressCurrentDisplay} / {progressMaxDisplay} {progressUnit}
                                                </span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <h3>
                                        Dra og slipp filen din her <span className={styles.required}>*</span>
                                    </h3>
                                    <p>eller</p>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                        accept="application/pdf"
                                    />
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        Velg fil fra datamaskin
                                    </Button>
                                    <p className={styles.fileRequirement}>Kun PDF-filer</p>
                                </>
                            )}
                        </div>

                        {file && (
                            <div className={styles.previewPanel}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h3>Forhåndsvisning av kort</h3>
                                        <p>Oppdaters automatisk etter hvert som du fyller ut feltene.</p>
                                    </div>
                                </div>
                                <DocumentCard
                                    previewMode
                                    id="preview"
                                    title={title || 'Dokument uten tittel'}
                                    author={user?.user_metadata?.username || user?.email || 'Deg'}
                                    university={university || 'Velg universitet'}
                                    courseCode={(courseCode || '??').toUpperCase()}
                                    price={price ? parseFloat(price) : 0}
                                    pages={pdfMetadata?.pages || 0}
                                    type="PDF"
                                    grade={grade || undefined}
                                    gradeVerified={false}
                                />
                                <div className={styles.previewMeta}>
                                    <span>{pdfMetadata?.pages ? `${pdfMetadata.pages} sider totalt` : 'Sidetall ukjent'}</span>
                                    <span>Viser {previewPages} sider i forhåndsvisning</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.form}>
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Obligatorisk informasjon</h2>
                                    <span>Alt merket med <span className={styles.required}>*</span> er påkrevd</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>
                                        Tittel på dokumentet <span className={styles.required}>*</span>
                                    </label>
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
                                        <label>
                                            Fagkode <span className={styles.required}>*</span>
                                        </label>
                                        <AutocompleteInput
                                            value={courseCode}
                                            onChange={setCourseCode}
                                            suggestions={[...COURSE_CODES]}
                                            placeholder="Eks: MAT2000"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>
                                            Universitet <span className={styles.required}>*</span>
                                        </label>
                                        <AutocompleteInput
                                            value={university}
                                            onChange={setUniversity}
                                            suggestions={UNIVERSITY_NAMES}
                                            placeholder="Velg universitet"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>
                                            Pris (NOK) <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="100"
                                            min={0}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        Beskrivelse <span className={styles.required}>*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        className={styles.textarea}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Beskriv hva dokumentet inneholder..."
                                    />
                                </div>
                            </section>

                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Tilleggsinformasjon (valgfritt)</h2>
                                    <span>Øker tilliten til dokumentet ditt</span>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>
                                            Karakter
                                            <span className={styles.hint} title="Velg karakteren du fikk på dokumentet">
                                                <Info size={16} />
                                            </span>
                                        </label>
                                        <select
                                            className={styles.input}
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
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
                                            <option value="2025">2025</option>
                                            <option value="2024">2024</option>
                                            <option value="2023">2023</option>
                                            <option value="2022">2022</option>
                                            <option value="2021">2021</option>
                                            <option value="2020">2020</option>
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
                                        <label>
                                            Lenke til karakterbevis
                                            <span className={styles.hint} title="Link til karakterbevis, StudentWeb, eller skjermbilde">
                                                <Info size={16} />
                                            </span>
                                        </label>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            value={gradeProofUrl}
                                            onChange={(e) => setGradeProofUrl(e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <p className={styles.gradeNote}>
                                            Karakteren vil vises som "Venter på verifisering" til en admin har godkjent den.
                                        </p>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Antall forhåndsviste sider</label>
                                    <div className={styles.previewSlider}>
                                        <input
                                            type="range"
                                            min={1}
                                            max={Math.max(1, pdfMetadata?.pages || 5)}
                                            value={previewPages}
                                            onChange={(e) => setPreviewPages(Number(e.target.value))}
                                            disabled={!pdfMetadata}
                                        />
                                        <div className={styles.sliderMeta}>
                                            {pdfMetadata
                                                ? `Viser ${previewPages} av ${pdfMetadata.pages} sider`
                                                : 'Last opp PDF for å velge antall sider'}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Publiser</h2>
                                    <span>Sørg for at alle obligatoriske felter er fylt inn</span>
                                </div>
                                <Button fullWidth size="lg" onClick={handleUpload} disabled={uploading}>
                                    {uploading ? 'Laster opp...' : 'Last opp og publiser'}
                                </Button>
                            </section>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
