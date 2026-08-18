# Business Simulator

AI-powered business management simulation game.

## Prototype v0.1

**Vertical slice:** Mumbai Café Simulator

The player starts a café in Mumbai, makes operational decisions, manages cash and profitability, handles customers and events, and tries to survive and grow.

## Product principles

- This is a game/simulation, not an AI business-idea validator.
- The simulation engine is authoritative for game state and numerical outcomes.
- OpenAI is used for controlled AI interactions, dialogue, and narrative—not authoritative economics.
- The browser never calls OpenAI directly and never receives the OpenAI API key.
- Supabase is the persistence/authentication layer.
- GitHub is the source of truth for code and project history.
- Player feedback is a first-class prototype feature.

## Planned architecture

Browser → application/backend security boundary → simulation engine → Supabase / OpenAI

The browser is treated as an untrusted client. Authoritative state changes happen server-side.

## Initial scope

1. Mumbai
2. Café
3. Daily/turn-based simulation
4. Demand, pricing, staff, marketing, operating costs, cash, reputation
5. Events and AI customer interactions
6. Profitability and bankruptcy conditions
7. End-of-run summary
8. Structured player feedback

Restaurant, fashion boutique, and additional cities such as Bangalore will follow only after the café vertical slice is playable and validated.
