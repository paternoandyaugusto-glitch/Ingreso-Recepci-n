import { Link } from 'react-router-dom';
import { AppButton } from '../components/AppButton';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <h1>Page not found</h1>
      <Link to="/">
        <AppButton type="button" variant="orange">
          Return Home
        </AppButton>
      </Link>
    </main>
  );
}
