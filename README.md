# Business Simulator

AI-powered business management simulation game.

## Current product direction — Broader Game Expansion (23 Aug 2026)

**Working branch:** `Biz-Sim-broader-idea-23Aug`

**Important:** This is an **expansion of the current game mechanism, not a pivot or replacement**. The existing café simulation loop remains the foundation. The goal is to progressively add depth, progression, management and eventually multiple businesses.

### Core game philosophy

The player should experience:

> **Decision → Simulation → Result → Feedback → Learning → Progression → New Decision**

The long-term player journey is:

> **Founder → Operator → Manager → Multi-business Owner → Portfolio Manager**

Progression should be based primarily on **demonstrated capability and business outcomes**, not arbitrary XP or a simple number-of-games counter.

---

# Approved broader-game design

## Player access and onboarding

1. **Guest play is allowed.** The player should not be forced to create an account before playing.
2. **Login / account creation must be available at any stage** of the game.
3. If a guest logs in later, their current progress/session should be associated with the account rather than forcing a restart.
4. Onboarding should explain the game clearly without overwhelming a new player.
5. The introduction/tutorial should cover **the whole interface**, not only operations.
6. The tutorial should use **visual highlighting of the actual buttons/controls** so the player understands where to act.
7. A permanent **Game Feedback** button should be available from the game interface. This is feedback about the game itself, separate from in-game customer/business feedback.

## First-business setup

The current setup mechanism remains the foundation but should become substantially better.

The player should make meaningful choices around:

- Business name
- Capital
- Locality
- Restaurant/café format
- Menu
- Staff
- Owner involvement

Capital and format availability should be progressive rather than exposing everything at the beginning.

### Owner involvement

The player can initially choose a broad operating approach:

- **Hands-on** — personally involved in operations
- **Balanced** — involved in key decisions while relying on staff
- **Delegating** — relies more heavily on the team

This is an initial strategy, not a permanent class. The game should infer the player's actual **Operating Style** from their behaviour over time.

---

# Player progression

The five major stages are:

### 1. Founder

Starting position. The player is learning to build and make their first business work.

### 2. Operator

The player has demonstrated that they can operate a business consistently.

### 3. Manager

The player learns to hire, delegate and manage through other people rather than doing everything personally.

### 4. Multi-business Owner

The player can successfully manage more than one business and must allocate money, owner time, attention and management capacity.

### 5. Portfolio Manager

The player manages a portfolio of businesses, allocating capital, people, management capacity and attention across the portfolio.

### Progression UI

The current stage and next stage should be visible during gameplay, with a dedicated journey view showing the complete path.

The player should always understand:

- Where am I?
- What is my next stage?
- What do I need to demonstrate to progress?

Progression should **not** be a rigid linear unlock tree. Different players may reach expansion through different routes.

For example, a player may be able to open **Small Café #2** before qualifying to operate a **Full Café**. Expansion and format progression therefore need not be identical gates.

---

# Business Acumen, Reputation and Operating Style

## Business Acumen

Business Acumen represents demonstrated business capability, not money or reputation.

Initial dimensions:

- Financial Management
- Operations
- People Management
- Customer/Market
- Strategic Thinking

The exact scoring formula and thresholds should be tuned during implementation rather than hard-coded prematurely.

## Reputation

Reputation is separate from Business Acumen.

- **Business Reputation** — reputation of an individual business
- **Owner Reputation** — broader reputation of the player as an owner

Reputation can influence opportunities, unlocks and expansion.

## Operating Style

Operating Style should be **inferred from behaviour**, not selected permanently during setup.

Possible styles may include:

- Hands-On Founder
- Conservative Builder
- Aggressive Expander
- Cost Optimizer
- Customer-First Operator
- Delegator

The style can evolve as the player changes behaviour.

---

# Approved feature expansion

The broader build includes the following 25 items:

1. Proper onboarding
2. Capital unlocks
3. Restaurant-format unlocks
4. Better setup
5. Staff selection
6. Owner involvement
7. Improved tutorial with visual highlighting
8. Business Acumen v1
9. Better feedback
10. Hiring manager with attributes
11. Supplier trade-offs
12. More meaningful events
13. Menu performance
14. Menu discontinuation
15. Basic reinvestment
16. Reputation system
17. Unlock progression
18. Player operating style
19. Advanced events
20. Better management/delegation
21. Business #2
22. Multi-business dashboard
23. Owner time allocation
24. Multiple managers
25. Portfolio management

These are **layers on top of the current simulation**, not separate game modes.

---

# Feature progression by stage

### Founder

Focus on the current first-business experience:

- Better onboarding and setup
- Capital/format availability
- Staff selection
- Owner involvement
- Full interface tutorial
- Basic Business Acumen
- Reputation introduction
- Supplier choices and trade-offs
- Events
- Menu performance
- Basic reinvestment
- Game feedback

### Operator

Increase the sophistication of the existing business:

- Stronger menu analytics
- Menu discontinuation
- More meaningful supplier decisions
- More advanced events
- Reinvestment choices
- Reputation growth
- Unlocks
- Operating Style discovery
- Early manager/delegation concepts
- Owner time/attention begins to matter
- Potential expansion opportunities

### Manager

Shift the player's role from operator to people/management:

- Hiring managers with attributes
- Delegation
- Manager performance
- Staff management
- Owner involvement and attention
- Advanced events
- Business Acumen development

### Multi-business Owner

Introduce the second-business problem:

- Business #2
- Small Café #2 may be possible before larger-format qualification
- Multiple managers
- Owner time allocation
- Owner attention as a scarce resource
- Multi-business dashboard
- Business-level reputation and performance comparison
- Capital allocation across businesses

### Portfolio Manager

The player manages the portfolio rather than only an individual business:

- Multiple businesses
- Multiple managers
- Portfolio dashboard
- Capital allocation
- Management capacity
- Owner time/attention allocation
- Portfolio risk and opportunities
- Expansion decisions

---

# Core design principle: success creates responsibility

Every major advantage should create a corresponding responsibility.

| Player gains | New responsibility |
|---|---|
| More capital | More capital at risk |
| More staff | Higher payroll and management |
| Better manager | Higher management cost/expectation |
| Delegation | Less direct control |
| Bigger format | More operational complexity |
| Higher reputation | Higher market expectations |
| Business #2 | Owner attention is divided |
| Multiple businesses | Portfolio risk |
| More money | More capital allocation decisions |

The game should become more difficult because the player's success creates more sophisticated problems.

---

# What has already been implemented on the broader-idea branch

The branch currently starts from the safe `main` version at commit:

`872b620092436889de4669451da2afa5851b7751`

The broader branch is currently **4 commits ahead of `main`**.

The first implementation pass has added a progression/feedback layer, including:

- A five-stage player journey:
  - Founder
  - Operator
  - Manager
  - Multi-business Owner
  - Portfolio Manager
- A visible current-stage / next-stage journey component
- A journey panel showing the full progression path
- A Game Feedback interface
- Feedback submission with rating/message and basic game context
- The progression component is mounted globally after setup

The implementation is intentionally an initial UI/progression layer. **The underlying simulation, progression rules, unlock economy and multi-business systems have not yet been fully implemented.**

The current branch has been deployed as a Vercel Preview. Production remains on `main`.

---

# Current blocker: deleted Supabase development environment

The previous development Supabase project was intentionally deleted as part of the earlier decision to consolidate/remove the old dev environment.

The new Vercel Preview deployment still had an environment configuration pointing to the deleted Supabase project:

`vvdodafzbmcjljtklznd.supabase.co`

As a result, the Preview setup flow currently fails with a DNS error such as:

`getaddrinfo ENOTFOUND vvdodafzbmcjljtklznd.supabase.co`

The current Supabase project is:

`xzkhhwlkiuvmyjngwbia`

Therefore the **Preview Vercel environment variables must be corrected to use the current Supabase project** before further testing/building. In particular, verify the Preview values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Production should **not** be changed while fixing the Preview environment.

Do not recreate the deleted development Supabase project merely to solve this issue unless explicitly decided later.

---

# What should be built next

After fixing the Preview Supabase environment, continue implementation in controlled batches.

## Phase 1 — Foundation expansion

1. Fix/verify Preview Supabase configuration.
2. Verify guest session → business setup → game session works end-to-end.
3. Improve onboarding.
4. Make login/account creation available at any stage.
5. Improve the business setup flow.
6. Add capital unlock structure.
7. Add restaurant/café format unlock structure.
8. Add player staff selection.
9. Add owner involvement.
10. Replace the current tutorial with a full interactive interface tour and visual highlighting.
11. Implement Business Acumen v1.
12. Implement Reputation v1.
13. Implement actionable progression milestones.
14. Improve feedback while preserving the existing simulation loop.

## Phase 2 — Deeper first-business simulation

1. Hiring manager with attributes.
2. Supplier trade-offs.
3. More meaningful contextual events.
4. Menu performance.
5. Menu discontinuation.
6. Basic reinvestment.
7. Advanced events.
8. Better management/delegation.
9. Operating Style inference and display.

## Phase 3 — Expansion

1. Business #2.
2. Allow valid non-linear expansion paths, including the possibility of Small Café #2 before Full Café qualification.
3. Multiple managers.
4. Owner time allocation.
5. Owner attention/management capacity.
6. Multi-business dashboard.

## Phase 4 — Portfolio

1. Portfolio management.
2. Portfolio-level capital allocation.
3. Portfolio risk/opportunity management.
4. Multiple-business reputation and performance.
5. Mature Owner Business Acumen and Operating Style.

---

# Implementation rules for the broader build

- **Do not pivot away from the existing game mechanism.**
- Preserve the current simulation engine as the authoritative source of numerical outcomes.
- Add features incrementally rather than replacing the whole game.
- Keep `main` as the safe production baseline until a broader branch version is tested and approved.
- Use controlled checkpoints after major phases.
- Do not make arbitrary progression thresholds until the underlying mechanics have been tested.
- Avoid exposing unnecessary complexity to new players; reveal systems progressively.
- Every new mechanic should create meaningful decisions and trade-offs.
- Test each phase end-to-end before moving to the next.

---

# Initial prototype scope (historical)

The original prototype was a Mumbai Café Simulator where the player starts a café, makes operational decisions, manages cash and profitability, handles events, and tries to survive and grow.

The broader direction now extends that prototype into a persistent owner progression and multi-business management simulation while retaining the café simulation as the core starting experience.
