import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import styles from './request.module.css';

export default function RequestPage() {
    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>Etterspør dokumenter</h1>
                        <p className={styles.subtitle}>
                            Denne funksjonen kommer snart! Her vil du kunne etterspørre dokumenter fra andre studenter.
                        </p>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <span className={styles.icon}>🔍</span>
                                <h3>Søk etter spesifikke dokumenter</h3>
                                <p>Be om notater fra spesifikke fag eller emner</p>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.icon}>💬</span>
                                <h3>Kommuniser med selgere</h3>
                                <p>Chat direkte med studenter som kan hjelpe</p>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.icon}>⭐</span>
                                <h3>Sett pris og prioritet</h3>
                                <p>Bestem hvor mye du vil betale for dokumentet</p>
                            </div>
                        </div>
                        <Link href="/search">
                            <Button size="lg">Bla gjennom eksisterende dokumenter</Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
