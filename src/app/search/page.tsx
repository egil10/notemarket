'use client';

import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { FilterTag } from '@/components/ui/FilterTag';
import { SearchableFilter } from '@/components/ui/SearchableFilter';
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
    const [pendingUniversities, setPendingUniversities] = useState<string[]>([]);
    const [pendingCourseCodes, setPendingCourseCodes] = useState<string[]>([]);
    const [pendingTags, setPendingTags] = useState<string[]>([]);
    const [applyingFilters, setApplyingFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [minPages, setMinPages] = useState('');
    const [maxPages, setMaxPages] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [year, setYear] = useState('');
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
            new Set(documents.map(doc => doc.course_code?.toUpperCase()).filter(Boolean))
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

    const arraysEqual = (a: string[], b: string[]) =>
        a.length === b.length && a.every(item => b.includes(item));

    const hasPendingChanges =
        !arraysEqual(selectedUniversities, pendingUniversities) ||
        !arraysEqual(selectedCourseCodes, pendingCourseCodes) ||
        !arraysEqual(selectedTags, pendingTags);

    const applyPendingFilters = () => {
        setSelectedUniversities(pendingUniversities);
        setSelectedCourseCodes(pendingCourseCodes);
        setSelectedTags(pendingTags);
        setApplyingFilters(true);
        setTimeout(() => setApplyingFilters(false), 400);
    };

    const clearPendingFilters = () => {
        setPendingUniversities([]);
        setPendingCourseCodes([]);
        setPendingTags([]);
    };

    const clearAllFilters = () => {
        setSelectedUniversities([]);
        setSelectedCourseCodes([]);
        setSelectedTags([]);
        setPendingUniversities([]);
        setPendingCourseCodes([]);
        setPendingTags([]);
        setMinPages('');
        setMaxPages('');
        setMinPrice('');
        setMaxPrice('');
        setYear('');
        setApplyingFilters(true);
        setTimeout(() => setApplyingFilters(false), 300);
    };

    const togglePending = (
        value: string,
        setter: Dispatch<SetStateAction<string[]>>
    ) => {
        setter(prev =>
            prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
    };

    const removeActiveFilter = (type: 'university' | 'course' | 'tag', value: string) => {
        const update = (setter: Dispatch<SetStateAction<string[]>>) =>
            setter(prev => prev.filter(item => item !== value));

        switch (type) {
            case 'university':
                update(setSelectedUniversities);
                update(setPendingUniversities);
                break;
            case 'course':
                update(setSelectedCourseCodes);
                update(setPendingCourseCodes);
                break;
            case 'tag':
                update(setSelectedTags);
                update(setPendingTags);
                break;
        }
        setApplyingFilters(true);
        setTimeout(() => setApplyingFilters(false), 300);
    };

    // Filter and sort documents
    const filteredAndSortedDocuments = useMemo(() => {
        let filtered = documents.filter(doc => {
            const docCourse = doc.course_code?.toUpperCase();
            const matchesUniversity = selectedUniversities.length === 0 ||
                selectedUniversities.includes(doc.university);
            const matchesCourseCode = selectedCourseCodes.length === 0 ||
                (docCourse && selectedCourseCodes.includes(docCourse));
            const matchesTags = selectedTags.length === 0 ||
                (doc.tags && selectedTags.some(tag => doc.tags.includes(tag)));
            
            // Page count filter
            const docPages = doc.page_count || 0;
            const matchesPages = (!minPages || docPages >= parseInt(minPages)) &&
                (!maxPages || docPages <= parseInt(maxPages));
            
            // Price filter
            const docPrice = doc.price || 0;
            const matchesPrice = (!minPrice || docPrice >= parseFloat(minPrice)) &&
                (!maxPrice || docPrice <= parseFloat(maxPrice));
            
            // Year filter
            const matchesYear = !year || new Date(doc.created_at).getFullYear().toString() === year;
            
            return matchesUniversity && matchesCourseCode && matchesTags && 
                   matchesPages && matchesPrice && matchesYear;
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
    }, [documents, selectedUniversities, selectedCourseCodes, selectedTags, sortBy, minPages, maxPages, minPrice, maxPrice, year]);

    const toggleUniversity = (uni: string) => {
        togglePending(uni, setPendingUniversities);
    };

    const toggleCourseCode = (code: string) => {
        togglePending(code.toUpperCase(), setPendingCourseCodes);
    };

    const toggleTag = (tag: string) => {
        togglePending(tag, setPendingTags);
    };

    const hasActiveFilters = selectedUniversities.length > 0 || selectedCourseCodes.length > 0 || selectedTags.length > 0 ||
        minPages || maxPages || minPrice || maxPrice || year;
    const activeFilterCount = selectedUniversities.length + selectedCourseCodes.length + selectedTags.length +
        (minPages ? 1 : 0) + (maxPages ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (year ? 1 : 0);

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

                        <div className={styles.applyBar}>
                            <button
                                className={styles.applyButton}
                                onClick={applyPendingFilters}
                                disabled={!hasPendingChanges}
                            >
                                Oppdater resultater
                            </button>
                            <button
                                className={styles.secondaryButton}
                                onClick={clearAllFilters}
                                disabled={!hasActiveFilters && !hasPendingChanges}
                            >
                                Nullstill filtre
                            </button>
                        </div>

                        {!loading && documents.length > 0 && (
                            <>
                                {/* University Filter */}
                                <div className={styles.filterSection}>
                                    <div className={styles.filterTitle}>
                                        <School size={16} />
                                        <span>Universitet</span>
                                    </div>
                                    <SearchableFilter
                                        items={universities}
                                        selectedItems={pendingUniversities}
                                        onToggle={toggleUniversity}
                                        getDisplayLabel={getUniversityAbbreviation}
                                        placeholder="Søk etter universitet..."
                                    />
                                </div>

                                {/* Course Code Filter */}
                                <div className={styles.filterSection}>
                                    <div className={styles.filterTitle}>
                                        <BookOpen size={16} />
                                        <span>Fagkode</span>
                                    </div>
                                    <SearchableFilter
                                        items={courseCodes}
                                        selectedItems={pendingCourseCodes}
                                        onToggle={toggleCourseCode}
                                        placeholder="Søk etter fagkode..."
                                    />
                                </div>

                                {/* Pages Filter */}
                                <div className={styles.filterSection}>
                                    <div className={styles.filterTitle}>
                                        <span>Antall sider</span>
                                    </div>
                                    <div className={styles.rangeInputs}>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPages}
                                            onChange={(e) => setMinPages(e.target.value)}
                                            className={styles.rangeInput}
                                            min="0"
                                        />
                                        <span className={styles.rangeSeparator}>-</span>
                                        <input
                                            type="number"
                                            placeholder="Maks"
                                            value={maxPages}
                                            onChange={(e) => setMaxPages(e.target.value)}
                                            className={styles.rangeInput}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className={styles.filterSection}>
                                    <div className={styles.filterTitle}>
                                        <span>Pris (NOK)</span>
                                    </div>
                                    <div className={styles.rangeInputs}>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className={styles.rangeInput}
                                            min="0"
                                            step="1"
                                        />
                                        <span className={styles.rangeSeparator}>-</span>
                                        <input
                                            type="number"
                                            placeholder="Maks"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className={styles.rangeInput}
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                </div>

                                {/* Year Filter */}
                                <div className={styles.filterSection}>
                                    <div className={styles.filterTitle}>
                                        <span>År</span>
                                    </div>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className={styles.yearSelect}
                                    >
                                        <option value="">Alle år</option>
                                        {Array.from({ length: 11 }, (_, i) => 2025 - i).map((yr) => (
                                            <option key={yr} value={yr.toString()}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
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
                                                    active={pendingTags.includes(tag)}
                                                    onClick={() => toggleTag(tag)}
                                                />
                                            ))}
                                        </div>
                                    </div>
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
                                    {applyingFilters && <span className={styles.refreshHint}>• Oppdaterer…</span>}
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

                        {hasActiveFilters && (
                            <div className={styles.activeFilters}>
                                <p>Aktive filtre ({activeFilterCount}):</p>
                                <div className={styles.filterChips}>
                                    {selectedUniversities.map((uni) => (
                                        <button
                                            key={`uni-${uni}`}
                                            className={styles.filterChip}
                                            onClick={() => removeActiveFilter('university', uni)}
                                        >
                                            {getUniversityAbbreviation(uni)}
                                            <span>×</span>
                                        </button>
                                    ))}
                                    {selectedCourseCodes.map((code) => (
                                        <button
                                            key={`course-${code}`}
                                            className={styles.filterChip}
                                            onClick={() => removeActiveFilter('course', code)}
                                        >
                                            {code}
                                            <span>×</span>
                                        </button>
                                    ))}
                                    {selectedTags.map((tag) => (
                                        <button
                                            key={`tag-${tag}`}
                                            className={styles.filterChip}
                                            onClick={() => removeActiveFilter('tag', tag)}
                                        >
                                            {tag}
                                            <span>×</span>
                                        </button>
                                    ))}
                                    {minPages && (
                                        <button
                                            className={styles.filterChip}
                                            onClick={() => setMinPages('')}
                                        >
                                            Min {minPages} sider
                                            <span>×</span>
                                        </button>
                                    )}
                                    {maxPages && (
                                        <button
                                            className={styles.filterChip}
                                            onClick={() => setMaxPages('')}
                                        >
                                            Maks {maxPages} sider
                                            <span>×</span>
                                        </button>
                                    )}
                                    {minPrice && (
                                        <button
                                            className={styles.filterChip}
                                            onClick={() => setMinPrice('')}
                                        >
                                            Min {minPrice} kr
                                            <span>×</span>
                                        </button>
                                    )}
                                    {maxPrice && (
                                        <button
                                            className={styles.filterChip}
                                            onClick={() => setMaxPrice('')}
                                        >
                                            Maks {maxPrice} kr
                                            <span>×</span>
                                        </button>
                                    )}
                                    {year && (
                                        <button
                                            className={styles.filterChip}
                                            onClick={() => setYear('')}
                                        >
                                            År {year}
                                            <span>×</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className={styles.loading}>Laster dokumenter...</div>
                        ) : filteredAndSortedDocuments.length === 0 ? (
                            <div className={styles.empty}>
                                {hasActiveFilters ? (
                                    <>
                                        <p>Ingen dokumenter funnet med valgte filtre.</p>
                                        <button onClick={clearAllFilters} className={styles.clearButtonLarge}>
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
                                        grade={doc.grade}
                                        gradeVerified={doc.grade_verified}
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
