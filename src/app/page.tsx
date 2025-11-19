import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { DocumentCard } from '@/components/DocumentCard';
import styles from './page.module.css';

// Sample data based on user request
const SAMPLE_DOCS = [
  {
    id: '1',
    title: 'SOL3 kompendium med A-besvarelse fra H24',
    author: 'nnh2025',
    university: 'NHH',
    courseCode: 'SOL3',
    price: 199,
    pages: 76,
    type: 'Sammendrag',
    rating: 5.0
  },
  {
    id: '2',
    title: 'SAM1A – Kompendium, undersøkelser + A-besvarelse',
    author: 'KompendieKongen',
    university: 'NHH',
    courseCode: 'SAM1A',
    price: 100,
    pages: 72,
    type: 'Sammendrag',
    rating: 4.8
  },
  {
    id: '3',
    title: 'A-besvarelse Obligasjonsrett kont 2025',
    author: 'Tryllemann',
    university: 'UiB',
    courseCode: 'JUS231',
    price: 49,
    pages: 12,
    type: 'Eksamensbesvarelse',
    rating: 4.5
  },
  {
    id: '4',
    title: 'Corporate Finance final exam 2024 GRA 6514',
    author: 'BI legenden',
    university: 'BI',
    courseCode: 'GRA 6514',
    price: 99,
    pages: 5,
    type: 'Eksamensbesvarelse',
    rating: 4.2
  }
];

export default function Home() {
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

            <div className={styles.grid}>
              {SAMPLE_DOCS.map((doc) => (
                <DocumentCard key={doc.id} {...doc} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
