
import React from 'react';
import { ArchitectureCard, SystemStatus } from './types';

export const ARCHITECTURES: ArchitectureCard[] = [
  {
    id: 'real-estate',
    number: '01',
    name: 'Real Estate Investment Analytics',
    description: 'A structural framework that scans markets to find and evaluate profitable property deals automatically. (Profitable property finder)',
    status: SystemStatus.ACTIVE,
    highlights: ['Deal identification', 'Opportunity evaluation', 'Risk and return clarity']
  },
  {
    id: 'outbound',
    number: '02',
    name: 'Hyper-personalized Outbound System',
    description: 'Automatically finds your ideal customers and sends them unique, tailored messages to start sales conversations. (Automated sales machine)',
    status: SystemStatus.IN_DEVELOPMENT,
    highlights: ['Lead sourcing', 'Personalization at scale', 'Consistent outbound execution']
  },
  {
    id: 'marketing',
    number: '03',
    name: 'Unified Marketing Intelligence',
    description: 'Eliminates the chaos of tracking data across multiple tabs. It automates and unifies all your research and metrics, saving 5–10 hours of manual reporting every week. (Unified business view)',
    status: SystemStatus.COMING_SOON,
    highlights: ['Channel performance visibility', 'Centralized metrics', 'Decision clarity for growth teams']
  },
  {
    id: 'data-mining',
    number: '04',
    name: 'Niche Commercial Data Mining',
    description: 'A protocol that extracts specific, hard-to-find datasets to give you an edge in commercial markets. (Targeted data delivery)',
    status: SystemStatus.COMING_SOON,
    highlights: ['Targeted datasets', 'Market-specific intelligence', 'Actionable data delivery']
  }
];
