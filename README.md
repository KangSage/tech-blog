# Sage Garden

Astro-based personal technology garden for GitHub Pages.

## Toolchain

This repository uses `mise` and `pnpm` only.

```bash
mise install
pnpm install --frozen-lockfile
pnpm dev
```

Do not use `npm install`, Yarn, or Bun in this repository. Commit only `pnpm-lock.yaml`.

## Content

Blog posts live under:

```text
src/content/blog/<lang>/<slug>.mdx
```

Supported languages:

- `ko`: primary language
- `ja`: optional second priority
- `en`: optional third priority

Every post must include:

```yaml
---
title: "Post title"
description: "Short search-friendly summary"
publishedAt: "2026-06-18"
lang: "ko"
translationKey: "stable-translation-key"
category: "tech"
tags: ["tag"]
draft: false
---
```

Tags are what readers search and filter by on the home page (search matches title, description, and tags only).
For Korean posts, pair each English tag with a Korean tag written without spaces, e.g. `["ontology", "온톨로지", "access-control", "접근제어"]`.

Supported categories:

- `tech`: engineering notes
- `lab`: tooling, AI, and workflow experiments
- `notes`: short ideas and reading notes
- `hobby`: non-technical hobby writing

Translations are linked by `translationKey`. Do not create fallback pages for untranslated posts.

## Deployment

GitHub Pages is deployed from the `main` branch by `.github/workflows/deploy.yml`.

Temporary site URL:

```text
https://kangsage.github.io/tech-blog/
```

When a custom domain is chosen, update `site` and `base` in `astro.config.mjs`.

## Security Operations

- Dependency updates are handled by Dependabot PRs.
- OSV-Scanner runs read-only on a daily schedule and manual dispatch.
- Public security content is manually promoted through `src/data/security/summary.json`.
- Automated MDX security logs are intentionally forbidden.
- The security page is a dependency advisory monitor, not a security guarantee.

## Commands

```bash
pnpm check
pnpm build
pnpm preview
```
