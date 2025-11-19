'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { DocumentCard } from '@/components/DocumentCard';
import { createClient } from '@/lib/supabase';
import styles from './page.module.css';

export default function Home() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [topViewed, setTopViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
    fetchTopViewed();
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
      const documentsWithAuthors = await enrichDocumentsWithAuthors(data || []);
      setDocuments(documentsWithAuthors);
    }
    setLoading(false);
  }

  async function fetchTopViewed() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching top viewed documents:', error);
    } else {
      const documentsWithAuthors = await enrichDocumentsWithAuthors(data || []);
      setTopViewed(documentsWithAuthors);
    }
  }

  async function enrichDocumentsWithAuthors(docs: any[]) {
    if (docs.length === 0) return docs;
    
    const userIds = [...new Set(docs.map(doc => doc.user_id).filter(Boolean))];
    if (userIds.length === 0) return docs;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    const usernameMap = new Map(
      (profiles || []).map(profile => [profile.id, profile.username])
    );

    return docs.map(doc => ({
      ...doc,
      author: usernameMap.get(doc.user_id) || 'Anonym'
    }));
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
                    author={doc.author || 'Anonym'}
                    university={doc.university || 'Ukjent'}
                    courseCode={doc.course_code || 'N/A'}
                    price={doc.price}
                    pages={doc.page_count || 0}
                    type="Dokument"
                    rating={0}
                    grade={doc.grade}
                    gradeVerified={doc.grade_verified}
                    viewCount={doc.view_count}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {topViewed.length > 0 && (
          <section className={styles.featuredSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2>Mest populære akkurat nå</h2>
                <p className={styles.sectionSub}>Basert på visninger</p>
              </div>
              <div className={styles.grid}>
                {topViewed.map((doc) => (
                  <DocumentCard
                    key={`top-${doc.id}`}
                    id={doc.id}
                    title={doc.title}
                    author={doc.author || 'Anonym'}
                    university={doc.university || 'Ukjent'}
                    courseCode={doc.course_code || 'N/A'}
                    price={doc.price}
                    pages={doc.page_count || 0}
                    type="Dokument"
                    rating={0}
                    grade={doc.grade}
                    gradeVerified={doc.grade_verified}
                    viewCount={doc.view_count}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
