export type NonComparableRoute = {
  pathPattern: string;
  reason: string;
  phase: 'phase-0' | 'phase-1';
};

export const nonComparableRoutes: NonComparableRoute[] = [
  {
    pathPattern: '/blackboard/questionnaire/*',
    reason: 'Runtime PHP questionnaire flow is out of static migration scope.',
    phase: 'phase-0',
  },
  {
    pathPattern: '/blackboard/support_doc_search/search.php',
    reason: 'Runtime search endpoint depends on PHP backend behavior.',
    phase: 'phase-0',
  },
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
