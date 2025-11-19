import React from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import styles from './sell.module.css';

export default function SellPage() {
    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Selg dine dokumenter</h1>
                        <p className={styles.subtitle}>
                            Last opp notater, sammendrag eller eksamensbesvarelser og tjen penger hver gang noen laster dem ned.
                        </p>
                    </div>

                    <div className={styles.uploadCard}>
                        <div className={styles.dropzone}>
                            <div className={styles.icon}>📄</div>
                            <h3>Dra og slipp filen din her</h3>
                            <p>eller</p>
                            <Button variant="secondary">Velg fil fra datamaskin</Button>
                            <p className={styles.hint}>Støtter PDF, DOCX (Maks 50MB)</p>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Tittel på dokumentet</label>
                                <input type="text" placeholder="Eks: Sammendrag av Exphil" className={styles.input} />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Fagkode</label>
                                    <input type="text" placeholder="Eks: EXPHIL03" className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Pris (NOK)</label>
                                    <input type="number" placeholder="100" className={styles.input} />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Beskrivelse</label>
                                <textarea rows={4} placeholder="Beskriv hva dokumentet inneholder..." className={styles.textarea} />
                            </div>

                            <Button fullWidth size="lg">Last opp og publiser</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
