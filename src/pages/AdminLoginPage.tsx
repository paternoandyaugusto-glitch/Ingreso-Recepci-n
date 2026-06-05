import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../components/AppButton';
import { FormField } from '../components/FormField';
import northfieldLogo from '../assets/northfield-logo.png';
import { useAuthStore } from '../store/authStore';
import styles from './AdminLoginPage.module.css';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (login(password)) {
      navigate('/admin', { replace: true });
      return;
    }

    setError('Invalid password.');
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <img alt="Northfield" src={northfieldLogo} />
        <FormField error={error} label="Password">
          <input
            autoComplete="current-password"
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            type="password"
            value={password}
          />
        </FormField>
        <AppButton type="submit" variant="orange">
          Login
        </AppButton>
      </form>
    </main>
  );
}
