# Business Simulator — Prototype v0.1

## 1. Product goal

Build a playable web-based business management simulation for curious players and management/strategy gamers. The first vertical slice is a Mumbai café that the player operates day by day.

The prototype must feel like a game: the player makes decisions, the simulation responds, and consequences accumulate over time.

## 2. Locked product decisions

- Platform: web app
- UI: functional with decent visual quality
- Primary city: Mumbai
- First business: Café
- Next businesses: Restaurant, Fashion Boutique
- Next city: Bangalore, after the first vertical slice
- Perspective: hybrid management UI + AI interactions
- Objective: achieve profitability and survive as long as possible
- Target players: curious people + management/strategy gamers

## 3. Core loop

Start business → choose market/location → allocate starting capital → operate a day → review business state → make decisions → simulate demand and finances → handle events/interactions → persist results → advance to next day.

The first version should support a meaningful short run rather than a huge content catalogue.

## 4. Authoritative simulation

The game engine, not the LLM, determines numerical outcomes.

Authoritative variables include:

- cash
- revenue
- expenses
- profit/loss
- demand
- customer volume
- pricing
- capacity
- staff
- inventory/inputs
- reputation
- marketing spend/effect
- competition pressure
- rent and fixed costs
- day/time progression
- event effects

Simulation formulas should be deterministic where practical and configurable through data rather than hard-coded throughout UI components.

## 5. AI boundary

The browser MUST NOT call OpenAI directly.

OpenAI credentials MUST remain server-side.

AI may generate:

- customer dialogue
- supplier/employee conversations
- narrative context
- event descriptions
- natural-language explanations

AI must not directly mutate authoritative game state or invent financial values that bypass the simulation engine.

Expected flow:

Browser → HTTP-only game-session cookie → authenticated/authorized backend → load state from Supabase → constrained AI request → OpenAI → browser.

For simulation turns:

Browser → HTTP-only game-session cookie + decision → backend → load state from Supabase → simulation engine → persist state → browser.

## 6. Security baseline

- Treat browser input as untrusted.
- Do not accept authoritative state from the browser.
- Authorize every game-session mutation.
- Validate and constrain request payloads.
- Rate-limit AI-facing endpoints before external testing.
- Keep OpenAI and Supabase privileged credentials server-side.
- Never trust client-provided cash, revenue, reputation, inventory, or other authoritative values.
- Use Supabase Row Level Security for user-owned data.
- Keep secrets in environment variables / deployment secret storage; never commit them.

## 7. Feedback

Feedback is part of v0.1, not a post-launch add-on.

Capture, where appropriate:

- overall enjoyment
- desire to play again
- clarity/ease of understanding
- perceived difficulty
- realism
- most interesting decision
- most confusing/frustrating part
- what the player would change
- recommendation intent
- optional free text

Feedback should be associated with a game/session context where appropriate while avoiding unnecessary personal data.

## 8. MVP screens

1. Landing / start
2. Business setup
3. Market/location selection
4. Main management dashboard
5. Decision/action panels
6. AI interaction/event modal or panel
7. Day results
8. End-of-run summary
9. Feedback form

## 9. Deliberate exclusions from v0.1

- Multiple cities at launch
- Three businesses simultaneously
- Full real-world city digital twin
- Complex accounting
- Multiplayer
- Mobile-native application
- Large external-data ingestion pipeline
- LLM-controlled economics

## 10. Current engineering milestone

The first vertical slice now has a server-authoritative session path backed by Supabase. The next integration step is to apply the Supabase migrations and configure deployment secrets, then test a complete persisted play session.

## 11. Expansion gate

Do not expand the content surface until the Mumbai café vertical slice is playable end-to-end and produces useful playtest feedback.
