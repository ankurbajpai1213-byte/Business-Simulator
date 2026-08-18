# Security boundary

## Non-negotiables

1. The browser never calls OpenAI directly.
2. OpenAI credentials exist only in server-side environment variables.
3. The browser is an untrusted client.
4. The simulation engine is authoritative for numerical game state.
5. Database writes that affect authoritative state happen server-side.
6. Secrets must never be committed to GitHub.
7. Supabase service-role credentials are server-only.

## Current v0.1 flow

The browser receives an HTTP-only anonymous game-session cookie containing only a random session identifier. The server loads authoritative state from Supabase for every turn and AI interaction.

Simulation:

Browser → HTTP-only session cookie → server → Supabase state → simulation engine → Supabase update → browser

AI:

Browser → HTTP-only session cookie + player message → server → Supabase state → constrained OpenAI request → browser

The browser never submits cash, revenue, reputation, inventory, or other authoritative values.

## Database security

- Supabase Row Level Security is enabled on prototype tables.
- The anonymous prototype does not expose public table-write policies.
- The server uses the Supabase service role for controlled persistence.
- Supabase Auth and user-ownership policies are the next hardening step before broad public testing.

## Remaining hardening before external users

- Supabase Auth and per-user session ownership
- Rate limiting on simulation and AI endpoints
- Request body size limits and abuse protection
- WAF/CDN controls as traffic warrants
- Structured OpenAI outputs with schema validation where AI results affect state
- Server-side AI/event/cost logging
- Idempotency/concurrency protection for turn submission
- Production monitoring and alerting
