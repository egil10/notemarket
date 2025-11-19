'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { FilterTag } from '@/components/ui/FilterTag';
import { createClient } from '@/lib/supabase';
import { getUniversityAbbreviation } from '@/lib/universities';
import styles from './search.module.css';

export default function SearchPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
    const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>([]);
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
            const matchesUniversity = selectedUniversities.length === 0 ||
                selectedUniversities.includes(doc.university);
            const matchesCourseCode = selectedCourseCodes.length === 0 ||
                selectedCourseCodes.includes(doc.course_code);
            return matchesUniversity && matchesCourseCode;
        });
    }, [documents, selectedUniversities, selectedCourseCodes]);

    const toggleUniversity = (uni: string) => {
        setSelectedUniversities(prev =>
            prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]
        );
    };

    const toggleCourseCode = (code: string) => {
        setSelectedCourseCodes(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const clearFilters = () => {
        setSelectedUniversities([]);
        setSelectedCourseCodes([]);
    };

    const hasActiveFilters = selectedUniversities.length > 0 || selectedCourseCodes.length > 0;

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
                            <div className={styles.filterSection}>
                                <label className={styles.filterLabel}>Universitet</label>
                                <div className={styles.tagGrid}>
                                    {universities.map((uni) => (
                                        <FilterTag
                                            key={uni}
                                            label={getUniversityAbbreviation(uni)}
                                            active={selectedUniversities.includes(uni)}
                                            onClick={() => toggleUniversity(uni)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterSection}>
                                <label className={styles.filterLabel}>Fagkode</label>
                                <div className={styles.tagGrid}>
                                    {courseCodes.map((code) => (
                                        <FilterTag
                                            key={code}
                                            label={code}
                                            active={selectedCourseCodes.includes(code)}
                                            onClick={() => toggleCourseCode(code)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterActions}>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className={styles.clearButton}>
                                        Nullstill filtre
                                    </button>
                                )}
                                <div className={styles.resultCount}>
                                    {filteredDocuments.length} dokument{filteredDocuments.length !== 1 ? 'er' : ''}
                                </div>
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
                                    pages={doc.page_count || 0}
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
