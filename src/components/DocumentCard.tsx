import React from 'react';
import Link from 'next/link';
import { Badge } from './ui/Badge';
import { GradeBadge } from './GradeBadge';
import { getUniversityAbbreviation } from '@/lib/universities';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
    id: string;
    title: string;
    author: string;
    university: string;
    courseCode: string;
    price: number;
    rating?: number;
    pages: number;
    type: string;
    previewImage?: string;
    grade?: string;
    gradeVerified?: boolean;
    previewMode?: boolean;
    viewCount?: number;
}

export const DocumentCard = ({
    id,
    title,
    author,
    university,
    courseCode,
    price,
    rating,
    pages,
    type,
    previewImage = '/placeholder-doc.png',
    grade,
    gradeVerified = false,
    previewMode = false,
    viewCount
}: DocumentCardProps) => {
    const universityAbbr = getUniversityAbbreviation(university);
    const displayCode = universityAbbr !== university
        ? `${universityAbbr}-${courseCode.toUpperCase()}`
        : courseCode.toUpperCase();

    const CardInner = (
        <>
            <div className={styles.imageContainer}>
                <div className={styles.placeholderImage}>
                    <span className={styles.docType}>{type}</span>
                </div>
                {grade && (
                    <div className={styles.gradeBadgeOverlay}>
                        <GradeBadge grade={grade} verified={gradeVerified} size="medium" />
                    </div>
                )}
                <div className={styles.overlay}>
                    <span className={styles.viewBtn}>Se detaljer</span>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <Badge variant="neutral">{displayCode}</Badge>
                    <span className={styles.university}>{universityAbbr}</span>
                </div>

                <h3 className={styles.title} title={title}>{title}</h3>

                <div className={styles.meta}>
                    <span className={styles.author}>av {author}</span>
                    <span className={styles.pages}>{pages} sider</span>
                </div>

                <div className={styles.footer}>
                    <div className={styles.price}>{price},-</div>
                    <div className={styles.viewCount}>
                        <span className={styles.eye}>👁</span>
                        <span>{viewCount ?? 0}</span>
                    </div>
                </div>
            </div>
        </>
    );

    if (previewMode) {
        return (
            <div className={`${styles.card} ${styles.previewCard}`}>
                {CardInner}
            </div>
        );
    }

    return (
        <Link href={`/document/${id}`} className={styles.card}>
            {CardInner}
        </Link>
    );
};

