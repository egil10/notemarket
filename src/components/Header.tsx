import React from 'react';
import Link from 'next/link';
import { UserMenu } from './UserMenu';
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
                </nav>

                <div className={styles.actions}>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
};
