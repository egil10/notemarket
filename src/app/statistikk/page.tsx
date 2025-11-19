'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { createClient } from '@/lib/supabase';
import styles from './statistikk.module.css';

type DocumentRecord = {
  id: string;
  title: string;
  course_code: string | null;
  university: string | null;
  price: number;
  created_at: string;
};

type TopItem = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  trend: string;
};

export default function StatistikkPage() {
  const supabase = createClient();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('id,title,course_code,university,price,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Feil ved henting av statistikk:', error);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  }

  const {
    totalDocuments,
    thisMonthDocuments,
    uniqueCourses,
    uniqueUniversities,
    averagePrice,
    topCoursesAllTime,
    topCoursesCurrentMonth,
    topUniversities,
    mockViews,
    mockPurchases,
  } = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const docsThisMonth = documents.filter((doc) => {
      const created = new Date(doc.created_at);
      return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    });

    const courseCount = new Map<string, number>();
    const courseCountCurrent = new Map<string, number>();
    const universityCount = new Map<string, number>();

    documents.forEach((doc) => {
      const course = doc.course_code?.toUpperCase() || 'Ukjent';
      courseCount.set(course, (courseCount.get(course) || 0) + 1);

      const created = new Date(doc.created_at);
      if (created.getMonth() === thisMonth && created.getFullYear() === thisYear) {
        courseCountCurrent.set(course, (courseCountCurrent.get(course) || 0) + 1);
      }

      const university = doc.university || 'Ukjent';
      universityCount.set(university, (universityCount.get(university) || 0) + 1);
    });

    const sortMap = (map: Map<string, number>) =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]) => ({ label, value }));

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('nb-NO', {
        style: 'currency',
        currency: 'NOK',
        maximumFractionDigits: 0,
      }).format(value);

    const baseMockItems = documents.slice(0, 5);
    const mockViews: TopItem[] = baseMockItems.map((doc, index) => ({
      id: doc.id,
      title: doc.title,
      subtitle: doc.course_code?.toUpperCase() || 'Ukjent fagkode',
      value: `${280 - index * 37} visninger`,
      trend: index % 2 === 0 ? '+12% denne måneden' : '+5% denne måneden',
    }));

    const mockPurchases: TopItem[] = baseMockItems.map((doc, index) => ({
      id: doc.id,
      title: doc.title,
      subtitle: doc.university || 'Ukjent universitet',
      value: `${45 - index * 6} kjøp`,
      trend: index % 2 === 0 ? 'Beta – måles snart' : 'Kommer snart',
    }));

    const totalPrice = documents.reduce((sum, doc) => sum + (doc.price || 0), 0);

    return {
      totalDocuments: documents.length,
      thisMonthDocuments: docsThisMonth.length,
      uniqueCourses: courseCount.size,
      uniqueUniversities: universityCount.size,
      averagePrice: documents.length ? formatCurrency(totalPrice / documents.length) : 'N/A',
      topCoursesAllTime: sortMap(courseCount),
      topCoursesCurrentMonth: sortMap(courseCountCurrent),
      topUniversities: sortMap(universityCount),
      mockViews,
      mockPurchases,
    };
  }, [documents]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>Sanntidsinnsikt*</p>
              <h1>Statistikk for NoteMarket</h1>
              <p>
                Følg med på aktiviteten i markedsplassen. Denne MVP-en viser grunnleggende tall,
                mens avanserte analyser (kjøp, visninger) lanseres fortløpende.
              </p>
            </div>
            <div className={styles.heroNote}>
              <span className={styles.noteLabel}>Merk</span>
              <p>
                *Noen paneler bruker simulert data i påvente av implementert sporing for visninger og kjøp.
              </p>
            </div>
          </section>

          <section className={styles.kpiGrid}>
            <article className={styles.kpiCard}>
              <p className={styles.kpiLabel}>Dokumenter totalt</p>
              <p className={styles.kpiValue}>{totalDocuments}</p>
              <span className={styles.kpiPill}>Alle tider</span>
            </article>
            <article className={styles.kpiCard}>
              <p className={styles.kpiLabel}>Nye denne måneden</p>
              <p className={styles.kpiValue}>{thisMonthDocuments}</p>
              <span className={`${styles.kpiPill} ${styles.pillAccent}`}>Denne måneden</span>
            </article>
            <article className={styles.kpiCard}>
              <p className={styles.kpiLabel}>Unike fag</p>
              <p className={styles.kpiValue}>{uniqueCourses}</p>
              <span className={styles.kpiPill}>Alle tider</span>
            </article>
            <article className={styles.kpiCard}>
              <p className={styles.kpiLabel}>Snittpris</p>
              <p className={styles.kpiValue}>{averagePrice}</p>
              <span className={styles.kpiPill}>Oppdatert nå</span>
            </article>
          </section>

          <section className={styles.grid}>
            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Denne måneden</p>
                  <h2>Mest populære fag</h2>
                </div>
              </header>
              {loading ? (
                <div className={styles.placeholder}>Laster...</div>
              ) : topCoursesCurrentMonth.length === 0 ? (
                <div className={styles.placeholder}>Ingen data denne måneden ennå.</div>
              ) : (
                <ul className={styles.list}>
                  {topCoursesCurrentMonth.map((item, index) => (
                    <li key={item.label} className={styles.listRow}>
                      <div className={styles.rank}>{index + 1}</div>
                      <div>
                        <p className={styles.listTitle}>{item.label}</p>
                        <p className={styles.listSub}>{item.value} nye dokumenter</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Alle tider</p>
                  <h2>Største universiteter</h2>
                </div>
              </header>
              {loading ? (
                <div className={styles.placeholder}>Laster...</div>
              ) : topUniversities.length === 0 ? (
                <div className={styles.placeholder}>Ingen universitetsdata tilgjengelig.</div>
              ) : (
                <ul className={styles.list}>
                  {topUniversities.map((item, index) => (
                    <li key={item.label} className={styles.listRow}>
                      <div className={styles.rank}>{index + 1}</div>
                      <div>
                        <p className={styles.listTitle}>{item.label}</p>
                        <p className={styles.listSub}>{item.value} dokumenter</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className={`${styles.panel} ${styles.panelWide}`}>
              <header className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Simulert data</p>
                  <h2>Mest viste dokumenter</h2>
                </div>
                <span className={styles.badge}>Preview</span>
              </header>
              {mockViews.length === 0 ? (
                <div className={styles.placeholder}>Ingen dokumenter å vise.</div>
              ) : (
                <ul className={`${styles.list} ${styles.listGrid}`}>
                  {mockViews.map((item) => (
                    <li key={item.id} className={styles.metricCard}>
                      <p className={styles.metricLabel}>{item.subtitle}</p>
                      <p className={styles.metricValue}>{item.value}</p>
                      <p className={styles.metricTrend}>{item.trend}</p>
                      <p className={styles.metricTitle}>{item.title}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Alle tider</p>
                  <h2>Toppfag totalt</h2>
                </div>
              </header>
              {loading ? (
                <div className={styles.placeholder}>Laster...</div>
              ) : topCoursesAllTime.length === 0 ? (
                <div className={styles.placeholder}>Ingen dokumenter registrert.</div>
              ) : (
                <ul className={styles.list}>
                  {topCoursesAllTime.map((item, index) => (
                    <li key={item.label} className={styles.listRow}>
                      <div className={styles.rank}>{index + 1}</div>
                      <div>
                        <p className={styles.listTitle}>{item.label}</p>
                        <p className={styles.listSub}>{item.value} dokumenter</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Simulert data</p>
                  <h2>Mest kjøpte (kommer)</h2>
                </div>
                <span className={styles.badge}>Beta</span>
              </header>
              {mockPurchases.length === 0 ? (
                <div className={styles.placeholder}>Ingen dokumenter å vise.</div>
              ) : (
                <ul className={styles.list}>
                  {mockPurchases.map((item) => (
                    <li key={item.id} className={styles.listRow}>
                      <div>
                        <p className={styles.listTitle}>{item.title}</p>
                        <p className={styles.listSub}>{item.subtitle}</p>
                      </div>
                      <div className={styles.listBadge}>
                        <span>{item.value}</span>
                        <small>{item.trend}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}

