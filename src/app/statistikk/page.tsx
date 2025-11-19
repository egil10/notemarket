'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { createClient } from '@/lib/supabase';
import { getUniversityAbbreviation } from '@/lib/universities';
import styles from './statistikk.module.css';

type DocumentRecord = {
  id: string;
  title: string;
  course_code: string | null;
  university: string | null;
  price: number;
  created_at: string;
  view_count: number | null;
};

type LeaderItem = {
  label: string;
  value: number;
  unit: string;
};

export default function StatistikkPage() {
  const supabase = createClient();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('id,title,course_code,university,price,created_at,view_count')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Feil ved henting av statistikk:', error);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  }

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const stats = useMemo(() => {
    const uniqueCoursesSet = new Set<string>();
    let newDocumentsThisMonth = 0;
    const courseCounts = new Map<string, number>();
    const monthUniversityCounts = new Map<string, number>();

    documents.forEach(doc => {
      const course = doc.course_code?.toUpperCase() || 'UKJENT';
      uniqueCoursesSet.add(course);
      courseCounts.set(course, (courseCounts.get(course) || 0) + 1);

      const created = new Date(doc.created_at);
      if (created.getMonth() === thisMonth && created.getFullYear() === thisYear) {
        newDocumentsThisMonth++;
        const uni = doc.university || 'Ukjent';
        monthUniversityCounts.set(uni, (monthUniversityCounts.get(uni) || 0) + 1);
      }
    });

    const toLeaderItems = (entries: [string, number][], unit: string): LeaderItem[] =>
      entries.slice(0, 5).map(([label, value]) => ({ label, value, unit }));

    const averagePrice = documents.length
      ? new Intl.NumberFormat('nb-NO', {
          style: 'currency',
          currency: 'NOK',
          maximumFractionDigits: 0,
        }).format(documents.reduce((sum, doc) => sum + (doc.price || 0), 0) / documents.length)
      : 'N/A';

    const topViewed = documents
      .filter(doc => (doc.view_count || 0) > 0)
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5)
      .map(doc => ({ label: doc.title, value: doc.view_count || 0, unit: 'visninger' }));

    const fallbackDocs = documents.slice(0, 5);
    if (topViewed.length === 0) {
      fallbackDocs.forEach((doc, idx) => {
        topViewed.push({
          label: doc.title,
          value: 280 - idx * 40,
          unit: 'visninger',
        });
      });
    }

    const mockPurchases: LeaderItem[] =
      fallbackDocs.length > 0
        ? fallbackDocs.map((doc, idx) => ({
            label: doc.title,
            value: 45 - idx * 6,
            unit: 'kjøp',
          }))
        : [
            { label: 'Kommer snart', value: 0, unit: 'kjøp' },
          ];

    return {
      totalDocuments: documents.length,
      averagePrice,
      uniqueCourses: uniqueCoursesSet.size,
      newDocumentsThisMonth: newDocumentsThisMonth,
      topCoursesAllTime: toLeaderItems(
        [...courseCounts.entries()].sort((a, b) => b[1] - a[1]),
        'dokumenter'
      ),
      topUniversitiesThisMonth: toLeaderItems(
        [...monthUniversityCounts.entries()].sort((a, b) => b[1] - a[1]),
        'dokumenter'
      ),
      topViewedDocuments: topViewed,
      topBoughtDocuments: mockPurchases,
    };
  }, [documents, thisMonth, thisYear]);

  // Get unique universities and course codes for chart filters
  const { universities, courseCodes } = useMemo(() => {
    const uniqueUniversities = Array.from(
      new Set(documents.map(doc => doc.university).filter(Boolean))
    ).sort();

    const uniqueCourseCodes = Array.from(
      new Set(documents.map(doc => doc.course_code?.toUpperCase()).filter(Boolean))
    ).sort();

    return {
      universities: uniqueUniversities as string[],
      courseCodes: uniqueCourseCodes as string[]
    };
  }, [documents]);

  // Filter course codes by selected university
  const filteredCourseCodes = useMemo(() => {
    if (!selectedUniversity) return courseCodes;
    return courseCodes.filter(code => 
      documents.some(doc => 
        doc.university === selectedUniversity && 
        doc.course_code?.toUpperCase() === code
      )
    );
  }, [selectedUniversity, courseCodes, documents]);

  // Chart data calculation
  const yearsRange = useMemo(() => Array.from({ length: 11 }, (_, idx) => 2015 + idx), []);

  const chartSeries = useMemo(() => {
    if (!selectedUniversity || !selectedCourseCode) return [];

    const yearMap = new Map<number, number>();
    documents.forEach(doc => {
      const docCourse = doc.course_code?.toUpperCase();
      const createdYear = new Date(doc.created_at).getFullYear();
      
      if (
        doc.university === selectedUniversity &&
        docCourse === selectedCourseCode &&
        createdYear >= 2015 &&
        createdYear <= 2025
      ) {
        yearMap.set(createdYear, (yearMap.get(createdYear) || 0) + 1);
      }
    });

    return yearsRange.map(year => ({
      year,
      value: yearMap.get(year) || 0,
    }));
  }, [selectedUniversity, selectedCourseCode, documents, yearsRange]);

  const chartMax = Math.max(...chartSeries.map(item => item.value), 1);

  // Reset course code when university changes
  useEffect(() => {
    if (selectedUniversity && !filteredCourseCodes.includes(selectedCourseCode)) {
      setSelectedCourseCode('');
    }
  }, [selectedUniversity, filteredCourseCodes, selectedCourseCode]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.statsRow}>
            <StatCard title="Dokumenter totalt" value={stats.totalDocuments} badge="Alle tider" />
            <StatCard title="Snittpris" value={stats.averagePrice} badge="Oppdatert nå" />
            <StatCard title="Unike fag" value={stats.uniqueCourses} badge="Alle tider" />
            <StatCard
              title="Nye dokumenter denne måneden"
              value={stats.newDocumentsThisMonth}
              badge="Denne måneden"
              accent
            />
          </section>

          <section className={styles.panelGrid}>
            <LeaderPanel
              title="Mest populære fag"
              subtitle="Alle tider"
              loading={loading}
              items={stats.topCoursesAllTime}
            />
            <LeaderPanel
              title="Største universitet"
              subtitle="Denne måneden"
              loading={loading}
              items={stats.topUniversitiesThisMonth}
            />
            <LeaderPanel
              title="Mest viste dokumenter"
              subtitle="Alle tider"
              loading={loading}
              items={stats.topViewedDocuments}
            />
            <LeaderPanel
              title="Mest kjøpte (kommer)"
              subtitle="Simulert data"
              loading={loading}
              items={stats.topBoughtDocuments}
            />
          </section>

          <section className={`${styles.panel} ${styles.chartPanel}`}>
            <header className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Historikk 2015–2025</p>
                <h2>Dokumenter per år</h2>
              </div>
            </header>
            <div className={styles.chartSelects}>
                <div className={styles.chartSelect}>
                  <label htmlFor="chart-university">Universitet</label>
                  <select
                    id="chart-university"
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                  >
                    <option value="">Velg universitet</option>
                    {universities.map((uni) => (
                      <option key={uni} value={uni}>
                        {getUniversityAbbreviation(uni)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.chartSelect}>
                  <label htmlFor="chart-course">Fagkode</label>
                  <select
                    id="chart-course"
                    value={selectedCourseCode}
                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                    disabled={!selectedUniversity}
                  >
                    <option value="">Velg fagkode</option>
                    {filteredCourseCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            {selectedUniversity && selectedCourseCode && chartSeries.length > 0 ? (
              <div className={styles.barChart}>
                {chartSeries.map(({ year, value }) => (
                  <div key={year} className={styles.barColumn}>
                    <div
                      className={styles.bar}
                      style={{ height: `${(value / chartMax) * 100}%` }}
                    >
                      <span>{value}</span>
                    </div>
                    <p>{year}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.placeholder}>
                {!selectedUniversity 
                  ? 'Velg et universitet og en fagkode for å se historiske opplastinger.'
                  : !selectedCourseCode
                  ? 'Velg en fagkode for å se historiske opplastinger.'
                  : 'Ingen dokumenter funnet for denne kombinasjonen.'}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  badge: string;
  accent?: boolean;
};

const StatCard = ({ title, value, badge, accent }: StatCardProps) => (
  <article className={styles.statCard}>
    <div className={styles.statLabel}>{title}</div>
    <div className={styles.statValue}>{value}</div>
    <span className={`${styles.statBadge} ${accent ? styles.badgeAccent : ''}`}>{badge}</span>
  </article>
);

type LeaderPanelProps = {
  title: string;
  subtitle: string;
  loading: boolean;
  items: LeaderItem[];
};

const LeaderPanel = ({ title, subtitle, loading, items }: LeaderPanelProps) => (
  <article className={styles.panel}>
    <header className={styles.panelHeader}>
      <div>
        <p className={styles.panelEyebrow}>{subtitle}</p>
        <h2>{title}</h2>
      </div>
    </header>
    {loading ? (
      <div className={styles.placeholder}>Laster...</div>
    ) : items.length === 0 ? (
      <div className={styles.placeholder}>Ingen data tilgjengelig.</div>
    ) : (
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={item.label} className={styles.listRow}>
            <div className={styles.valueBadge}>{index + 1}</div>
            <div>
              <p className={styles.listTitle}>{item.label}</p>
              <p className={styles.listSub}>{item.value} {item.unit}</p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </article>
);

