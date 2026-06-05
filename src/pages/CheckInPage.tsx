import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../components/AppButton';
import { FormField } from '../components/FormField';
import { Toast } from '../components/Toast';
import { PageShell } from '../layouts/PageShell';
import { useVisitorStore } from '../store/visitorStore';
import { NewVisitorInput, VisitorDestination, VisitorRole, visitorDestinations, visitorRoles } from '../types/visitor';
import styles from './CheckInPage.module.css';

type Errors = Partial<Record<keyof NewVisitorInput, string>>;

const initialForm: NewVisitorInput = {
  fullName: '',
  role: '' as VisitorRole,
  personVisited: '',
  dni: '',
  destination: '' as VisitorDestination,
  notes: '',
};

const validate = (form: NewVisitorInput): Errors => {
  const errors: Errors = {};

  if (form.fullName.trim().length < 3) errors.fullName = 'Minimum 3 characters required.';
  if (!form.role) errors.role = 'Role is required.';
  if (!form.personVisited.trim()) errors.personVisited = 'Person being visited is required.';
  if (!/^\d{7,9}$/.test(form.dni)) errors.dni = 'DNI must contain 7 to 9 numbers.';
  if (!form.destination) errors.destination = 'Destination is required.';

  return errors;
};

export function CheckInPage() {
  const navigate = useNavigate();
  const createVisitor = useVisitorStore((state) => state.createVisitor);
  const [form, setForm] = useState<NewVisitorInput>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState('');

  const updateField = <K extends keyof NewVisitorInput>(key: K, value: NewVisitorInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    createVisitor({
      ...form,
      fullName: form.fullName.trim(),
      personVisited: form.personVisited.trim(),
      dni: form.dni.trim(),
      notes: form.notes?.trim(),
    });
    setMessage('Visitor successfully checked in.');
    window.setTimeout(() => navigate('/'), 2000);
  };

  return (
    <PageShell eyebrow="Visitor Registration" title="Check In">
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField error={errors.fullName} label="Full Name">
          <input
            autoComplete="name"
            inputMode="text"
            onChange={(event) => updateField('fullName', event.target.value)}
            value={form.fullName}
          />
        </FormField>
        <FormField error={errors.role} label="Role">
          <select
            onChange={(event) => updateField('role', event.target.value as VisitorRole)}
            value={form.role}
          >
            <option value="">Select role</option>
            {visitorRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </FormField>
        <FormField error={errors.personVisited} label="Person Being Visited">
          <input
            list="visited-examples"
            onChange={(event) => updateField('personVisited', event.target.value)}
            value={form.personVisited}
          />
          <datalist id="visited-examples">
            <option value="Mrs. Gonzalez" />
            <option value="Mr. Smith" />
            <option value="Reception" />
            <option value="Administration" />
          </datalist>
        </FormField>
        <FormField error={errors.dni} label="DNI">
          <input
            inputMode="numeric"
            onChange={(event) => updateField('dni', event.target.value.replace(/\D/g, ''))}
            pattern="[0-9]*"
            value={form.dni}
          />
        </FormField>
        <FormField error={errors.destination} label="Destination">
          <select
            onChange={(event) => updateField('destination', event.target.value as VisitorDestination)}
            value={form.destination}
          >
            <option value="">Select destination</option>
            {visitorDestinations.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Optional Notes">
          <textarea onChange={(event) => updateField('notes', event.target.value)} value={form.notes} />
        </FormField>
        <div className={styles.actions}>
          <AppButton type="submit" variant="orange">
            Check In Visitor
          </AppButton>
        </div>
      </form>
      <Toast message={message} />
    </PageShell>
  );
}
