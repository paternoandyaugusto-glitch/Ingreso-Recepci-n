import { DateService } from './dateService';
import { Visitor } from '../types/visitor';

const escapeCell = (value: string | undefined): string => {
  const normalized = value ?? '';
  return `"${normalized.replace(/"/g, '""')}"`;
};

const toVisitorHistoryCsv = (visitors: Visitor[]): string => {
  const headers = ['Name', 'Role', 'DNI', 'Destination', 'Check In', 'Check Out', 'Duration'];
  const rows = visitors.map((visitor) => [
    visitor.fullName,
    visitor.role,
    visitor.dni,
    visitor.destination,
    DateService.formatDateTime(visitor.checkInDateTime),
    DateService.formatDateTime(visitor.checkOutDateTime),
    DateService.formatDuration(visitor.checkInDateTime, visitor.checkOutDateTime),
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
};

const downloadCsv = (filename: string, csv: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const CsvService = {
  toVisitorHistoryCsv,
  downloadCsv,
};
