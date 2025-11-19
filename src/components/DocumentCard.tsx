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
    semester?: string;
    fileSize?: number; // File size in bytes
    viewMode?: 'grid' | 'list';
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
    viewCount,
    semester,
    fileSize,
    viewMode = 'grid'
}: DocumentCardProps) => {
    const universityAbbr = getUniversityAbbreviation(university);
    const displayCode = universityAbbr !== university
        ? `${universityAbbr}-${courseCode.toUpperCase()}`
        : courseCode.toUpperCase();

    // Format file size from bytes to MB
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return '';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

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
                {viewMode === 'list' ? (
                    <>
                        {/* List view: Grade - University - Course code - Title - Author · Pages · MB | Price Views */}
                        {grade && (
                            <div className={styles.listGradeBadge}>
                                <GradeBadge grade={grade} verified={gradeVerified} size="small" />
                            </div>
                        )}
                        <Badge variant="neutral" className={styles.listBadge}>{universityAbbr}</Badge>
                        <Badge variant="neutral" className={styles.listBadge}>{displayCode}</Badge>
                        <h3 className={styles.title} title={title}>{title}</h3>
                        <span className={styles.author}>{author}</span>
                        <span className={styles.pages}>{pages} sider</span>
                        {fileSize && (
                            <span className={styles.fileSize}>{formatFileSize(fileSize)}</span>
                        )}
                        <div className={styles.footer}>
                            <div className={styles.price}>{price},-</div>
                            <div className={styles.viewCount}>
                                <span className={styles.eye}>👁</span>
                                <span>{viewCount ?? 0}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerLeft}>
                                <Badge variant="neutral">{displayCode}</Badge>
                                {semester && (
                                    <Badge variant="neutral" className={styles.semesterBadge}>
                                        {semester}
                                    </Badge>
                                )}
                            </div>
                            <span className={styles.university}>{universityAbbr}</span>
                        </div>

                        <h3 className={styles.title} title={title}>{title}</h3>

                        <div className={styles.meta}>
                            <span className={styles.author}>av {author}</span>
                            <span className={styles.pages}>{pages} sider</span>
                            {fileSize && (
                                <span className={styles.fileSize}>{formatFileSize(fileSize)}</span>
                            )}
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.price}>{price},-</div>
                            <div className={styles.viewCount}>
                                <span className={styles.eye}>👁</span>
                                <span>{viewCount ?? 0}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );

    const cardClassName = `${styles.card} ${viewMode === 'list' ? styles.listCard : ''} ${previewMode ? styles.previewCard : ''}`;

    if (previewMode) {
        return (
            <div className={cardClassName}>
                {CardInner}
            </div>
        );
    }

    return (
        <Link href={`/document/${id}`} className={cardClassName}>
            {CardInner}
        </Link>
    );
};

