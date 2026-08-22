# Migrations

`0001`–`0005` are the authoritative schema history for this project.

## Known drift (as of 22 Aug 2026)

Production (`xzkhhwlkiuvmyjngwbia`) has one migration that is **not represented
by a file here**:

    20260822114034_security_hardening_anonymous_sessions

It was applied directly to the database rather than through this folder. Until a
matching `.sql` file is added, production cannot be recreated from this
directory alone.

The dev project (`vvdodafzbmcjljtklznd`) is behind production: it does not have
the security-hardening migration, and it recorded the index migration under a
different version id. Dev is therefore **not** a reliable place to test anything
schema- or security-related until it is rebased on production.

## Rules going forward

- Every schema change gets a numbered file here, applied from here.
- Never apply SQL directly to production without adding the file.
- `game_sessions.status` accepts only: active, won, completed, bankrupt, abandoned.
  Writing any other value fails the check constraint.
