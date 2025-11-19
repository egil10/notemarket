'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import styles from './page.module.css';

export default function Home() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching documents:', error);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <Header />
      <main>
        <Hero />

        <section className={styles.featuredSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>Populære dokumenter</h2>
              <a href="/search" className={styles.viewAll}>Se alle dokumenter →</a>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Laster dokumenter...
              </div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <p>Ingen dokumenter lastet opp enda.</p>
                <p>Vær den første til å dele!</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    author="Anonym"
                    university={doc.university || 'Ukjent'}
                    courseCode={doc.course_code || 'N/A'}
                    price={doc.price}
                    pages={0}
                    type="Dokument"
                    rating={0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
