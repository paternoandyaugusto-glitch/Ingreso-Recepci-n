import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  tone?: 'success' | 'error';
}

export function Toast({ message, tone = 'success' }: ToastProps) {
  if (!message) return null;

  return <div className={`${styles.toast} ${styles[tone]}`}>{message}</div>;
}
