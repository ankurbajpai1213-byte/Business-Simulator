# Security boundary

## Non-negotiables

1. The browser never calls OpenAI directly.
2. OpenAI credentials exist only in server-side environment variables.
3. The browser is an untrusted client.
4. The simulation engine is authoritative for numerical game state.
5. Database writes that affect authoritative state happen server-side.
6. Secrets must never be committed to GitHub.
7. Supabase service-role credentials are server-only.

## Prototype status

The current simulation endpoint accepts a state payload from the browser so the vertical slice can be played before Supabase is configured. This is intentionally temporary.

Before public testing, replace that flow with:

Browser → authenticated session ID → server loads state from Supabase → server applies decision → server persists state → browser receives result.

The OpenAI endpoint already follows the required server-side boundary.

## Future hardening

- Supabase Auth and Row Level Security ownership policies
- Rate limiting on simulation and AI endpoints
- Request body size limits
- Abuse protection / WAF as traffic warrants
- Structured OpenAI outputs with schema validation
- Server-side event and cost logging
- Idempotency for turn submission
