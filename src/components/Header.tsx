import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from './UserMenu';
import styles from './Header.module.css';

export const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/logos/logo-nm-32-32.drawio.png"
                        alt="NoteMarket logo"
                        width={32}
                        height={32}
                        priority
                        className={styles.logoMark}
                    />
                    <span>NoteMarket</span>
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
