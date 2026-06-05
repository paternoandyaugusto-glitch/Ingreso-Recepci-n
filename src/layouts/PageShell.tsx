import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import northfieldLogo from '../assets/northfield-logo.png';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}

export function PageShell({ children, eyebrow, title }: PageShellProps) {
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link aria-label="Back to home" className={styles.back} to="/">
          <ArrowLeft />
        </Link>
        <div>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h1>{title}</h1>
        </div>
        <img alt="Northfield" className={styles.logo} src={northfieldLogo} />
      </header>
      {children}
    </main>
  );
}
