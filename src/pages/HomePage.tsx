import { LogIn, LogOut } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionCard } from '../components/ActionCard';
import institutionalLogo from '../assets/institutional-logo.png';
import northfieldLogo from '../assets/northfield-logo.png';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);

  const handleSecretTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((tap) => now - tap < 3000), now];

    if (taps.current.length >= 5) {
      taps.current = [];
      navigate('/admin/login');
    }
  };

  return (
    <main className={styles.home}>
      <button
        aria-label="Northfield"
        className={styles.northfieldLogo}
        onClick={handleSecretTap}
        type="button"
      >
        <img alt="" src={northfieldLogo} />
      </button>

      <section className={styles.welcome}>
        <h1>Bienvenido</h1>
        <p className={styles.school}>Recepción Northfield</p>
        <p className={styles.helper}>Seleccione una opción para continuar</p>

        <div className={styles.actions}>
          <ActionCard icon={<LogIn />} label="CHECK IN" tone="orange" to="/checkin" />
          <ActionCard icon={<LogOut />} label="CHECK OUT" tone="green" to="/checkout" />
        </div>
      </section>

      <img alt="Institutional logo" className={styles.institutionalLogo} src={institutionalLogo} />
    </main>
  );
}
