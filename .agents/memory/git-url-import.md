---
name: Git/URL source import for discovery
description: Why agent-code import from a repo/URL uses the codeload tarball + a hand-rolled tar reader instead of the GitHub REST API
---
Admissão discovery can pull agent source from a Git repo URL or a plain web/raw URL, concatenate relevant files, and feed the same analyze pipeline.

- **GitHub repos use `codeload.github.com/<owner>/<repo>/tar.gz/<ref>`** (ref = `HEAD` when no branch, else `refs/heads/<branch>`), gunzipped + parsed by a minimal in-file tar reader.
  - **Why:** the GitHub REST API (repo tree + raw files) is rate-limited to ~60 req/hr per IP unauthenticated; in the shared Replit preview IP that returns 429 almost immediately, making the feature look broken in demos. codeload is the same path as `git clone` and is not subject to that limit, and the tar reader avoids adding a tar dependency.
- **Non-github.com URLs** (incl. `raw.githubusercontent.com`) go through a generic single-URL fetch that strips HTML when the content-type is HTML.
- **Guardrails:** http(s) only; SSRF block of localhost / private + link-local IP ranges (incl. 169.254 cloud metadata); per-file and total-size caps tied to analyze's `MAX_CONTENT_LENGTH`; allow-list of code/skill/doc extensions; ignore node_modules/dist/lockfiles etc.
- **How to apply:** if GitHub import regresses, first suspect codeload availability/ref format, not API tokens — there is no GitHub auth in this path by design.
