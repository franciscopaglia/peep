---
name: release
description: Ship Peep to shavian-peep.com — what CI publishes automatically, how to verify a deploy landed, and how to publish by hand when you need to. Use when asked to deploy, release, or check what is live.
---

# Releasing Peep

The site is a static build on GitHub Pages, served at
**https://www.shavian-peep.com/** from the `gh-pages` branch (`public/CNAME`
carries the custom domain into `dist/`). The footer stamps the commit hash the
build came from, which is how you tell what is actually live.

## The normal path: don't deploy by hand

`.github/workflows/ci.yml` runs the full `check` battery on every push and PR,
and **publishes automatically when it passes on `main`**. So the release is:

```bash
npm run check     # the same gate CI applies — run it before pushing
git push
```

Then watch it land:

```bash
gh run watch                       # the CI + deploy run
gh run list --limit 5              # recent runs and their conclusions
```

If `check` fails locally it will fail in CI — fix it there, where the feedback
is fast, rather than pushing to find out.

## Verifying what is live

```bash
curl -s https://www.shavian-peep.com/ | grep -o 'assets/index-[^"]*'
git rev-parse --short HEAD
```

The surer check is the footer: open the site and compare its commit hash to
`HEAD`. Pages caches aggressively, so a stale hash right after a deploy usually
means the CDN, not a failed publish — re-check after a minute before
investigating.

## Publishing by hand

Still supported, and the fallback when Actions is down or the change must go out
from a branch:

```bash
npm run check     # never skip: manual deploy has no other gate
npm run deploy    # builds, then pushes dist/ to gh-pages
```

This needs push rights to the repo and overwrites whatever CI last published —
so if you deploy by hand from a branch, get `main` back in sync afterwards or
the next CI run will silently revert you.

## When something is wrong on the live site

Roll back by reverting the commit and letting CI republish — that keeps `main`
and the site honest about each other, which a hand-deployed fix does not.

```bash
git revert <sha> && git push
```
