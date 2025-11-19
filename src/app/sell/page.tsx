'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/SuccessModal';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
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
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }

    async function handleUpload() {
        if (!file || !user) return;

        // Validate grade proof if grade is selected
        if (grade && !gradeProofUrl) {
            showToast('Vennligst legg ved bevis for karakter (URL til karakterbevis)', 'error');
            return;
        }

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
        } catch (error: any) {
            showToast('Error uploading: ' + error.message, 'error');
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
                            <div className={styles.icon}>
                                <FileText size={48} strokeWidth={1.5} />
                            </div>
                            {file ? (
                                <div className={styles.fileInfo}>
                                    <h3>{file.name}</h3>
                                    {pdfMetadata && (
                                        <p className={styles.metadata}>
                                            {pdfMetadata.pages} sider • {pdfMetadata.sizeMB} MB
                                        </p>
                                    )}
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className={styles.removeButton}
                                    >
                                        <X size={16} />
                                        Fjern fil
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <h3>Dra og slipp filen din her</h3>
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

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>
                                        Karakter (valgfritt)
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
                                    <label>År (valgfritt)</label>
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
                                    <label>Semester (valgfritt)</label>
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
                                        Lenke til Vitnemålsportalen eller tilsvarende (URL)
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
                                        required={!!grade}
                                    />
                                    <p className={styles.gradeNote}>
                                        Karakteren vil vises som "Venter på verifisering" til en admin har godkjent den.
                                    </p>
                                </div>
                            )}

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
