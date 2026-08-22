# Business Simulator — project brief

Read this before starting any task. It carries decisions made outside this repo.

## What this is

A quick-play business simulation game. The player names themselves, names a cafe in
Mumbai, sets it up, and runs it for a year — 365 simulated days in about 33 turns.

The product goal is the feeling of: **"I made a call, and I can see why it worked or
didn't."** If a player cannot trace an outcome back to their own decision, the game has
failed, however accurate the economics are.

This is a game, not a business prediction tool.

## Non-negotiables

- The simulation engine is authoritative for all numbers.
- **No LLM/AI in the economics.** Ever. Untestable and unbalanceable.
- **Do not reintroduce AI customer chat.** Built, tested, deliberately removed.
  `app/api/ai/customer/route.ts` is dead code with no caller.
- The browser is untrusted. Authoritative state changes happen server-side.
- **Mobile first, and the page never scrolls.** `overflow:hidden` on the page. Header,
  cafe scene, metrics and the action button are fixed; only lists move inside.
- **Decision cards are a fixed height with single-line children.** Text cannot wrap, so
  a card can never grow or overflow. This was broken repeatedly before it was made
  structural. Do not replace it with flexible heights or line-clamps.
- Never commit secrets. The repo was public until 22 Aug 2026.

## Stack

Next.js 15 / React / TypeScript, Supabase, Vercel (project `business-simulator`, team
ABCD Tech, production alias `business-simulator-blue.vercel.app`).

**One Supabase project: `xzkhhwlkiuvmyjngwbia` (production).** The dev project was
deleted on 22 Aug — it had drifted and was causing migrations to be applied to the
wrong database. If a staging database is needed again, create it fresh from
`supabase/migrations/`.

## Structure

- `app/page.tsx` — the whole player experience: onboarding, game screen, all modals.
- `components/Setup.tsx` — five-step setup (capital, location, format, menu, plan).
- `components/Art.tsx` — every illustration, inline SVG. No image assets anywhere.
- `components/Brewing.tsx` — espresso-machine loader.
- `components/MuteButton.tsx` — sound toggle, present on every screen.
- `lib/simulation.ts` — the engine. Demand, costs, reputation, events, milestones.
- `lib/cadence.ts` — time structure, action slots, span reports, interruptions.
- `lib/simulation-engine-v2.ts` — delayed effects. **`selectScenario()` in here has no
  caller — it is a second, bypassed event system. Do not assume it is authoritative.**
- `lib/music.ts` / `lib/sound.ts` — generated chiptune and effects, no audio files.
- `app/admin/` + `app/api/admin/players/` — owner-only player history dashboard.

## How time works

A turn is not always a day. `lib/cadence.ts` is the source of truth:

| Stage | Turn covers | Action slots |
|---|---|---|
| Days 1–7 | 1 day | 1 |
| Day 8 – month 3 | 1 week | 2 |
| Months 4–6 | 1 fortnight | 3 |
| Months 7–12 | 1 month | 3 |

**Intended: ~33 turns for a full year. Measured on a real completed run: 48.**
Interruptions split turns more than intended. This is a known open problem.

**A span breaks early** when supplies fall below 14%, when cash drops to ~5 days of
runway, or when a severity-3 event fires past the halfway point. Emergencies break
immediately; ordinary events wait. An earlier version let supplies hit zero mid-turn
and a player lost three days she never saw — do not reintroduce that.

## Key engine rules

- **Reputation follows quality.** Ceiling is quality + 12; above it reputation drifts
  down. Serving nobody costs −3.2/day. Quality itself decays −0.12/day above 40%.
- **Supply burn** is `(customers / 18) × (1 + 0.04 per menu item over 5)`. A double
  delivery covers about a week; a full restock about a fortnight. Halving this from
  `/9` was necessary — restocking could not keep pace with a weekly turn.
- **Restock has three sizes** (+30/+60/+90) behind one button. How many are offered
  depends on turn length: 1 daily, 2 weekly, 3 fortnightly and monthly.
- **Strategic decisions unlock after day 90**: supply contract, manager, extended
  hours, regulars programme. Each once only, each behind an explanation sheet.
- **Adaptive difficulty**: `performanceIndex()` reads runway, reputation, supplies,
  streak and cumulative profit. Event costs scale 0.65×–1.25× with it.
- **Word of mouth**: marketing ≥45 and quality ≥72 together give ×1.07 demand.
- **Delaying an equipment repair** breaks it 9 days later. Consequences have tails.

## Database rules

- `game_sessions.status` accepts **only**: active, won, completed, bankrupt, abandoned.
  Code once wrote `superseded`, the write failed silently, and zombie sessions
  accumulated. Never add a status without a migration.
- A session row is created **at setup completion**, never on page load. Creating on
  load left an empty row for every visit and broke player linkage.
- `player_id` is set from the `bs_player` cookie at setup, so it is always populated.
  Sessions from before 21 Aug have `player_id = null` and are not attributable.
- RLS is enabled on all tables with **zero policies**, and as of migration `0006`
  `anon` and `authenticated` have **no table grants at all**. All access goes through
  the server using the service role. Two independent barriers, not one.
- Production has one migration with no file in `supabase/migrations/`
  (`20260822114034_security_hardening_anonymous_sessions`). Its contents are
  unrecoverable; see the README in that folder. Do not invent a replacement.

## What real players said

53+ games, 36 feedback rows, plus interviews. Recurring: confusion at the start,
"too easy", repetition by day 15, wanting visuals and a reacting world. One player
doubled her trade over 24 days and still felt nothing was happening — **the game
reacted invisibly**. Most work since has been making consequences legible rather than
adding mechanics. "Stock" was renamed "Supplies" because a Hindi-speaking tester read
it as shares.

One player has completed a full 365-day run and won.

## Open and deliberately not built

- Office hub / player home screen — parked, needs design thought.
- Multiple businesses, other cities, franchising — the north star, after the cafe works.
- RLS policies, needed before real user accounts.
- Rate limiting on any API route.
- Turn count is 48 against a target of 33.

## Working notes

- Verify with `npx tsc --noEmit` and `npm run build` before pushing.
- `main` auto-deploys to production.
- The owner is non-technical and applies changes by pasting whole files into GitHub's
  web editor. Deliver complete files, name the exact path, give a safe commit order,
  and diff against the live repo first so only genuinely changed files are handed over.
