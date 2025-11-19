'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { FilterTag } from '@/components/ui/FilterTag';
import { createClient } from '@/lib/supabase';
import { getUniversityAbbreviation } from '@/lib/universities';
import { Grid, List, SlidersHorizontal, Tag, School, BookOpen } from 'lucide-react';
import styles from './search.module.css';

export default function SearchPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
    const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('newest');
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

    // Get unique values for filters
    const { universities, courseCodes, tags } = useMemo(() => {
        const uniqueUniversities = Array.from(
            new Set(documents.map(doc => doc.university).filter(Boolean))
        ).sort();

        const uniqueCourseCodes = Array.from(
            new Set(documents.map(doc => doc.course_code).filter(Boolean))
        ).sort();

        const allTags = documents
            .flatMap(doc => doc.tags || [])
            .filter(Boolean);
        const uniqueTags = Array.from(new Set(allTags)).sort();

        return {
            universities: uniqueUniversities,
            courseCodes: uniqueCourseCodes,
            tags: uniqueTags
        };
    }, [documents]);

    // Filter and sort documents
    const filteredAndSortedDocuments = useMemo(() => {
        let filtered = documents.filter(doc => {
            const matchesUniversity = selectedUniversities.length === 0 ||
                selectedUniversities.includes(doc.university);
            const matchesCourseCode = selectedCourseCodes.length === 0 ||
                selectedCourseCodes.includes(doc.course_code);
            const matchesTags = selectedTags.length === 0 ||
                (doc.tags && selectedTags.some(tag => doc.tags.includes(tag)));
            return matchesUniversity && matchesCourseCode && matchesTags;
        });

        // Sort
        switch (sortBy) {
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return filtered;
    }, [documents, selectedUniversities, selectedCourseCodes, selectedTags, sortBy]);

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

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSelectedUniversities([]);
        setSelectedCourseCodes([]);
        setSelectedTags([]);
    };

    const hasActiveFilters = selectedUniversities.length > 0 || selectedCourseCodes.length > 0 || selectedTags.length > 0;

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Sidebar Filters */}
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <SlidersHorizontal size={20} />
                            <h2>Filtre</h2>
                        </div>

                        {!loading && documents.length > 0 && (
                            <>
                                {/* University Filter */}
                                <div className={styles.filterSection}>
                                    <div className={styles.filterTitle}>
                                        <School size={16} />
                                        <span>Universitet</span>
                                    </div>
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

                                {/* Course Code Filter */}
                                <div className={styles.filterSection}>
                                    <div className={styles.filterTitle}>
                                        <BookOpen size={16} />
                                        <span>Fagkode</span>
                                    </div>
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

                                {/* Tags Filter */}
                                {tags.length > 0 && (
                                    <div className={styles.filterSection}>
                                        <div className={styles.filterTitle}>
                                            <Tag size={16} />
                                            <span>Tags</span>
                                        </div>
                                        <div className={styles.tagGrid}>
                                            {tags.map((tag) => (
                                                <FilterTag
                                                    key={tag}
                                                    label={tag}
                                                    active={selectedTags.includes(tag)}
                                                    onClick={() => toggleTag(tag)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className={styles.clearButton}>
                                        Nullstill filtre
                                    </button>
                                )}
                            </>
                        )}
                    </aside>

                    {/* Main Content */}
                    <div className={styles.content}>
                        <div className={styles.contentHeader}>
                            <div className={styles.headerLeft}>
                                <h1 className={styles.title}>Kjøp dokumenter</h1>
                                <p className={styles.resultCount}>
                                    {filteredAndSortedDocuments.length} dokument{filteredAndSortedDocuments.length !== 1 ? 'er' : ''}
                                </p>
                            </div>

                            <div className={styles.headerRight}>
                                {/* Sort Dropdown */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option value="newest">Nyeste først</option>
                                    <option value="oldest">Eldste først</option>
                                    <option value="price-low">Pris: Lav til høy</option>
                                    <option value="price-high">Pris: Høy til lav</option>
                                </select>

                                {/* View Toggle */}
                                <div className={styles.viewToggle}>
                                    <button
                                        className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        title="Rutenett visning"
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                                        onClick={() => setViewMode('list')}
                                        title="Liste visning"
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>Laster dokumenter...</div>
                        ) : filteredAndSortedDocuments.length === 0 ? (
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
                            <div className={viewMode === 'grid' ? styles.grid : styles.list}>
                                {filteredAndSortedDocuments.map((doc) => (
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
                </div>
            </main>
        </div>
    );
}
