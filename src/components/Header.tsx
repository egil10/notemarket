import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import styles from './Header.module.css';

export const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    NoteMarket
                </Link>

                <nav className={styles.nav}>
                    <Link href="/search" className={styles.link}>Kjøp dokumenter</Link>
                    <Link href="/sell" className={styles.link}>Selg dokumenter</Link>
                    <Link href="/request" className={styles.link}>Etterspør</Link>
                </nav>

                <div className={styles.actions}>
                    <Button variant="ghost" size="sm">Søk</Button>
                    <Button variant="ghost" size="sm">Logg inn</Button>
                    <Button variant="primary" size="sm">Bli medlem</Button>
                </div>
            </div>
        </header>
    );
};
