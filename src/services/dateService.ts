const sameLocalDate = (value: string, date = new Date()): boolean => {
  const target = new Date(value);

  return (
    target.getFullYear() === date.getFullYear() &&
    target.getMonth() === date.getMonth() &&
    target.getDate() === date.getDate()
  );
};

const startOfLocalDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const formatDateTime = (value?: string): string => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const formatDuration = (from: string, to?: string): string => {
  const end = to ? new Date(to).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((end - new Date(from).getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  return `${hours} h ${remaining} min`;
};

export const DateService = {
  sameLocalDate,
  startOfLocalDay,
  formatDateTime,
  formatTime,
  formatDuration,
};
