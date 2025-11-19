import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brandRow}>
                    <Link href="/" className={styles.brand}>
                        <Image
                            src="/logos/logo-nm-svg.drawio.svg"
                            alt="NoteMarket logo"
                            width={110}
                            height={32}
                            className={styles.brandMark}
                        />
                        <span>NoteMarket</span>
                    </Link>
                    <p className={styles.tagline}>Norges største markedsplass for studiemateriale</p>
                </div>

                <div className={styles.links}>
                    <ThemeToggle />
                    <Link href="/statistikk" className={styles.link}>
                        Statistikk
                    </Link>
                    <span className={styles.text}>Om oss</span>
                    <span className={styles.text}>notemarket@gmail.com</span>
                    <span className={styles.text}>Vilkår</span>
                    <span className={styles.text}>Personvern</span>
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
