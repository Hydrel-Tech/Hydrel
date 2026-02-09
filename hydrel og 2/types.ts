
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
