import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { MoodButtons } from './MoodButtons';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Top Section: Main Links */}
                <div className={styles.topSection}>
                    <div className={styles.brandColumn}>
                        <Link href="/" className={styles.brand}>
                            <Image
                                src="/logos/logo-nm-svg.drawio.svg"
                                alt="NoteMarket logo"
                                width={110}
                                height={32}
                                className={styles.brandMark}
                            />
                            <span className={styles.brandText}>NoteMarket</span>
                        </Link>
                    </div>

                    <div className={styles.linksGrid}>
                        <div className={styles.linkColumn}>
                            <h3 className={styles.columnHeading}>Produkt</h3>
                            <nav className={styles.linkList}>
                                <Link href="/statistikk" className={styles.link}>
                                    Statistikk
                                </Link>
                            </nav>
                        </div>

                        <div className={styles.linkColumn}>
                            <h3 className={styles.columnHeading}>Selskap</h3>
                            <nav className={styles.linkList}>
                                <Link href="/om-oss" className={styles.link}>
                                    Om oss
                                </Link>
                                <a href="mailto:notemarket.no@gmail.com" className={styles.link}>
                                    notemarket.no@gmail.com
                                </a>
                            </nav>
                        </div>

                        <div className={styles.linkColumn}>
                            <h3 className={styles.columnHeading}>Juridisk</h3>
                            <nav className={styles.linkList}>
                                <Link href="/vilkar" className={styles.link}>
                                    Vilkår
                                </Link>
                                <Link href="/personvern" className={styles.link}>
                                    Personvern
                                </Link>
                            </nav>
                        </div>

                        <div className={styles.linkColumn}>
                            <h3 className={styles.columnHeading}>Følg oss</h3>
                            <nav className={styles.linkList}>
                                <a 
                                    href="https://github.com/egil10/notemarket" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.link}
                                >
                                    <Github size={18} />
                                    <span>GitHub</span>
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className={styles.divider}></div>

                {/* Bottom Section: Tagline, Copyright, Mood & Theme Toggle */}
                <div className={styles.bottomSection}>
                    <div className={styles.tagline}>
                        Norges største markedsplass for studiemateriale
                    </div>
                    <div className={styles.copyright}>
                        © {new Date().getFullYear()} NoteMarket. Alle rettigheter reservert.
                    </div>
                    <div className={styles.footerActions}>
                        <MoodButtons />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </footer>
    );
};
