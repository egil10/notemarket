import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topRow}>
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
                    <div className={styles.linkGrid}>
                        <Link href="/statistikk" className={styles.link}>
                            Statistikk
                        </Link>
                        <span className={styles.text}>Om oss</span>
                        <a href="mailto:notemarket.no@gmail.com" className={styles.link}>
                            notemarket.no@gmail.com
                        </a>
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
                </div>
                <div className={styles.bottomRow}>
                    <div className={styles.tagline}>Norges største markedsplass for studiemateriale</div>
                    <div className={styles.copyright}>
                        © {new Date().getFullYear()} NoteMarket. Alle rettigheter reservert.
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </footer>
    );
};
