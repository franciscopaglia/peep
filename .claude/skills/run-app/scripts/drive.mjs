// Working example: unlock to lesson 52, spell a sentence on the write
// keyboard, confirm it grades correct, screenshot it.
//
//   cp -r .claude/skills/run-app/scripts/drive.mjs "$SCRATCH"/
//   cd "$SCRATCH" && node drive.mjs
//
// Requires `npm run dev` running and playwright installed in $SCRATCH
// (see SKILL.md). Edit OUT, the progress number, and the taps for your case.
import { chromium } from 'playwright';

const OUT = process.env.SCRATCH ?? '.';
const MOBILE = { width: 390, height: 1100 };
const DESKTOP = { width: 900, height: 1000 };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: DESKTOP });
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE ERROR:', m.text()));
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

const body = () => page.locator('body').innerText();
const log = async (label) => console.log(`=== ${label} ===\n` + (await body()).slice(0, 400).replace(/\n/g, ' | '));

// Landing first — the dashboard is behind "Start learning".
await page.goto('http://localhost:5173/');
// 51 spine lessons done ⇒ lesson 52 is the current one.
await page.evaluate(() => localStorage.setItem('shavian-progress', '51'));
await page.reload();
await page.getByRole('button', { name: /start learning/i }).first().click().catch(() => {});
await page.waitForTimeout(700);

// The Continue card opens the current lesson — works at any viewport.
await page.getByRole('button', { name: /continue/i }).first().click();
await page.waitForTimeout(600);

// Step past teach cards to the exercise. `.last()` avoids the dashboard's own
// Continue still being in the tree.
for (let i = 0; i < 6; i++) {
  if ((await body()).includes('The cat sat.')) break;
  await page.getByRole('button', { name: 'Continue', exact: true }).last()
    .click({ timeout: 3000 })
    .catch((e) => console.log('continue click failed:', e.message.slice(0, 60)));
  await page.waitForTimeout(400);
}
await log('on the write exercise');

// Keyboard keys are labelled by letter *name* (see lib/shavian-keyboard.ts).
const tap = async (label) => {
  await page.getByRole('button', { name: label, exact: true }).first().click();
  await page.waitForTimeout(40);
};
for (const key of ['they', 'space', 'kick', 'ash', 'tot', 'space', 'so', 'ash', 'tot', 'full stop']) {
  await tap(key); // 𐑞 𐑒𐑨𐑑 𐑕𐑨𐑑.
}

await page.getByRole('button', { name: /check/i }).first().click();
await page.waitForTimeout(600);
await log('after check'); // expect "Correct!"
await page.screenshot({ path: `${OUT}/drive-desktop.png`, fullPage: true });

// Under 640px the keyboard re-flows and the nav collapses — verify both.
await page.setViewportSize(MOBILE);
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/drive-mobile.png`, fullPage: true });

await browser.close();
