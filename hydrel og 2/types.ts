
export enum SystemStatus {
  IN_DEVELOPMENT = 'In Development',
  COMING_SOON = 'Coming Soon',
  ACTIVE = 'Active'
}

export interface ArchitectureCard {
  id: string;
  number: string;
  name: string;
  description: string;
  status: SystemStatus;
  highlights: string[];
}
// your existing types stay exactly as they are...

// then at the bottom, add:
export type AgentMode = 'buying' | 'listing' | 'investor' | 'flipper';

export const ENGINE_COLORS: Record<AgentMode, string> = {
  buying:   '#6366f1',
  listing:  '#f97316',
  investor: '#10b981',
  flipper:  '#f59e0b',
};

export const ENGINE_OPTIONS = [
  { id: 'listing'  as AgentMode, label: 'Listing Agent', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'buying'   as AgentMode, label: 'Buying Agent',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'investor' as AgentMode, label: 'Investor',      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'flipper'  as AgentMode, label: 'Flipper',       icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
] as const;
