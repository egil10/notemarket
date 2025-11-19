import React from 'react';
import { Button } from './ui/Button';
import Link from 'next/link';
import styles from './Hero.module.css';

export const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Mangfoldig utvalg av <br />
                    <span className={styles.highlight}>studiemateriale</span>
                </h1>
                <p className={styles.subtitle}>
                    Alt er skrevet av og for studenter. Bli en del av Norges største kunnskapsportal.
                </p>

                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Søk etter fagkode (f.eks. JUS101) eller tema..."
                        className={styles.searchInput}
                    />
                    <Button size="lg" className={`${styles.heroButton} ${styles.searchButton}`}>Søk</Button>
                </div>

                <div className={styles.ctaGroup}>
                    <Link href="/search">
                        <Button
                            variant="primary"
                            size="lg"
                            className={`${styles.heroButton} ${styles.ctaButton}`}
                        >
                            Kjøp dokumenter
                        </Button>
                    </Link>
                    <Link href="/sell">
                        <Button
                            variant="secondary"
                            size="lg"
                            className={`${styles.heroButton} ${styles.ctaButton} ${styles.ctaButtonSecondary}`}
                        >
                            Selg dokumenter
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
