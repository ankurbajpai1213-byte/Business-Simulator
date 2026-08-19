# Business Simulator — Engine Logic v1

## 1. Purpose

The simulator models a small Indian food business over time. It is designed to teach trade-offs rather than reproduce a full accounting system.

The engine is deterministic for the same day/state except for small controlled market variation. Player decisions are the main driver of outcomes.

## 2. Starting a business

The player chooses:

- Starting capital: ₹5L, ₹10L, ₹20L, ₹35L or ₹50L.
- Location: high-footfall, residential or premium district.
- Business format: takeaway kiosk, small café or full-service restaurant.
- Menu: individual menu families within the infrastructure allowed by the format.

Setup spending is:

**Format setup + menu setup + licensing allowance + opening inventory**

The remainder becomes working cash. The player cannot spend more than the selected starting capital.

## 3. Business state

The engine remembers:

- Cash
- Daily revenue
- Daily profit
- Cumulative revenue
- Cumulative profit
- Daily customers
- Total customers
- Reputation
- Price index
- Marketing level
- Staff level
- Service capacity
- Product quality
- Inventory
- Supplier cost multiplier
- Recent price behaviour
- Profit/loss streaks
- Events and event choices
- Milestones
- Day history

This memory is important: decisions affect future days rather than being isolated button presses.

## 4. Daily cycle

Each playable day follows this sequence:

1. Player sees the current business state.
2. Player makes one strategic decision.
3. Any unresolved business event is resolved.
4. The engine calculates customer demand.
5. Customers are capped by service capacity.
6. Revenue is calculated from customers and average ticket.
7. Operating costs are calculated.
8. Daily profit/loss is calculated.
9. Cash, inventory, reputation and marketing are updated.
10. Milestones are checked.
11. A contextual day-end message is generated.
12. The engine may create the next business event.

## 5. Customer demand

Demand is influenced by:

- Location attractiveness
- Price attractiveness
- Product quality
- Reputation
- Marketing
- Menu appeal
- Staff/service capacity
- Inventory availability
- Temporary market conditions

No single variable should guarantee success.

## 6. Pricing

The starting price index is 100.

A price decision increases the index by 6 points, up to 140.

Price has two effects:

- Higher price increases the average ticket.
- Higher price reduces customer demand.

Repeated increases have an additional penalty. The second and third consecutive increases are increasingly damaging, and three or more consecutive increases also reduce reputation.

Premium locations tolerate price increases somewhat better than residential locations.

The intended lesson is:

**A price increase can be smart. Repeated price increases are not automatically smart.**

## 7. Marketing

Marketing costs cash and increases short-term demand.

Its effect fades over time, so repeatedly spending without watching cash is risky.

Marketing is therefore a growth lever rather than free permanent demand.

## 8. Staffing

Hiring costs cash and increases staff and service capacity.

More staff can support more customers, but payroll also increases. Hiring is therefore useful when capacity or service is actually constraining the business.

## 9. Quality

Quality investment costs cash and improves the quality factor used in demand.

Higher quality also supports reputation over time.

Quality is deliberately a slower-burn investment than marketing.

## 10. Inventory

Inventory falls as customers are served.

Low inventory reduces demand because some sales cannot be fulfilled.

Very high inventory creates a small wastage cost.

This creates the intended trade-off:

**Too little inventory → lost sales. Too much inventory → tied-up cash and wastage.**

## 11. Financial model

Revenue:

**Customers × average ticket**

Average ticket is influenced by menu mix and the price index.

Operating costs include:

- Monthly rent converted to a daily expense
- Payroll
- Cost of goods sold
- Marketing spend
- Menu operating costs
- Capacity/service stress
- Inventory wastage

Profit:

**Revenue − operating costs**

Cash:

**Previous cash + daily profit − immediate decision/event spending**

The game separates cash from cumulative profit so a player can be profitable but still have a temporarily tight cash position.

## 12. Reputation

Reputation is not simply a profit meter.

It responds to:

- Profitability direction
- Product quality
- Service pressure
- Repeated price increases
- Negative business events
- Some positive event outcomes

A business can therefore make money while damaging its reputation, or have a bad financial day while preserving customer goodwill.

## 13. Events

Events begin after the early setup period and are selected from a pool rather than following one fixed scripted sequence.

Possible event families include:

- Supplier price increase
- Stock shortage
- Price-related customer reaction
- Rain / weaker footfall
- Competitor promotion
- Local event opportunity
- Equipment issue
- Positive local mention
- Bulk order opportunity
- Staff absence

Event probability is state-aware. For example:

- Low inventory makes stock problems more relevant.
- Repeated price increases make price-related customer reactions more relevant.
- High reputation can create positive publicity opportunities.

Events have options with different immediate costs and different strategic consequences.

## 14. Event philosophy

Events are not simply good or bad.

Each choice should have a trade-off:

- Spend now to solve a root problem.
- Spend less to contain the problem.
- Do nothing and accept future risk.

The player should learn that cheap is not always best and expensive is not always best.

## 15. Day-end messaging

The engine generates a short contextual message based on the actual outcome.

Examples:

- “Today paid off. 📈 Your business moved in the right direction. Enjoy this one.”
- “Careful. Costs are catching up. A rough day is information, not a verdict.”
- “Your customers noticed. 💸 The extra margin came with a cost.”
- “Now we're cooking. 🔥 Three good days in a row.”
- “Another day in the books. Sometimes boring is profitable.”

The message is reinforcement, not a score saying whether the player is correct.

## 16. Milestones

Milestones reward progress, competence, survival and recovery.

Examples:

- Open for Business
- First Sale
- First Customer
- 100 / 500 / 1,000 Customers
- ₹1L / ₹5L / ₹10L cumulative revenue
- First profitable day
- 3 / 5 profitable days in a row
- Crisis survived
- Bounce back after a loss
- Reputation 60 / 80
- Survive 5 / 10 / 30 days

Milestones are stored as unlocked state and can be displayed separately from the main gameplay screen.

## 17. Strategic balance rules

The engine should continuously be checked for these failure modes:

- One decision always dominates.
- Repeating a decision indefinitely produces easy wealth.
- A player can never recover from a mistake.
- Random events overwhelm player decisions.
- Events become predictable.
- Costs are disconnected from business scale.
- Capacity has no practical consequence.
- Price increases produce only positive outcomes.
- Marketing produces permanent free growth.
- Inventory can be ignored without consequence.

The target is not perfect real-world accuracy. The target is **plausible business economics + understandable trade-offs + meaningful decisions + quick gameplay**.

## 18. Analytics model

Every meaningful decision should be recorded with enough state to reconstruct what happened.

Useful data includes:

- Player ID
- Game/session ID
- Day
- Starting capital
- Location
- Format
- Menu
- Decision
- Event and event option
- Cash before/after
- Revenue
- Profit
- Customers
- Reputation
- Price index
- Inventory
- Staff
- Quality
- Milestones
- Feedback responses
- Feedback skips

This allows beta testing to measure actual behaviour rather than relying only on opinions.

## 19. Design principle

The core loop is:

**Choose → experience the consequence → understand what changed → continue.**

The simulator should feel like a quick business game, not an accounting spreadsheet and not a customer-chat simulator.
