import { create } from 'zustand';
import { VisitorService } from '../services/visitorService';
import { NewVisitorInput, Visitor } from '../types/visitor';

interface VisitorState {
  visitors: Visitor[];
  refreshVisitors: () => void;
  createVisitor: (input: NewVisitorInput) => Visitor;
  checkOutVisitor: (id: string) => Visitor | undefined;
  deleteVisitor: (id: string) => void;
}

export const useVisitorStore = create<VisitorState>((set) => ({
  visitors: VisitorService.getAllVisitors(),
  refreshVisitors: () => set({ visitors: VisitorService.getAllVisitors() }),
  createVisitor: (input) => {
    const visitor = VisitorService.createVisitor(input);
    set({ visitors: VisitorService.getAllVisitors() });
    return visitor;
  },
  checkOutVisitor: (id) => {
    const visitor = VisitorService.checkOutVisitor(id);
    set({ visitors: VisitorService.getAllVisitors() });
    return visitor;
  },
  deleteVisitor: (id) => {
    VisitorService.deleteVisitor(id);
    set({ visitors: VisitorService.getAllVisitors() });
  },
}));
