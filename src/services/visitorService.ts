import { DateService } from './dateService';
import { NewVisitorInput, Visitor } from '../types/visitor';

const STORAGE_KEY = 'northfield-vms-visitors';

const readVisitors = (): Visitor[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Visitor[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveVisitors = (visitors: Visitor[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
};

const createId = (): string => {
  if ('randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createVisitor = (input: NewVisitorInput): Visitor => {
  const visitor: Visitor = {
    ...input,
    id: createId(),
    checkInDateTime: new Date().toISOString(),
    activeStatus: true,
  };

  saveVisitors([visitor, ...readVisitors()]);
  return visitor;
};

const updateVisitor = (visitor: Visitor): Visitor => {
  const nextVisitors = readVisitors().map((current) =>
    current.id === visitor.id ? visitor : current,
  );
  saveVisitors(nextVisitors);
  return visitor;
};

const checkOutVisitor = (id: string): Visitor | undefined => {
  const visitors = readVisitors();
  const visitor = visitors.find((current) => current.id === id);

  if (!visitor) return undefined;

  const updated: Visitor = {
    ...visitor,
    checkOutDateTime: new Date().toISOString(),
    activeStatus: false,
  };

  saveVisitors(visitors.map((current) => (current.id === id ? updated : current)));
  return updated;
};

const deleteVisitor = (id: string): void => {
  saveVisitors(readVisitors().filter((visitor) => visitor.id !== id));
};

const getAllVisitors = (): Visitor[] => readVisitors();

const getActiveVisitors = (): Visitor[] => readVisitors().filter((visitor) => visitor.activeStatus);

const getHistoricalVisitors = (): Visitor[] =>
  readVisitors().filter((visitor) => !visitor.activeStatus);

const getTodaysVisitors = (): Visitor[] =>
  readVisitors().filter((visitor) => DateService.sameLocalDate(visitor.checkInDateTime));

const getTodaysCheckOuts = (): Visitor[] =>
  readVisitors().filter(
    (visitor) => visitor.checkOutDateTime && DateService.sameLocalDate(visitor.checkOutDateTime),
  );

export const VisitorService = {
  createVisitor,
  updateVisitor,
  checkOutVisitor,
  deleteVisitor,
  getAllVisitors,
  getActiveVisitors,
  getHistoricalVisitors,
  getTodaysVisitors,
  getTodaysCheckOuts,
};
