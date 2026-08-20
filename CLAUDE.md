# Business Simulator — project brief

Read this before starting any task. It carries decisions made outside this repo.

## What this is

A quick-play business simulation game. The player opens a café in Mumbai and runs
it, making decisions and living with the consequences. The vertical slice is one
city, one business.

The product goal is the feeling of: **"I made a call, and I can see why it worked
or didn't."** If a player cannot trace an outcome back to their own decision, the
game has failed, however accurate the economics are.

This is a game, not a business prediction or validation tool. Never present it as
financial advice or a real-world forecast.

## Non-negotiables

- The simulation engine is authoritative for all numbers. Cash, revenue, profit,
  customers, demand, reputation, inventory and costs are computed by fixed rules.
- **No LLM/AI in the economics.** Ever. It is untestable and unbalanceable.
- **Do not reintroduce AI customer chat.** It was built, tested, and deliberately
  removed — it turned a business game into a chat app. `app/api/ai/customer/route.ts`
  is legacy and should not be treated as live product.
- The browser is untrusted. Authoritative state changes happen server-side.
- Never commit secrets. Supabase service-role and OpenAI keys are server-only.

## Stack

Next.js / React / TypeScript, Supabase for persistence, Vercel for hosting
(project `business-simulator`, team ABCD Tech, production alias
`business-simulator-blue.vercel.app`).

Supabase projects: `xzkhhwlkiuvmyjngwbia` (production) and `vvdodafzbmcjljtklznd`
(dev). Both at migration 0004, no drift.

## What real players said

53 games played, 34 feedback responses from 6 players, plus interviews.

- **"Confusing"** — 5 of 13 rated forms. Consistent across all interviews. Players
  did not understand what they were supposed to do, or what their choices meant.
- **"Too easy"** — 6 of 13, versus 2 saying too difficult.
- **"After 10–15 days I already knew what to do."** Repetition sets in early.
- Setup feels like **filling in a form**, not playing a game.
- Strong replay intent from most testers. The core idea works; the delivery doesn't.
- Requests for visuals, and for the environment to react (rain should look like rain).

Key diagnostic: one player ran 24 days with customers moving between 101 and 193 —
they nearly doubled trade and still felt nothing was happening. **The game reacts,
but invisibly.** That is the root cause of both "too easy" and "confusing". Fixing
it is a matter of showing consequences, not adding mechanics.

## Direction

### Onboarding — four screens, one job each, no scrolling

1. What this is + the player's name
2. The café's name + the disclaimer (given real weight, not small print)
3. Starting style — a small number of preset choices, one tap
4. Open

The player's name and the café name are **separate things**. Both persist and
should appear throughout the game ("Brew & Bean, week one"). This is deliberate
emotional investment, not decoration.

Cut setup down. Asking for capital, location, format and a 20-item menu before the
player understands any of it is why people were confused. Those choices should
arrive **during play**, when there is context to judge them
("your regulars keep asking for food — add a kitchen for ₹40,000?").

Keep from the old V1 setup: costs shown per option, trade-offs explained in words,
and a running total directly above the button. V2 dropped all three and got worse.

### Chapters, not 90 identical days

Currently the game is 90 uniform days. Intended: week one day-by-day, then "you ran
for a month", then three months, six months, a year. Each chapter asks a *different*
question. Summaries should show uneven reality — good weeks, dead weeks, rain —
not a flat ~100 customers a day.

This is a significant engine change. Do not start it without confirming scope.

### Consequence visibility — highest priority after the fixes below

Every day/chapter needs a summary that states plainly what the player's decision did:
"You spent ₹10,000 on marketing. 38 more people came in. You made ₹4,200 more than
yesterday." This is the single most important missing piece.

### Delayed effects

`lib/simulation-engine-v2.ts` already implements delayed consequences (hire → payroll
bites after 7 days, marketing → awareness after 3, etc). The longest horizon is 7 days.
The structure supports any horizon via `applyOnDay`. Extending it across chapters is
wanted, but only after chapters exist.

## Outstanding tasks

1. **Feedback writes to the wrong table.** `app/api/feedback/route.ts` inserts into
   `game_events` with `event_type: 'beta_feedback'`. It should insert into the
   purpose-built `beta_feedback` table (columns: session_id, player_id, day, ease,
   gameplay, realism, decisions, continue_playing, comment, skipped). Historic rows
   have already been migrated across; only the code needs changing.

2. **Player names are never persisted.** `app/api/player/route.ts` stores the name in
   a cookie only, which is why `players` has 0 rows after 53 games. It should upsert
   `{ id, display_name, last_seen_at }` into `players` via the Supabase admin client,
   in a try/catch so a database failure never blocks play.

3. **Remove the recurring feedback popup.** `app/page.tsx` opens the feedback modal
   every ~5 days. Players hated it — 21 skips against 13 completions, and one wrote in
   to say so. Ask once, at end of run (`cash <= 0` or `day >= 91`).

4. Then: the four onboarding screens, then consequence visibility, then chapters.

## Known broken

- Café name truncates in the V2 setup header ("Set up Ank.").
- Capital card copy is cut off mid-sentence, and the copy itself
  ("You're being too realistic", "Oh really? You have that much? 😳") judges the
  player and should be deleted.
- Option cards orphan instead of pairing in the 2-column grid.
- Flow chips on the objective screen wrap badly.

These live in screens being redesigned — fix them as part of the redesign, not before.

## Working notes

- V2 (`app/v2/page.tsx`) is a draft and in several ways worse than V1 (`app/page.tsx`).
  Do not assume V2 is the newer/better source of truth.
- Mobile-first. The target is an app-like feel in the browser, not an app-store build.
  No screen should require scrolling to complete its one job.
- Deployments to `main` auto-deploy to production. Work on branches and open PRs.
- Verify with `npx tsc --noEmit` and `npm run build` before pushing. A recent
  production build failed because code referenced a module that only existed on
  another branch.
