import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, LogOut, Printer, Search, Trash2 } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../components/AppButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { DateService } from '../services/dateService';
import { CsvService } from '../services/csvService';
import { useAuthStore } from '../store/authStore';
import { useVisitorStore } from '../store/visitorStore';
import { SortDirection, Visitor } from '../types/visitor';
import styles from './AdminDashboardPage.module.css';

const COLORS = ['#f47a20', '#4caf50', '#2f80ed', '#7a5af8', '#344054', '#d92d20'];
const PAGE_SIZE = 6;

type CurrentSortKey =
  | 'fullName'
  | 'role'
  | 'dni'
  | 'personVisited'
  | 'destination'
  | 'checkInDateTime';
type HistorySortKey =
  | 'fullName'
  | 'role'
  | 'dni'
  | 'destination'
  | 'checkInDateTime'
  | 'checkOutDateTime';

const compare = (a: string | undefined, b: string | undefined, direction: SortDirection) => {
  const result = (a ?? '').localeCompare(b ?? '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  return direction === 'asc' ? result : -result;
};

const normalize = (value: string) => value.toLowerCase().trim();

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const visitors = useVisitorStore((state) => state.visitors);
  const checkOutVisitor = useVisitorStore((state) => state.checkOutVisitor);
  const deleteVisitor = useVisitorStore((state) => state.deleteVisitor);
  const logout = useAuthStore((state) => state.logout);
  const [currentQuery, setCurrentQuery] = useState('');
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Visitor | null>(null);
  const [currentSort, setCurrentSort] = useState<{ key: CurrentSortKey; direction: SortDirection }>(
    {
      key: 'checkInDateTime',
      direction: 'desc',
    },
  );
  const [historySort, setHistorySort] = useState<{ key: HistorySortKey; direction: SortDirection }>(
    {
      key: 'checkInDateTime',
      direction: 'desc',
    },
  );

  const activeVisitors = useMemo(
    () => visitors.filter((visitor) => visitor.activeStatus),
    [visitors],
  );
  const historicalVisitors = useMemo(
    () => visitors.filter((visitor) => !visitor.activeStatus),
    [visitors],
  );
  const todaysVisitors = useMemo(
    () => visitors.filter((visitor) => DateService.sameLocalDate(visitor.checkInDateTime)),
    [visitors],
  );
  const todaysCheckOuts = useMemo(
    () =>
      visitors.filter(
        (visitor) =>
          visitor.checkOutDateTime && DateService.sameLocalDate(visitor.checkOutDateTime),
      ),
    [visitors],
  );

  const averageDailyVisitors = useMemo(() => {
    if (visitors.length === 0) return 0;
    const uniqueDays = new Set(visitors.map((visitor) => visitor.checkInDateTime.slice(0, 10)));
    return Math.round(visitors.length / Math.max(1, uniqueDays.size));
  }, [visitors]);

  const roleData = useMemo(() => aggregateBy(visitors, 'role'), [visitors]);
  const destinationData = useMemo(() => aggregateBy(visitors, 'destination'), [visitors]);
  const dailyTrafficData = useMemo(() => buildDailyTraffic(visitors), [visitors]);

  const filteredCurrent = useMemo(() => {
    const query = normalize(currentQuery);
    return activeVisitors
      .filter((visitor) => searchableVisitor(visitor).includes(query))
      .sort((a, b) =>
        compare(String(a[currentSort.key]), String(b[currentSort.key]), currentSort.direction),
      );
  }, [activeVisitors, currentQuery, currentSort]);

  const filteredHistory = useMemo(() => {
    const query = normalize(historyQuery);
    return historicalVisitors
      .filter((visitor) => searchableVisitor(visitor).includes(query))
      .filter((visitor) => !historyDate || visitor.checkInDateTime.slice(0, 10) === historyDate)
      .sort((a, b) =>
        compare(
          String(a[historySort.key] ?? ''),
          String(b[historySort.key] ?? ''),
          historySort.direction,
        ),
      );
  }, [historicalVisitors, historyDate, historyQuery, historySort]);

  const currentRows = paginate(filteredCurrent, currentPage);
  const historyRows = paginate(filteredHistory, historyPage);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const exportCsv = () => {
    CsvService.downloadCsv(
      'northfield-visitor-history.csv',
      CsvService.toVisitorHistoryCsv(filteredHistory),
    );
  };

  return (
    <main className={styles.dashboard}>
      <header className={`${styles.header} no-print`}>
        <div>
          <span>Administration</span>
          <h1>Visitor Dashboard</h1>
        </div>
        <div className={styles.headerActions}>
          <AppButton onClick={exportCsv} type="button" variant="neutral">
            <Download size={19} /> Export CSV
          </AppButton>
          <AppButton onClick={() => window.print()} type="button" variant="neutral">
            <Printer size={19} /> Print Report
          </AppButton>
          <AppButton onClick={handleLogout} type="button" variant="orange">
            <LogOut size={19} /> Logout
          </AppButton>
        </div>
      </header>

      <section className={styles.stats}>
        <StatCard label="Visitors Currently Inside" value={activeVisitors.length} />
        <StatCard label="Today's Visitors" value={todaysVisitors.length} />
        <StatCard label="Today's Check Outs" value={todaysCheckOuts.length} />
        <StatCard label="Total Historical Records" value={historicalVisitors.length} />
        <StatCard label="Average Daily Visitors" value={averageDailyVisitors} />
      </section>

      <section className={styles.analytics}>
        <ChartCard title="Current Occupancy">
          <ResponsiveContainer height={240} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={[
                  { name: 'Inside', value: activeVisitors.length },
                  { name: 'Checked Out', value: Math.max(historicalVisitors.length, 1) },
                ]}
                dataKey="value"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={4}
              >
                <Cell fill="#4caf50" />
                <Cell fill="#e4e7ec" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <strong className={styles.centerMetric}>{activeVisitors.length}</strong>
        </ChartCard>
        <ChartCard title="Visitors by Role">
          <ResponsiveContainer height={260} width="100%">
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" outerRadius={92}>
                {roleData.map((entry, index) => (
                  <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Visitors by Destination">
          <ResponsiveContainer height={260} width="100%">
            <BarChart data={destinationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#f47a20" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Daily Traffic">
          <ResponsiveContainer height={260} width="100%">
            <LineChart data={dailyTrafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line dataKey="visitors" dot={false} stroke="#2f80ed" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className={styles.tablePanel}>
        <TableHeader
          onChange={(value) => {
            setCurrentQuery(value);
            setCurrentPage(1);
          }}
          placeholder="Search current visitors"
          title="Current Visitors"
          value={currentQuery}
        />
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <SortableHeader
                  label="Name"
                  onSort={() => toggleSort(currentSort, setCurrentSort, 'fullName')}
                />
                <SortableHeader
                  label="Role"
                  onSort={() => toggleSort(currentSort, setCurrentSort, 'role')}
                />
                <SortableHeader
                  label="DNI"
                  onSort={() => toggleSort(currentSort, setCurrentSort, 'dni')}
                />
                <SortableHeader
                  label="Person Visited"
                  onSort={() => toggleSort(currentSort, setCurrentSort, 'personVisited')}
                />
                <SortableHeader
                  label="Destination"
                  onSort={() => toggleSort(currentSort, setCurrentSort, 'destination')}
                />
                <SortableHeader
                  label="Check In Time"
                  onSort={() => toggleSort(currentSort, setCurrentSort, 'checkInDateTime')}
                />
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((visitor) => (
                <tr key={visitor.id}>
                  <td>{visitor.fullName}</td>
                  <td>{visitor.role}</td>
                  <td>{visitor.dni}</td>
                  <td>{visitor.personVisited}</td>
                  <td>{visitor.destination}</td>
                  <td>{DateService.formatTime(visitor.checkInDateTime)}</td>
                  <td className="no-print">
                    <button
                      className={styles.textAction}
                      onClick={() => checkOutVisitor(visitor.id)}
                      type="button"
                    >
                      Manual Check-Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={filteredCurrent.length} page={currentPage} setPage={setCurrentPage} />
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.historyControls}>
          <TableHeader
            onChange={(value) => {
              setHistoryQuery(value);
              setHistoryPage(1);
            }}
            placeholder="Search historical visitors"
            title="Historical Visitors"
            value={historyQuery}
          />
          <input
            className={styles.dateFilter}
            onChange={(event) => {
              setHistoryDate(event.target.value);
              setHistoryPage(1);
            }}
            type="date"
            value={historyDate}
          />
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <SortableHeader
                  label="Name"
                  onSort={() => toggleSort(historySort, setHistorySort, 'fullName')}
                />
                <SortableHeader
                  label="Role"
                  onSort={() => toggleSort(historySort, setHistorySort, 'role')}
                />
                <SortableHeader
                  label="DNI"
                  onSort={() => toggleSort(historySort, setHistorySort, 'dni')}
                />
                <SortableHeader
                  label="Destination"
                  onSort={() => toggleSort(historySort, setHistorySort, 'destination')}
                />
                <SortableHeader
                  label="Check In"
                  onSort={() => toggleSort(historySort, setHistorySort, 'checkInDateTime')}
                />
                <SortableHeader
                  label="Check Out"
                  onSort={() => toggleSort(historySort, setHistorySort, 'checkOutDateTime')}
                />
                <th>Duration</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((visitor) => (
                <tr key={visitor.id}>
                  <td>{visitor.fullName}</td>
                  <td>{visitor.role}</td>
                  <td>{visitor.dni}</td>
                  <td>{visitor.destination}</td>
                  <td>{DateService.formatDateTime(visitor.checkInDateTime)}</td>
                  <td>{DateService.formatDateTime(visitor.checkOutDateTime)}</td>
                  <td>
                    {DateService.formatDuration(visitor.checkInDateTime, visitor.checkOutDateTime)}
                  </td>
                  <td className="no-print">
                    <button
                      aria-label={`Delete ${visitor.fullName}`}
                      className={styles.iconAction}
                      onClick={() => setDeleteTarget(visitor)}
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={filteredHistory.length} page={historyPage} setPage={setHistoryPage} />
      </section>

      {deleteTarget ? (
        <ConfirmModal
          body={`Delete the visitor record for ${deleteTarget.fullName}? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteVisitor(deleteTarget.id);
            setDeleteTarget(null);
          }}
          title="Delete Record"
        />
      ) : null}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className={styles.statCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ChartCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <article className={styles.chartCard}>
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function TableHeader({
  onChange,
  placeholder,
  title,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  title: string;
  value: string;
}) {
  return (
    <div className={styles.tableHeader}>
      <h2>{title}</h2>
      <label className={`${styles.adminSearch} no-print`}>
        <Search size={18} />
        <input
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>
    </div>
  );
}

function SortableHeader({ label, onSort }: { label: string; onSort: () => void }) {
  return (
    <th>
      <button className={styles.sortButton} onClick={onSort} type="button">
        {label}
      </button>
    </th>
  );
}

function Pagination({
  count,
  page,
  setPage,
}: {
  count: number;
  page: number;
  setPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className={`${styles.pagination} no-print`}>
      <button disabled={page === 1} onClick={() => setPage(page - 1)} type="button">
        Previous
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button disabled={page === pages} onClick={() => setPage(page + 1)} type="button">
        Next
      </button>
    </div>
  );
}

function toggleSort<T extends string>(
  current: { key: T; direction: SortDirection },
  setter: (next: { key: T; direction: SortDirection }) => void,
  key: T,
) {
  setter({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  });
}

function aggregateBy<T extends keyof Visitor>(visitors: Visitor[], key: T) {
  const map = visitors.reduce<Record<string, number>>((acc, visitor) => {
    const name = String(visitor[key] || 'Other');
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildDailyTraffic(visitors: Visitor[]) {
  const today = DateService.startOfLocalDay(new Date());
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      day: new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' }).format(date),
      visitors: 0,
    };
  });

  const byKey = new Map(days.map((day) => [day.key, day]));
  visitors.forEach((visitor) => {
    const key = visitor.checkInDateTime.slice(0, 10);
    const day = byKey.get(key);
    if (day) day.visitors += 1;
  });

  return days;
}

function searchableVisitor(visitor: Visitor) {
  return normalize(
    [
      visitor.fullName,
      visitor.role,
      visitor.dni,
      visitor.personVisited,
      visitor.destination,
      visitor.notes ?? '',
    ].join(' '),
  );
}

function paginate<T>(items: T[], page: number): T[] {
  return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}
