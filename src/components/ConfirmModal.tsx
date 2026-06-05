import { AppButton } from './AppButton';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmModal({ body, onCancel, onConfirm, title }: ConfirmModalProps) {
  return (
    <div className={styles.backdrop} role="presentation">
      <div aria-modal="true" className={styles.modal} role="dialog">
        <h2>{title}</h2>
        <p>{body}</p>
        <div className={styles.actions}>
          <AppButton onClick={onCancel} type="button" variant="neutral">
            Cancel
          </AppButton>
          <AppButton onClick={onConfirm} type="button" variant="danger">
            Confirm
          </AppButton>
        </div>
      </div>
    </div>
  );
}
