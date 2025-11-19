'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/SuccessModal';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { UNIVERSITIES } from '@/lib/universities';
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

    // Form State
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [university, setUniversity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [pageCount, setPageCount] = useState('');
    const [tags, setTags] = useState('');
    const [grade, setGrade] = useState('');
    const [semester, setSemester] = useState('');
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
                    page_count: pageCount ? parseInt(pageCount) : null,
                    tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                    grade: grade || null,
                    semester: semester || null,
                    grade_proof_url: gradeProofUrl || null,
                    grade_verified: false,
                });

            if (dbError) throw dbError;

            setShowSuccess(true);
            // Reset form
            setFile(null);
            setTitle('');
            setCourseCode('');
            setUniversity('');
            setPrice('');
            setDescription('');
            setPageCount('');
            setTags('');
            setGrade('');
            setSemester('');
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
                                    <label>Universitet</label>
                                    <select
                                        className={styles.input}
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        required
                                    >
                                        <option value="">Velg universitet</option>
                                        {UNIVERSITIES.map((uni) => (
                                            <option key={uni.abbreviation} value={uni.name}>
                                                {uni.name} ({uni.abbreviation})
                                            </option>
                                        ))}
                                    </select>
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
                                <div className={styles.formGroup}>
                                    <label>Antall sider</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={pageCount}
                                        onChange={(e) => setPageCount(e.target.value)}
                                        placeholder="10"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>
                                    Tags (valgfritt)
                                    <span className={styles.hint} title="Legg til tags for å gjøre dokumentet lettere å finne. Skill tags med komma."> ℹ️</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="statistikk, R, programmering"
                                />
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
                                        <span className={styles.hint} title="Velg karakteren du fikk på dokumentet"> ℹ️</span>
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
                                    <label>Semester (valgfritt)</label>
                                    <select
                                        className={styles.input}
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                    >
                                        <option value="">Velg semester</option>
                                        <option value="Høst 2025">Høst 2025</option>
                                        <option value="Vår 2025">Vår 2025</option>
                                        <option value="Høst 2024">Høst 2024</option>
                                        <option value="Vår 2024">Vår 2024</option>
                                        <option value="Høst 2023">Høst 2023</option>
                                        <option value="Vår 2023">Vår 2023</option>
                                    </select>
                                </div>
                            </div>

                            {grade && (
                                <div className={styles.formGroup}>
                                    <label>
                                        Bevis for karakter (URL)
                                        <span className={styles.hint} title="Link til karakterbevis, StudentWeb, eller skjermbilde"> ℹ️</span>
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
