export type VisitorRole =
  | 'Professor'
  | 'Student'
  | 'Parent / Mother / Father'
  | 'Family Member'
  | 'Director'
  | 'Other';

export type VisitorDestination = 'Primary Meeting' | 'Initial Meeting' | 'Secondary Meeting';

export interface Visitor {
  id: string;
  fullName: string;
  role: VisitorRole;
  personVisited: string;
  dni: string;
  destination: VisitorDestination;
  notes?: string;
  checkInDateTime: string;
  checkOutDateTime?: string;
  activeStatus: boolean;
}

export type NewVisitorInput = Omit<Visitor, 'id' | 'checkInDateTime' | 'activeStatus'>;

export type SortDirection = 'asc' | 'desc';

export interface SortState<T extends string> {
  key: T;
  direction: SortDirection;
}

export const visitorRoles: VisitorRole[] = [
  'Professor',
  'Student',
  'Parent / Mother / Father',
  'Family Member',
  'Director',
  'Other',
];

export const visitorDestinations: VisitorDestination[] = [
  'Primary Meeting',
  'Initial Meeting',
  'Secondary Meeting',
];
