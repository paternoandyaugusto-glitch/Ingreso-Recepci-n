import { ReactNode } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  children: ReactNode;
  error?: string;
  label: string;
}

export function FormField({ children, error, label }: FormFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
