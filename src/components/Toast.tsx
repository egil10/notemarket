'use client';

import { useEffect } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export const Toast = ({ message, type = 'info', onClose, duration = 3000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    return (
        <div className={`${styles.toast} ${styles[type]}`} onClick={onClose}>
            <span className={styles.icon}>{icons[type]}</span>
            <span className={styles.message}>{message}</span>
        </div>
    );
};
