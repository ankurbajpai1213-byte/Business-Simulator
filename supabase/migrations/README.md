# Migrations

`0001`–`0006` are the schema history for this project. Production is
`xzkhhwlkiuvmyjngwbia`. There is no dev project — the old one had drifted badly and
was deleted on 22 Aug 2026.

## One unrecoverable migration

Production has a migration with **no file in this folder**:

    20260822114034_security_hardening_anonymous_sessions

It was applied directly to the database. Its actual contents cannot be recovered.

What is known, from inspecting the live database:

- RLS was **already enabled** on all five tables by `0001` and `0003`, so this
  migration did not turn it on.
- There are zero RLS policies, which is the intended fail-closed state.
- Afterwards, `anon` and `authenticated` held full table privileges — which `0001`
  and `0003` never granted. Whether that migration granted them or whether they came
  from Supabase defaults is unknown.

Those grants have since been removed by `0006`.

**Do not reconstruct this migration from guesswork.** A plausible-looking file that
nobody can verify is worse than a documented gap. This note is the record.

## Rules going forward

- Every schema change gets a numbered file here, and is applied from here.
- Never apply SQL directly to production without adding the matching file.
- `game_sessions.status` accepts only: active, won, completed, bankrupt, abandoned.
  Writing any other value fails the check constraint silently if the error is ignored.
- All database access goes through the server using the service role. `anon` and
  `authenticated` have no grants and no policies. Do not add either without a very
  good reason.
