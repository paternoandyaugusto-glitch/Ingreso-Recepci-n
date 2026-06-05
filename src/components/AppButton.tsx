import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './AppButton.module.css';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'orange' | 'green' | 'neutral' | 'danger';
}

export function AppButton({
  children,
  variant = 'orange',
  className = '',
  ...props
}: AppButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
