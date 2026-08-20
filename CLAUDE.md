# Business Simulator — project brief

Read this before starting any task. It carries decisions made outside this repo.

## What this is

A quick-play business simulation game. The player names themselves, names a cafe in
Mumbai, sets it up, and runs it for a year. The vertical slice is one city, one business.

The product goal is the feeling of: **"I made a call, and I can see why it worked or
didn't."** If a player cannot trace an outcome back to their own decision, the game has
failed, however accurate the economics are.

This is a game, not a business prediction or validation tool.

## Non-negotiables

- The simulation engine is authoritative for all numbers.
- **No LLM/AI in the economics.** Ever. Untestable and unbalanceable.
- **Do not reintroduce AI customer chat.** Built, tested, deliberately removed.
  `app/api/ai/customer/route.ts` is legacy, not live product.
- The browser is untrusted. Authoritative state changes happen server-side.
- **Mobile first, and nothing scrolls.** The page itself has `overflow:hidden`. Header,
  cafe scene, metrics and the action button are fixed; only lists move. Any change that
  reintroduces page scroll is a regression.
- Never commit secrets.

## Stack

Next.js / React / TypeScript, Supabase, Vercel (project `business-simulator`, team
ABCD Tech, production alias `business-simulator-blue.vercel.app`).

Supabase: `xzkhhwlkiuvmyjngwbia` (production), `vvdodafzbmcjljtklznd` (dev). Migrations
0001–0004. RLS is enabled with **no policies** — tables are service-role only. That is
intentional for anonymous play and must change before real user accounts.

## Structure

- `app/page.tsx` — the whole player experience: onboarding, game screen, all modals.
- `components/Setup.tsx` — five-step setup (capital, location, format, menu, plan).
- `components/Art.tsx` — every illustration, drawn as inline SVG. No image assets.
- `components/Brewing.tsx` — the coffee-pour loader.
- `lib/simulation.ts` — the engine. Demand, costs, reputation, events, milestones.
- `lib/cadence.ts` — time structure, action slots, span reports, interruptions.
- `lib/simulation-engine-v2.ts` — delayed effects and scenario weighting.
- `lib/sound.ts` — generated sound, off by default.

## How time works

A turn is not always a day. `lib/cadence.ts` is the source of truth:

| Stage | Turn covers | Action slots |
|---|---|---|
| Days 1–7 | 1 day | 1 |
| Day 8 – month 3 | 1 week | 2 |
| Months 4–6 | 1 fortnight | 3 |
| Months 7–12 | 1 month | 3 |

~32 decisions across 365 days. A turn simulates its whole span server-side and returns a
`SpanReport`. Delayed effects still land on their exact day inside a span.

**A span breaks early** when stock falls below 14%, when cash drops to ~5 days of runway,
or when an event fires mid-period. This is deliberate: the player must never lose days
they had no chance to influence. An earlier version let stock hit zero inside a long turn
and the cafe sat closed for days — do not reintroduce that.

## Key engine rules

- **Reputation follows quality.** Ceiling is quality + 22. Above it, reputation drifts
  down. Serving nobody costs −3.2/day. Gains above 80% are halved. This replaced a model
  where a closed cafe with 48% quality reached 97.8% reputation.
- **Stock burn scales with menu breadth** — `(customers / 9) × (1 + 0.04 per item over 5)`.
  Lean kiosk ≈ 10 days of cover, broad restaurant ≈ 7.
- **Restock comes in three sizes** (+30/+60/+90 for ₹8k/₹15k/₹21k).
- **Strategic decisions unlock after day 90**: supply contract, manager, extended hours,
  regulars programme. Each once only. The supply contract auto-replenishes to ~78% for
  ~3.5% of sales — without it, monthly turns always run dry.
- **Word of mouth**: marketing ≥45 and quality ≥72 together give ×1.07 demand.
- **Weather** varies daily (clear/hot/cold/rain/festival) and is drawn in the scene.
- **Delaying an equipment repair** breaks it 9 days later: −₹42,000, quality, stock,
  reputation. Consequences must have tails.

## Interface rules

- Every decision card shows a **live outlook** computed from current state
  ("+60% stock · about 7 days of cover"), plus an orange warning where relevant.
- Metric cards are tappable and explain themselves. The cafe scene opens the books.
- The journey bar opens a horizontal milestone timeline.
- Events are a blocking sheet, never inline — they used to crush the action grid.
- Sound is generated in code, off by default.

## What real players said

53+ games, 34 feedback responses, plus interviews. Recurring: confusion at the start,
"too easy", repetition by day 15, wanting visuals and a reacting world. Strong replay
intent throughout. A tester who doubled trade over 24 days still felt nothing was
happening — **the game reacted invisibly**. Most work since has been making consequences
legible rather than adding mechanics.

## Open and deliberately not built

- Office hub / player home screen — parked, needs design thought.
- Multiple businesses, other cities, franchising — the north star, after the cafe works.
- RLS policies for real accounts.
- Setup still has default format and menu, so tapping through gives unchosen options.

## Working notes

- Verify with `npx tsc --noEmit` and `npm run build` before pushing.
- `main` auto-deploys to production.
- The owner is non-technical and applies changes by pasting whole files into GitHub's web
  editor. Deliver complete files, name the exact path, and give a safe commit order.
