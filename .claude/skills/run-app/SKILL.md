---
name: run-app
description: Launch Peep in a real browser and drive it — open a specific lesson, answer exercises, screenshot the result. Use whenever a change needs to be seen working in the app rather than only under `npm test`, or when asked to run, start, or screenshot Peep.
---

# Running and driving Peep

`npm test` never renders a component. To actually see a change — a new
exercise type, a keyboard key, a layout on mobile — start the dev server and
drive a headless browser to the exercise.

## 1. Dev server

```bash
npm run dev > "$SCRATCH/dev.log" 2>&1 &   # background; serves http://localhost:5173/
```

Wait for `ready in …` in the log. Kill it with `pkill -f vite` when finished.

## 2. Playwright (not a project dependency)

The repo doesn't ship a browser driver, so install one **in the scratchpad**,
never in the project:

```bash
cd "$SCRATCH"
npm i playwright              # ~1s, local to the scratchpad
npx playwright install chromium   # ~95 MB, cached in ~/Library/Caches/ms-playwright
```

Run driver scripts from `$SCRATCH` so the import resolves.

## 3. Reaching a lesson

This is the part that wastes time if you guess. The app is a `view` state
machine in `App.tsx` — **there are no URLs**, so every lesson is reached by
clicking, and progress decides what's reachable.

1. `goto('http://localhost:5173/')` lands on **Landing**, not the dashboard.
   Click **"Start learning"** first — skipping this is the usual reason a
   dashboard locator times out.
2. Unlock lessons by writing progress before the reload:
   `localStorage.setItem('shavian-progress', '51')` — the number is how many
   spine lessons count as completed, so `51` makes lesson 52 the current one.
   (Branch lessons live in `shavian-branches`, a JSON array of ids.)
3. Then either:
   - click the **Continue** card (goes to the current lesson — the reliable
     route, and the only one that works on a narrow viewport), or
   - click the lesson node by title (`getByText('Writing Sentences')`) — desktop
     widths only; the mobile path renders nodes without visible titles.

## 4. Driving an exercise

Every interactive control has an `aria-label`, so drive by role and name:

- Write keyboard keys are labelled by **letter name**, not glyph: `they`, `kick`,
  `ash`, `tot`, `so` … plus `space`, `naming dot`, `full stop`, `comma`,
  `question mark`, `exclamation mark`, `delete last letter`. The full list is
  `SHAVIAN_KEY_ROWS` in `src/lib/shavian-keyboard.ts`.
- Teach cards advance with **Continue**. Use `.last()` — the dashboard's
  Continue card can still match otherwise.
- Grade with **Check**; the result bar then reads `Correct!` or `Not quite`.
- Assert on `page.locator('body').innerText()` — it's a compact readout of the
  whole exercise, keyboard included.

`scripts/drive.mjs` in this skill is a working end-to-end example: it unlocks
to lesson 52, spells `𐑞 𐑒𐑨𐑑 𐑕𐑨𐑑.` on the keyboard and confirms it grades
correct. Copy it to `$SCRATCH`, edit the lesson and taps, run it.

## 5. Look at the screenshot

Screenshot at both widths — `{ width: 900, height: 1000 }` and
`{ width: 390, height: 1100 }` — because several surfaces deliberately change
under 640px (`useIsMobile`): the write keyboard splits its 12-key rows into
interleaved halves, the nav collapses, hero and dashboard visuals thin out. A
change that looks right on desktop is not verified until you've seen the narrow
one. Read the PNG; a blank frame means the app never mounted.

Also hook up console output — an error there is a real failure even when the
page looks fine:

```js
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE ERROR:', m.text()));
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
```
