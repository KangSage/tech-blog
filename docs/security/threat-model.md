# Tech Blog Threat Model

## Scope

This threat model covers the `tech-blog` repository and its static GitHub Pages deployment. The project is a public Astro site with Markdown/MDX content, GitHub Actions workflows, pnpm dependencies, Dependabot, and read-only OSV-Scanner monitoring.

## Assets

- Published static site content and generated SEO metadata.
- Repository source, content, and dependency lockfile.
- GitHub Pages deployment permissions.
- GitHub Actions workflow permissions and artifacts.
- Public trust in the dependency advisory monitor.

## Trust Boundaries

- Public visitors can read the generated site but cannot submit content.
- Repository maintainers can change source, content, workflows, and dependencies.
- GitHub Actions runs build and scan workflows with scoped `GITHUB_TOKEN` permissions.
- npm packages, GitHub Actions, and OSV/GitHub advisory data are external inputs.
- MDX content is trusted maintainer-authored content only.

## Attacker-Controlled Inputs

- Third-party dependency packages and lifecycle scripts.
- Third-party GitHub Actions referenced by workflows.
- Advisory metadata surfaced by OSV or GitHub.
- Pull requests or commits from future contributors.
- Browser requests for static assets and pages.

## Security Invariants

- Workflows that install dependencies must not have repository write permissions.
- OSV scanning must remain read-only and must not modify repository files.
- External advisory data must not be converted into MDX or executable build input.
- Public security pages must not claim complete site safety.
- Dependency updates must be reviewed through pull requests before merge.
- Only `pnpm-lock.yaml` is accepted as the JavaScript dependency lockfile.

## Failure Modes

- A compromised dependency or lifecycle script executes during install.
- A compromised GitHub Action abuses excessive workflow token permissions.
- Advisory data is rendered unsafely or misrepresented as a security guarantee.
- Incorrect canonical, hreflang, or base URLs damage indexing after deployment.
- Dependabot or OSV monitoring misses a vulnerable dependency.

## Reporting Policy

Security issues should be reported through GitHub private vulnerability reporting if enabled, or by opening a minimal issue that avoids exploit details. Public advisory summaries are manually reviewed before publication.
