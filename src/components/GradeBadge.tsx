import { CheckCircle, Clock } from 'lucide-react';
import styles from './GradeBadge.module.css';

interface GradeBadgeProps {
    grade: string;
    verified: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const GradeBadge = ({ grade, verified, size = 'medium' }: GradeBadgeProps) => {
    const getGradeClass = () => {
        switch (grade?.toUpperCase()) {
            case 'A': return styles.gold;
            case 'B': return styles.silver;
            case 'C': return styles.bronze;
            default: return styles.standard;
        }
    };

    return (
        <div className={`${styles.badge} ${getGradeClass()} ${styles[size]}`}>
            <span className={styles.letter}>{grade?.toUpperCase()}</span>
            {verified ? (
                <CheckCircle className={styles.verified} size={size === 'small' ? 14 : size === 'large' ? 24 : 20} />
            ) : (
                <Clock className={styles.pending} size={size === 'small' ? 14 : size === 'large' ? 24 : 20} />
            )}
        </div>
    );
};
