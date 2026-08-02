// screens.mjs — shoot every view, in both themes, at both widths.
//
//   node screens.mjs            # 24 PNGs into the cwd (run it from $SCRATCH)
//   node screens.mjs dashboard  # just one view
//
// A sweep to *look at* after a change that touches shared UI — tokens, Nav,
// Footer, Button, the theme toggle. It deliberately does not diff against
// golden images: this repo ships no browser driver, and font rendering differs
// enough between machines that a pixel baseline would cry wolf far more often
// than it caught anything. Your eyes on 24 frames is the cheaper instrument.
//
// Needs the dev server up (npm run dev) and playwright installed in the cwd.

import { chromium } from 'playwright';

const only = process.argv[2];
const WIDTHS = [
  ['wide', 900],
  ['narrow', 390],
];
const THEMES = ['light', 'dark'];

// Each view and how to reach it — there are no URLs, so everything is clicks.
const VIEWS = {
  landing: async () => {},
  dashboard: async (page) => {
    await page.locator('text=Start learning').locator('visible=true').first().click();
  },
  lesson: async (page) => {
    await page.locator('text=Start learning').locator('visible=true').first().click();
    await page.waitForTimeout(400);
    await page.locator('text=Continue').locator('visible=true').first().click();
  },
  complete: async (page) => {
    // Skip straight through a lesson to reach the results screen.
    await page.locator('text=Start learning').locator('visible=true').first().click();
    await page.waitForTimeout(400);
    await page.locator('text=Continue').locator('visible=true').first().click();
    await page.waitForTimeout(500);
    for (let i = 0; i < 30; i++) {
      const skip = page.getByText('Skip this one');
      const cont = page.getByRole('button', { name: 'Continue' });
      if (await skip.count()) await skip.click();
      else if (await cont.count()) await cont.last().click();
      else break;
      await page.waitForTimeout(200);
    }
  },
  about: async (page) => {
    await page.locator('text=About').locator('visible=true').first().click();
  },
  resources: async (page) => {
    await page.locator('text=Resources').locator('visible=true').first().click();
  },
};

const browser = await chromium.launch();

for (const [label, width] of WIDTHS) {
  for (const theme of THEMES) {
    for (const [view, reach] of Object.entries(VIEWS)) {
      if (only && view !== only) continue;
      const page = await browser.newPage({
        viewport: { width, height: 1100 },
        colorScheme: theme,
      });
      page.on('pageerror', (e) => console.log(`PAGE ERROR ${view}/${theme}:`, e.message));
      page.on(
        'console',
        (m) => m.type() === 'error' && console.log(`CONSOLE ERROR ${view}/${theme}:`, m.text())
      );

      await page.goto('http://localhost:5173/');
      // Unlock the course so the dashboard and lessons are reachable, and let
      // the theme follow the emulated system preference.
      await page.evaluate(() => {
        localStorage.setItem('shavian-progress', '51');
        localStorage.removeItem('shavian-theme');
      });
      await page.reload();
      await page.waitForTimeout(300);

      try {
        await reach(page);
        await page.waitForTimeout(600);
        await page.screenshot({ path: `view-${view}-${theme}-${label}.png`, fullPage: true });
        console.log(`shot ${view} ${theme} ${label}`);
      } catch (e) {
        console.log(`FAILED ${view} ${theme} ${label}: ${e.message.split('\n')[0]}`);
      }
      await page.close();
    }
  }
}

await browser.close();
