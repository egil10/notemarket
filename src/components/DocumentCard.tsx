import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/Badge';
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
    previewImage = '/placeholder-doc.png'
}: DocumentCardProps) => {
    const universityAbbr = getUniversityAbbreviation(university);
    const displayCode = universityAbbr !== university
        ? `${universityAbbr}-${courseCode.toUpperCase()}`
        : courseCode.toUpperCase();

    return (
        <Link href={`/document/${id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                {/* In a real app, use next/image with actual src */}
                <div className={styles.placeholderImage}>
                    <span className={styles.docType}>{type}</span>
                </div>
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
                    {rating && (
                        <div className={styles.rating}>
                            ★ {rating}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};
