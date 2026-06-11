export type NonComparableRoute = {
  pathPattern: string;
  reason: string;
  phase: 'phase-0' | 'phase-1';
};

export const nonComparableRoutes: NonComparableRoute[] = [
  {
    pathPattern: '/status.php',
    reason: 'Legacy endpoint is expected to be handled as external redirect, not screenshot parity.',
    phase: 'phase-1',
  },
  {
    pathPattern: '/support/index.php',
    reason: 'Legacy endpoint is expected to be handled as external redirect, not screenshot parity.',
    phase: 'phase-1',
  },
];
