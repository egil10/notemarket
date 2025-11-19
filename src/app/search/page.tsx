'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import { getUniversityAbbreviation } from '@/lib/universities';
import styles from './search.module.css';

export default function SearchPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUniversity, setSelectedUniversity] = useState<string>('');
    const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
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

    // Get unique universities and course codes from documents
    const { universities, courseCodes } = useMemo(() => {
        const uniqueUniversities = Array.from(
            new Set(documents.map(doc => doc.university).filter(Boolean))
        ).sort();

        const uniqueCourseCodes = Array.from(
            new Set(documents.map(doc => doc.course_code).filter(Boolean))
        ).sort();

        return {
            universities: uniqueUniversities,
            courseCodes: uniqueCourseCodes
        };
    }, [documents]);

    // Filter documents based on selected filters
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesUniversity = !selectedUniversity || doc.university === selectedUniversity;
            const matchesCourseCode = !selectedCourseCode || doc.course_code === selectedCourseCode;
            return matchesUniversity && matchesCourseCode;
        });
    }, [documents, selectedUniversity, selectedCourseCode]);

    const clearFilters = () => {
        setSelectedUniversity('');
        setSelectedCourseCode('');
    };

    const hasActiveFilters = selectedUniversity || selectedCourseCode;

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

                    {/* Filters */}
                    {!loading && documents.length > 0 && (
                        <div className={styles.filters}>
                            <div className={styles.filterGroup}>
                                <label>Universitet</label>
                                <select
                                    value={selectedUniversity}
                                    onChange={(e) => setSelectedUniversity(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="">Alle universiteter</option>
                                    {universities.map((uni) => (
                                        <option key={uni} value={uni}>
                                            {getUniversityAbbreviation(uni)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Fagkode</label>
                                <select
                                    value={selectedCourseCode}
                                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="">Alle fagkoder</option>
                                    {courseCodes.map((code) => (
                                        <option key={code} value={code}>
                                            {code}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <button onClick={clearFilters} className={styles.clearButton}>
                                    Nullstill filtre
                                </button>
                            )}

                            <div className={styles.resultCount}>
                                {filteredDocuments.length} dokument{filteredDocuments.length !== 1 ? 'er' : ''}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className={styles.loading}>Laster dokumenter...</div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className={styles.empty}>
                            {hasActiveFilters ? (
                                <>
                                    <p>Ingen dokumenter funnet med valgte filtre.</p>
                                    <button onClick={clearFilters} className={styles.clearButtonLarge}>
                                        Nullstill filtre
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>Ingen dokumenter funnet enda.</p>
                                    <p>Vær den første til å laste opp!</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filteredDocuments.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    id={doc.id}
                                    title={doc.title}
                                    author="Anonym"
                                    university={doc.university || 'Ukjent'}
                                    courseCode={doc.course_code || 'N/A'}
                                    price={doc.price}
                                    pages={0}
                                    type="Dokument"
                                    rating={0}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
