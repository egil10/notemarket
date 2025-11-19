'use client';

import { useState, useMemo } from 'react';
import { FilterTag } from './FilterTag';
import { Search } from 'lucide-react';
import styles from './SearchableFilter.module.css';

interface SearchableFilterProps {
    items: string[];
    selectedItems: string[];
    onToggle: (item: string) => void;
    getDisplayLabel?: (item: string) => string;
    placeholder?: string;
}

export const SearchableFilter = ({
    items,
    selectedItems,
    onToggle,
    getDisplayLabel,
    placeholder = 'Søk...'
}: SearchableFilterProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(item => {
            const label = getDisplayLabel ? getDisplayLabel(item) : item;
            return label.toLowerCase().includes(query);
        });
    }, [items, searchQuery, getDisplayLabel]);

    return (
        <div className={styles.container}>
            <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.tagGrid}>
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <FilterTag
                            key={item}
                            label={getDisplayLabel ? getDisplayLabel(item) : item}
                            active={selectedItems.includes(item)}
                            onClick={() => onToggle(item)}
                        />
                    ))
                ) : (
                    <p className={styles.noResults}>Ingen resultater</p>
                )}
            </div>
        </div>
    );
};

