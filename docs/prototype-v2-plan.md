# Business Simulator — Prototype V2 Plan

## Goal
Make one café simulation understandable, reliable, and genuinely fun before expanding into multiple businesses, cities, franchises, or community features.

## P0 — Reliability
- Persist player feedback and the Maybe Later action.
- Verify session persistence and session lifecycle.
- Version game sessions so an in-progress run is not silently changed by a deployment.
- Log major decisions and business-state changes for analysis.

## P1 — First-time experience
- Add a positive disclaimer: this is a fun business simulation, not a business prediction or validation tool.
- Explain the objective and gameplay loop before setup.
- Let players name their café.
- Show available cash and setup cost while configuring the business.
- Explain clearly when a configuration cannot be afforded.
- Rename `New business` to `Start new game` because it currently creates a new simulation run rather than another business inside a career.
- Surface key business statistics near the decision area.

## P1 — Simulation depth
- Expand scenario variety and rebalance event frequency, especially recurring weather events.
- Ensure important decision types are encountered instead of allowing repeated scenarios to dominate.
- Persist meaningful decision effects beyond the current day.
- Model immediate, short-term, and long-term consequences.
- Generate situations from current business state where practical.
- Introduce progression milestones: early days, then meaningful time jumps such as one month and later periods.
- Increase difficulty as the business becomes more successful.

## P2 — Immersion
- Add situation-specific imagery and visual states.
- Use weather/scene changes where they materially improve immersion.
- Improve visual hierarchy, color, and feedback animations without obscuring decision consequences.

## Future architecture
Treat a business as a persistent entity with a stable ID and mutable simulation state. A future player/career can own multiple businesses and potentially turn a successful brand into multiple locations or franchises. Do not build those community features in this prototype; only avoid architectural decisions that would block them later.
