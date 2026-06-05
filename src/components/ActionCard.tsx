import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './ActionCard.module.css';

interface ActionCardProps {
  icon: ReactNode;
  label: string;
  to: string;
  tone: 'orange' | 'green';
}

export function ActionCard({ icon, label, to, tone }: ActionCardProps) {
  return (
    <Link className={`${styles.card} ${styles[tone]}`} to={to}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
