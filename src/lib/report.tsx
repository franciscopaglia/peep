import { GITHUB_ISSUES_URL } from '@/lib/constants';

/**
 * Shared content for the site-wide "report a problem" modal, used by both the
 * header button and the footer link so they behave identically.
 */
export const siteReport = {
  issueUrl: GITHUB_ISSUES_URL,
  tooltip: 'Report an issue — did you find something wrong?',
  heading: 'Did you find something wrong?',
  body: (
    <>
      Thanks for helping make Peep better! Tapping{' '}
      <span className="font-semibold text-foreground">Continue</span> opens a short form on{' '}
      <span className="font-semibold text-foreground">GitHub</span> where you can describe the
      problem. You'll need a free GitHub account to send it — it only takes a moment.
    </>
  ),
};
