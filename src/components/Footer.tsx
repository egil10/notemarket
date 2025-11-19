import Link from 'next/link';
import { Github } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.links}>
                    <Link href="/about" className={styles.link}>Om oss</Link>
                    <Link href="/contact" className={styles.link}>Kontakt</Link>
                    <Link href="/terms" className={styles.link}>Vilkår</Link>
                    <Link href="/privacy" className={styles.link}>Personvern</Link>
                    <a
                        href="https://github.com/egil10/notemarket"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        <Github size={16} />
                        <span>GitHub</span>
                    </a>
                </div>
                <div className={styles.copyright}>
                    © {new Date().getFullYear()} NoteMarket. Alle rettigheter reservert.
                </div>
            </div>
        </footer>
    );
};
