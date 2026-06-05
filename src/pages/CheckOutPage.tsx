import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../components/AppButton';
import { Toast } from '../components/Toast';
import { PageShell } from '../layouts/PageShell';
import { DateService } from '../services/dateService';
import { useVisitorStore } from '../store/visitorStore';
import { Visitor } from '../types/visitor';
import styles from './CheckOutPage.module.css';

export function CheckOutPage() {
  const navigate = useNavigate();
  const visitors = useVisitorStore((state) => state.visitors);
  const checkOutVisitor = useVisitorStore((state) => state.checkOutVisitor);
  const [query, setQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [message, setMessage] = useState('');

  const activeVisitors = useMemo(
    () => visitors.filter((visitor) => visitor.activeStatus),
    [visitors],
  );

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return activeVisitors.slice(0, 6);

    return activeVisitors
      .filter((visitor) => visitor.fullName.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [activeVisitors, query]);

  const handleCheckOut = () => {
    if (!selectedVisitor) return;

    checkOutVisitor(selectedVisitor.id);
    setMessage('Visitor successfully checked out.');
    window.setTimeout(() => navigate('/'), 1200);
  };

  return (
    <PageShell eyebrow="Departure Register" title="Check Out">
      <section className={styles.panel}>
        <label className={styles.searchLabel} htmlFor="visitor-search">
          Search Visitor
        </label>
        <div className={styles.searchBox}>
          <Search />
          <input
            autoComplete="off"
            id="visitor-search"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedVisitor(null);
            }}
            placeholder="Search Visitor"
            value={query}
          />
        </div>

        <div className={styles.suggestions}>
          {suggestions.map((visitor) => (
            <button
              className={selectedVisitor?.id === visitor.id ? styles.activeSuggestion : ''}
              key={visitor.id}
              onClick={() => {
                setSelectedVisitor(visitor);
                setQuery(visitor.fullName);
              }}
              type="button"
            >
              <span>{visitor.fullName}</span>
              <small>{visitor.personVisited}</small>
            </button>
          ))}
          {query && suggestions.length === 0 ? (
            <p className={styles.empty}>No active visitors match this search.</p>
          ) : null}
        </div>

        {selectedVisitor ? (
          <article className={styles.selectedCard}>
            <div>
              <span>Name</span>
              <strong>{selectedVisitor.fullName}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{selectedVisitor.role}</strong>
            </div>
            <div>
              <span>Person Being Visited</span>
              <strong>{selectedVisitor.personVisited}</strong>
            </div>
            <div>
              <span>Check In Time</span>
              <strong>{DateService.formatTime(selectedVisitor.checkInDateTime)}</strong>
            </div>
            <div>
              <span>Destination</span>
              <strong>{selectedVisitor.destination}</strong>
            </div>
            <AppButton onClick={handleCheckOut} type="button" variant="green">
              Check Out Visitor
            </AppButton>
          </article>
        ) : null}
      </section>
      <Toast message={message} />
    </PageShell>
  );
}
