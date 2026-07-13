export const GITHUB_URL = 'https://github.com/franciscopaglia/peep';
export const AUTHOR_GITHUB_URL = 'https://github.com/franciscopaglia';
export const GITHUB_ISSUES_URL = `${GITHUB_URL}/issues/new`;

/** A GitHub "new issue" link, prefilled with the lesson and exercise in question. */
export function lessonIssueUrl(lessonId: number, lessonTitle: string, exerciseNo: number) {
  const title = `Lesson ${lessonId} “${lessonTitle}” — issue on exercise ${exerciseNo}`;
  const body = [
    `**Lesson:** ${lessonId} — ${lessonTitle}`,
    `**Exercise:** ${exerciseNo}`,
    '',
    "**What's wrong?**",
    '',
  ].join('\n');
  const params = new URLSearchParams({ title, body });
  return `${GITHUB_URL}/issues/new?${params.toString()}`;
}
