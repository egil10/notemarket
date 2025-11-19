import React from 'react';
import styles from './FilterTag.module.css';

interface FilterTagProps {
    label: string;
    active?: boolean;
    onClick: () => void;
}

export const FilterTag = ({ label, active = false, onClick }: FilterTagProps) => {
    return (
        <button
            className={`${styles.tag} ${active ? styles.active : ''}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};
