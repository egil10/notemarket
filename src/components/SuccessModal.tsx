'use client';

import { useEffect } from 'react';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export const SuccessModal = ({
    isOpen,
    onClose,
    title = 'Gratulerer!',
    message = 'Dokumentet ditt er publisert!'
}: SuccessModalProps) => {
    useEffect(() => {
        if (isOpen) {
            // Auto-close after 3 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confetti}>
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className={styles.confettiPiece} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'][Math.floor(Math.random() * 5)]
                        }} />
                    ))}
                </div>

                <div className={styles.icon}>🎉</div>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.checkmark}>
                    <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
                        <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                        <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
