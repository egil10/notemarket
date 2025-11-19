'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchableFilter.module.css';

interface SearchableFilterProps {
    items: string[];
    selectedItems: string[];
    onToggle: (item: string) => void;
    getDisplayLabel?: (item: string) => string;
    getSearchableText?: (item: string) => string[];
    placeholder?: string;
    maxResults?: number;
}

export const SearchableFilter = ({
    items,
    selectedItems,
    onToggle,
    getDisplayLabel,
    getSearchableText,
    placeholder = 'Søk...',
    maxResults = 10
}: SearchableFilterProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Enhanced search that matches both abbreviations and full names
    const filteredItems = useMemo(() => {
        // If no search query, show all items alphabetically sorted (will be scrollable)
        if (!searchQuery.trim()) {
            return items
                .map(item => ({
                    item,
                    displayLabel: getDisplayLabel ? getDisplayLabel(item) : item
                }))
                .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel, 'no', { sensitivity: 'base' }))
                .map(item => item.item);
        }
        
        const query = searchQuery.toLowerCase().trim();
        const keywords = query.split(/\s+/);

        // Score and rank items
        const scored = items.map(item => {
            const displayLabel = getDisplayLabel ? getDisplayLabel(item) : item;
            const searchableTexts = getSearchableText 
                ? getSearchableText(item)
                : [displayLabel, item];
            
            const allSearchable = searchableTexts.map(t => t.toLowerCase()).join(' ');
            
            let score = 0;
            
            // Exact match gets highest score
            if (allSearchable.includes(query)) {
                score += 100;
            }
            
            // Starts with query gets high score
            if (displayLabel.toLowerCase().startsWith(query) || item.toLowerCase().startsWith(query)) {
                score += 50;
            }
            
            // Keyword matches
            keywords.forEach(keyword => {
                if (allSearchable.includes(keyword)) {
                    score += 10;
                }
            });

            return { item, displayLabel, score };
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxResults)
          .map(item => item.item);

        return scored;
    }, [items, searchQuery, getDisplayLabel, getSearchableText, maxResults]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
                setSearchQuery('');
            }
        };

        if (showDropdown) {
            // Use both mousedown and click for better responsiveness
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [showDropdown]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
        setSelectedIndex(-1);
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
    };

    const handleInputBlur = () => {
        // Close dropdown when input loses focus (with small delay to allow click events)
        setTimeout(() => {
            setShowDropdown(false);
            setSelectedIndex(-1);
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setShowDropdown(true);
            setSelectedIndex(prev => 
                prev < filteredItems.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
                handleSelectItem(filteredItems[selectedIndex]);
            } else if (filteredItems.length === 1) {
                handleSelectItem(filteredItems[0]);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            setSelectedIndex(-1);
        }
    };

    const handleSelectItem = (item: string) => {
        onToggle(item);
        setSearchQuery('');
        setShowDropdown(false);
        setSelectedIndex(-1);
        // Don't refocus input after selection - let it blur naturally
    };

    const handleRemoveSelected = (item: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(item);
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className={styles.searchInput}
                />
            </div>

            {/* Selected Items as Chips */}
            {selectedItems.length > 0 && (
                <div className={styles.selectedChips}>
                    {selectedItems.map((item) => {
                        const displayLabel = getDisplayLabel ? getDisplayLabel(item) : item;
                        return (
                            <div key={item} className={styles.chip}>
                                <span className={styles.chipLabel}>{displayLabel}</span>
                                <button
                                    type="button"
                                    onClick={(e) => handleRemoveSelected(item, e)}
                                    className={styles.chipRemove}
                                    aria-label={`Fjern ${displayLabel}`}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dropdown Results */}
            {showDropdown && (
                <div className={styles.dropdown}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => {
                            const displayLabel = getDisplayLabel ? getDisplayLabel(item) : item;
                            const isSelected = selectedItems.includes(item);
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    className={`${styles.dropdownItem} ${index === selectedIndex ? styles.dropdownItemActive : ''} ${isSelected ? styles.dropdownItemSelected : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSelectItem(item);
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent input blur before click
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    disabled={isSelected}
                                >
                                    {displayLabel}
                                    {isSelected && <span className={styles.selectedBadge}>Valgt</span>}
                                </button>
                            );
                        })
                    ) : searchQuery.trim() ? (
                        <div className={styles.noResults}>Ingen resultater</div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

