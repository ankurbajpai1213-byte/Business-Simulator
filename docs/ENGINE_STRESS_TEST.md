# Engine Stress Test — v1

## Tests performed

The redesigned logic was checked against several simplified 90-day strategy paths and setup combinations before beta deployment.

### Repeated price increases

A player repeatedly choosing price increases no longer receives a guaranteed positive outcome.

Expected behaviour:
- Price increases raise average ticket.
- Demand falls as prices rise.
- Consecutive increases add extra demand and reputation pressure.
- A third consecutive increase is materially risky.
- A price-related customer event can appear after repeated increases.

A representative repeated-price path produced a cumulative loss over 90 days in the stress test, while balanced strategies remained viable. This removes the previously observed "raise prices every day" exploit.

### Balanced strategy

A mixed strategy using marketing, quality, inventory and occasional pricing remained profitable over a 90-day test with a healthy cash buffer.

### Marketing-only strategy

Marketing produced growth but also incurred recurring spend and did not create unlimited free demand.

### Quality-only strategy

Quality improved long-term demand/reputation but required upfront cash and did not create an immediate runaway advantage.

### Inventory-only strategy

Inventory protection helped avoid shortages but did not become a dominant strategy because excess inventory creates wastage and the action itself consumes cash.

### Starting capital / setup

Representative menu configurations were checked:

- ₹5L kiosk configuration: viable with a working-cash reserve.
- ₹5L small café with a broad beverage menu: rejected when setup exceeds capital.
- ₹10L small café: viable.
- ₹20L full-service restaurant: viable but leaves a much smaller initial reserve than higher-capital starts.
- ₹35L and ₹50L configurations: viable with substantial working capital.

### Event pacing

Events are no longer limited to a single supplier event pattern. The event pool includes operational, market, customer, opportunity and financial situations.

Events are state-aware where practical: low inventory can create stock pressure, repeated price increases can create price-related customer pressure, and high reputation can create positive publicity opportunities.

## Remaining beta risks

These should be observed with real players rather than over-engineered before the first beta:

1. Whether revenue/profit levels feel too generous or too punishing.
2. Whether the first meaningful event appears early enough.
3. Whether players understand why a price increase eventually hurts.
4. Whether Day 1's smaller decision set feels useful rather than restrictive.
5. Whether milestones increase retention without becoming distracting.
6. Whether day-end messages feel encouraging rather than repetitive.

The first beta should be used to calibrate these parameters using actual player behaviour.
