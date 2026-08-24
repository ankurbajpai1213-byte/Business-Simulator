export type Location = "high-footfall" | "residential" | "premium";
export type BusinessFormat = "takeaway" | "small-cafe" | "full-cafe";
export type Infrastructure = "basic" | "beverage" | "kitchen";
export type MenuItemId = "filter-coffee" | "instant-coffee" | "masala-chai" | "lemon-tea" | "bun-maska" | "butter-toast" | "samosa" | "vada-pav" | "veg-sandwich" | "poha-upma" | "espresso" | "cappuccino" | "cold-coffee" | "milkshake" | "grilled-sandwich" | "fries" | "pasta" | "rice-meal" | "biryani" | "paneer-main" | "dessert";
export type MenuItem = { id: MenuItemId; name: string; setupCost: number; weeklyCost: number; ticketImpact: number; demandImpact: number; infrastructure: Infrastructure };
export const MENU_ITEMS: MenuItem[] = [
  { id: "filter-coffee", name: "Filter Coffee", setupCost: 20000, weeklyCost: 5000, ticketImpact: 10, demandImpact: 4, infrastructure: "basic" },
  { id: "instant-coffee", name: "Instant Coffee", setupCost: 10000, weeklyCost: 4500, ticketImpact: 5, demandImpact: 4, infrastructure: "basic" },
  { id: "masala-chai", name: "Masala Chai", setupCost: 12000, weeklyCost: 3500, ticketImpact: 8, demandImpact: 5, infrastructure: "basic" },
  { id: "lemon-tea", name: "Lemon / Ginger Tea", setupCost: 10000, weeklyCost: 3000, ticketImpact: 5, demandImpact: 3, infrastructure: "basic" },
  { id: "bun-maska", name: "Bun Maska", setupCost: 15000, weeklyCost: 4000, ticketImpact: 20, demandImpact: 6, infrastructure: "basic" },
  { id: "butter-toast", name: "Butter / Jam Toast", setupCost: 18000, weeklyCost: 4500, ticketImpact: 25, demandImpact: 5, infrastructure: "basic" },
  { id: "samosa", name: "Samosa", setupCost: 20000, weeklyCost: 5500, ticketImpact: 25, demandImpact: 7, infrastructure: "basic" },
  { id: "vada-pav", name: "Vada Pav", setupCost: 25000, weeklyCost: 6500, ticketImpact: 30, demandImpact: 9, infrastructure: "basic" },
  { id: "veg-sandwich", name: "Simple Veg Sandwich", setupCost: 35000, weeklyCost: 7000, ticketImpact: 40, demandImpact: 8, infrastructure: "basic" },
  { id: "poha-upma", name: "Poha / Upma", setupCost: 30000, weeklyCost: 6000, ticketImpact: 30, demandImpact: 6, infrastructure: "basic" },
  { id: "espresso", name: "Espresso", setupCost: 75000, weeklyCost: 9000, ticketImpact: 45, demandImpact: 7, infrastructure: "beverage" },
  { id: "cappuccino", name: "Cappuccino / Latte", setupCost: 120000, weeklyCost: 12000, ticketImpact: 85, demandImpact: 10, infrastructure: "beverage" },
  { id: "cold-coffee", name: "Cold Coffee", setupCost: 60000, weeklyCost: 8000, ticketImpact: 65, demandImpact: 9, infrastructure: "beverage" },
  { id: "milkshake", name: "Milkshakes", setupCost: 70000, weeklyCost: 9000, ticketImpact: 75, demandImpact: 8, infrastructure: "beverage" },
  { id: "grilled-sandwich", name: "Grilled / Club Sandwich", setupCost: 90000, weeklyCost: 10000, ticketImpact: 90, demandImpact: 10, infrastructure: "kitchen" },
  { id: "fries", name: "Fries / Loaded Fries", setupCost: 70000, weeklyCost: 8500, ticketImpact: 70, demandImpact: 8, infrastructure: "kitchen" },
  { id: "pasta", name: "Pasta / Noodles", setupCost: 110000, weeklyCost: 11000, ticketImpact: 100, demandImpact: 9, infrastructure: "kitchen" },
  { id: "rice-meal", name: "Rice & Curry Meal", setupCost: 120000, weeklyCost: 13000, ticketImpact: 120, demandImpact: 8, infrastructure: "kitchen" },
  { id: "biryani", name: "Biryani", setupCost: 140000, weeklyCost: 15000, ticketImpact: 150, demandImpact: 10, infrastructure: "kitchen" },
  { id: "paneer-main", name: "Paneer / Chicken Main", setupCost: 150000, weeklyCost: 16000, ticketImpact: 160, demandImpact: 9, infrastructure: "kitchen" },
  { id: "dessert", name: "Desserts", setupCost: 80000, weeklyCost: 9000, ticketImpact: 80, demandImpact: 6, infrastructure: "kitchen" },
];
export type GameEventId = "bad-review" | "supplier-increase" | "staff-absence" | "rain" | "competitor-promotion" | "local-event" | "equipment-issue" | "viral-mention" | "bulk-order" | "stock-shortage"
  | "health-inspection" | "rent-hike" | "delivery-app" | "monsoon-flood" | "power-cut" | "staff-poached" | "food-blogger" | "licence-renewal" | "construction" | "rival-closes"
  | "tax-notice" | "lease-offer" | "rival-opens" | "metro-station" | "staff-raise" | "water-shortage" | "heatwave"
  | "festival-rush" | "exam-season" | "long-weekend" | "pest-notice" | "theft" | "allergy-complaint" | "review-bombing"
  | "newspaper-feature" | "influencer-offer" | "catering-enquiry" | "musician-offer" | "milk-price"
  | "supplier-exclusive" | "payment-outage" | "rider-strike" | "struggling-cook" | "ageing-server" | "family-illness" | "loyal-underperformer";
export type GameEvent = { id: GameEventId; title: string; narrative: string; severity: 1 | 2 | 3; options: Array<{ id: string; title: string; description: string; cost: number }> };
export type Decision = "raise-price" | "lower-price" | "marketing" | "hire" | "quality" | "inventory" | "inventory-2" | "inventory-3" | "no-action" | "supply-contract" | "hire-manager" | "extend-hours" | "loyalty-programme" | "reinvest";
export type DayRecord = { day: number; decision: Decision; eventId: GameEventId | null; eventOption: string | null; cashBefore: number; cashAfter: number; revenue: number; profit: number; customers: number; reputation: number; priceIndex: number; inventory: number; wastage: number };
export type GameState = { version: 4; setupComplete: boolean; businessName: string; day: number; cash: number; revenue: number; profit: number; customers: number; totalCustomers: number; cumulativeRevenue: number; cumulativeProfit: number; reputation: number; priceIndex: number; marketing: number; staff: number; quality: number; inventory: number; wastageToday: number; weatherToday?: "clear" | "hot" | "rain" | "festival" | "cold"; location: Location; capital: number; format: BusinessFormat; menu: MenuItemId[]; setupCost: number; serviceCapacity: number; currentEvent: GameEvent | null; eventHistory: string[]; dayHistory: DayRecord[]; consecutivePriceRaises: number; priceChangesLast7: number; profitableDays: number; lossDays: number; profitStreak: number; lossStreak: number; supplierCostMultiplier: number; supplyContract: boolean; manager: boolean; extendedHours: boolean; loyalty: boolean; lastEventDay: number; milestones: string[]; lastDayMessage: string; seed: number; daysSinceStockout: number; lowCashSeen: boolean; eventsHandled: number; bestCapacity: number; profitableMonths: number; monthProfit: number; monthWages: number; monthRevenue: number; customersBeforeRaise: number; raiseTestDay: number; lastInterruptDay: number; managerProfile?: { traits: string[]; hiredOnDay: number; salaryDaily: number } | null; supplierProfile?: { traits: string[]; signedOnDay: number } | null; investments?: string[]; crew?: Record<string, number>; ownerRole?: "hands-on" | "balanced" | "delegating"; crewWage?: number };
export const CAPITAL_OPTIONS = [500000, 1000000, 2000000, 3500000, 5000000];
export const LOCATION_OPTIONS: Array<{ id: Location; name: string; rentMonthly: number; demand: number; description: string }> = [
  { id: "high-footfall", name: "High-footfall", rentMonthly: 100000, demand: 1.2, description: "Higher demand and visibility, but the highest volume pressure." },
  { id: "residential", name: "Residential", rentMonthly: 80000, demand: 0.9, description: "Lower rent with steadier repeat neighbourhood demand." },
  { id: "premium", name: "Premium district", rentMonthly: 175000, demand: 1.0, description: "Highest rent, but stronger premium pricing potential." },
];
export const FORMAT_OPTIONS: Array<{ id: BusinessFormat; name: string; cost: number; staff: number; capacity: number; description: string }> = [
  { id: "takeaway", name: "Takeaway kiosk", cost: 120000, staff: 55, capacity: 120, description: "Small footprint with a quick-service menu: tea, coffee, buns and simple snacks." },
  { id: "small-cafe", name: "Small café", cost: 250000, staff: 65, capacity: 200, description: "Seating plus beverage equipment and a broader café menu." },
  { id: "full-cafe", name: "Full-service restaurant", cost: 450000, staff: 72, capacity: 300, description: "Full seating and kitchen infrastructure for a broad food menu." },
];
export const INITIAL_STATE: GameState = { version: 4, setupComplete: false, businessName: "", day: 1, cash: 0, revenue: 0, profit: 0, customers: 0, totalCustomers: 0, cumulativeRevenue: 0, cumulativeProfit: 0, reputation: 50, priceIndex: 100, marketing: 25, staff: 0, quality: 65, inventory: 75, wastageToday: 0, location: "high-footfall", capital: 0, format: "small-cafe", menu: [], setupCost: 0, serviceCapacity: 0, currentEvent: null, eventHistory: [], dayHistory: [], consecutivePriceRaises: 0, priceChangesLast7: 0, profitableDays: 0, lossDays: 0, profitStreak: 0, lossStreak: 0, supplierCostMultiplier: 1, supplyContract: false, manager: false, extendedHours: false, loyalty: false, lastEventDay: 0, milestones: [], lastDayMessage: "", seed: 0, daysSinceStockout: 0, lowCashSeen: false, eventsHandled: 0, bestCapacity: 0, profitableMonths: 0, monthProfit: 0, monthWages: 0, monthRevenue: 0, customersBeforeRaise: 0, raiseTestDay: 0, lastInterruptDay: 0, managerProfile: null, supplierProfile: null, investments: [], crew: {}, ownerRole: "balanced", crewWage: 0 };
export function upgradeLegacyState(raw: Partial<GameState>): GameState {
  if (raw.version === 4 && typeof raw.wastageToday === "number" && typeof raw.seed === "number") return raw as GameState;
  return { ...INITIAL_STATE, ...raw, version: 4, setupComplete: raw.setupComplete ?? true, businessName: raw.businessName ?? "", capital: Number(raw.capital ?? raw.cash ?? 500000), format: raw.format ?? "small-cafe", menu: raw.menu?.length ? raw.menu : ["filter-coffee", "instant-coffee", "masala-chai", "bun-maska", "vada-pav", "veg-sandwich"], setupCost: Number(raw.setupCost ?? 0), serviceCapacity: Number(raw.serviceCapacity ?? 200), currentEvent: raw.currentEvent ?? null, eventHistory: raw.eventHistory ?? [], dayHistory: (raw.dayHistory ?? []).map(record => ({ ...record, inventory: Number((record as Partial<DayRecord>).inventory ?? 0), wastage: Number((record as Partial<DayRecord>).wastage ?? 0) })), totalCustomers: Number(raw.totalCustomers ?? raw.customers ?? 0), cumulativeRevenue: Number(raw.cumulativeRevenue ?? raw.revenue ?? 0), cumulativeProfit: Number(raw.cumulativeProfit ?? raw.profit ?? 0), inventory: Math.max(0, Math.min(100, Number(raw.inventory ?? 75))), wastageToday: Number(raw.wastageToday ?? 0), consecutivePriceRaises: Number(raw.consecutivePriceRaises ?? 0), priceChangesLast7: Number(raw.priceChangesLast7 ?? 0), profitableDays: Number(raw.profitableDays ?? 0), lossDays: Number(raw.lossDays ?? 0), profitStreak: Number(raw.profitStreak ?? 0), lossStreak: Number(raw.lossStreak ?? 0), supplierCostMultiplier: Number(raw.supplierCostMultiplier ?? 1), supplyContract: Boolean(raw.supplyContract), manager: Boolean(raw.manager), extendedHours: Boolean(raw.extendedHours), loyalty: Boolean(raw.loyalty), lastEventDay: Number(raw.lastEventDay ?? 0), milestones: raw.milestones ?? [], lastDayMessage: raw.lastDayMessage ?? "", seed: Number(raw.seed ?? Math.floor(Math.random() * 2147483647)), daysSinceStockout: Number(raw.daysSinceStockout ?? 0), lowCashSeen: Boolean(raw.lowCashSeen), eventsHandled: Number(raw.eventsHandled ?? 0), bestCapacity: Number(raw.bestCapacity ?? raw.serviceCapacity ?? 0), profitableMonths: Number(raw.profitableMonths ?? 0), monthProfit: Number(raw.monthProfit ?? 0), monthWages: Number(raw.monthWages ?? 0), monthRevenue: Number(raw.monthRevenue ?? 0), customersBeforeRaise: Number(raw.customersBeforeRaise ?? 0), raiseTestDay: Number(raw.raiseTestDay ?? 0), lastInterruptDay: Number(raw.lastInterruptDay ?? 0), managerProfile: raw.managerProfile ?? null, supplierProfile: raw.supplierProfile ?? null, investments: Array.isArray(raw.investments) ? raw.investments : [], crew: raw.crew ?? {}, ownerRole: raw.ownerRole ?? "balanced", crewWage: Number(raw.crewWage ?? 0) };
}
export function formatINR(value: number): string { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
export function calculateSetup(capital: number, location: Location, format: BusinessFormat, menu: MenuItemId[]) {
  const formatOption = FORMAT_OPTIONS.find(x => x.id === format); const locationOption = LOCATION_OPTIONS.find(x => x.id === location); if (!formatOption || !locationOption) throw new Error("Invalid business configuration.");
  const selected = menu.map(id => MENU_ITEMS.find(x => x.id === id)).filter(Boolean) as MenuItem[]; if (selected.length !== menu.length) throw new Error("Invalid menu item.");
  if (selected.some(item => item.infrastructure === "beverage") && format === "takeaway") throw new Error("Specialty drinks require a small café or full-service restaurant."); if (selected.some(item => item.infrastructure === "kitchen") && format !== "full-cafe") throw new Error("Kitchen menu items require a full-service restaurant.");
  const menuCost = selected.reduce((sum, item) => sum + item.setupCost, 0); const licensing = 50000; const openingInventory = Math.max(30000, menu.length * 15000); const setupCost = formatOption.cost + menuCost + licensing + openingInventory;
  return { setupCost, reserve: capital - setupCost, staff: formatOption.staff, serviceCapacity: formatOption.capacity, rentMonthly: locationOption.rentMonthly };
}
export function createConfiguredState(input: { capital: number; location: Location; format: BusinessFormat; menu: MenuItemId[]; businessName?: string; crew?: Record<string, number>; ownerRole?: "hands-on" | "balanced" | "delegating"; crewWage?: number; crewCapacity?: number; crewQuality?: number; crewStaff?: number; hiringCost?: number }): GameState {
  if (!CAPITAL_OPTIONS.includes(input.capital)) throw new Error("Invalid capital."); if (!input.menu.length) throw new Error("Choose at least one menu item."); const result = calculateSetup(input.capital, input.location, input.format, input.menu); const hiring = Math.max(0, Math.round(input.hiringCost ?? 0)); if (result.reserve - hiring <= 0) throw new Error("Startup configuration exceeds available capital.");
  return { ...INITIAL_STATE, setupComplete: true, businessName: (input.businessName ?? "").trim().slice(0, 40), capital: input.capital, cash: result.reserve - hiring, location: input.location, format: input.format, menu: input.menu, setupCost: result.setupCost + hiring, staff: input.crewStaff ?? result.staff, serviceCapacity: input.crewCapacity ?? result.serviceCapacity, quality: input.crewQuality ?? 65, crew: input.crew ?? {}, ownerRole: input.ownerRole ?? "balanced", crewWage: Math.round(input.crewWage ?? 0), inventory: 75, milestones: ["open-business"], seed: Math.floor(Math.random() * 2147483647) };
}
function menuStats(menu: MenuItem[]) { return menu.reduce((acc, item) => ({ ticket: acc.ticket + item.ticketImpact, demand: acc.demand + item.demandImpact, weeklyCost: acc.weeklyCost + item.weeklyCost }), { ticket: 0, demand: 0, weeklyCost: 0 }); }
export function getAvailableDecisions(state: GameState): Decision[] {
  let decisions: Decision[]; if (state.day === 1) decisions = ["marketing", "hire", "inventory", "inventory-2", "inventory-3", "no-action"]; else if (state.day === 2) decisions = ["marketing", "hire", "quality", "inventory", "inventory-2", "inventory-3", "no-action"]; else decisions = ["raise-price", "lower-price", "marketing", "hire", "quality", "inventory", "inventory-2", "inventory-3", "no-action"];
  // Strategic moves become available once the business is past its first three months.
  if (state.day > 90) {
    if (!state.supplyContract) decisions.push("supply-contract");
    if (!state.manager) decisions.push("hire-manager");
    if (!state.extendedHours) decisions.push("extend-hours");
    if (!state.loyalty) decisions.push("loyalty-programme");
  }
  // Putting money back into the place becomes possible once it is established.
  if (state.day >= 120) decisions.push("reinvest");
  return decisions.filter(decision => { if (decision === "raise-price" && state.priceIndex >= 140) return false; if (decision === "lower-price" && state.priceIndex <= 100) return false; if (decision.startsWith("inventory") && state.inventory >= 100) return false; if (decision === "quality" && state.quality >= 100) return false; if (decision === "marketing" && state.marketing >= 100) return false; if (decision === "hire" && state.staff >= 100 && state.serviceCapacity >= 600) return false; return decision === "no-action" || decision === "raise-price" || decision === "lower-price" || state.cash >= getDecisionCost(decision); });
}
export function getDecisionCost(decision: Decision): number { return { "raise-price": 0, "lower-price": 0, marketing: 10000, hire: 18000, quality: 12000, inventory: 8000, "inventory-2": 15000, "inventory-3": 21000, "no-action": 0, "supply-contract": 35000, "hire-manager": 45000, "extend-hours": 22000, "loyalty-programme": 30000, reinvest: 0 }[decision]; }
export function isDecisionAvailable(state: GameState, decision: Decision): boolean { return getAvailableDecisions(state).includes(decision); }
export function applyDecision(state: GameState, decision: Decision): GameState {
  if (!isDecisionAvailable(state, decision)) return state; const next = { ...state };
  switch (decision) { case "raise-price": next.priceIndex = Math.min(140, next.priceIndex + 6); next.consecutivePriceRaises += 1; next.priceChangesLast7 += 1; break; case "lower-price": next.priceIndex = Math.max(100, next.priceIndex - 6); next.consecutivePriceRaises = 0; next.priceChangesLast7 += 1; break; case "marketing": next.cash -= 10000; next.marketing = Math.min(100, next.marketing + 14); break; case "hire": next.cash -= 18000; next.staff = Math.min(100, next.staff + 10); next.serviceCapacity = Math.min(next.serviceCapacity + 15, 600); break; case "quality": next.cash -= 12000; next.quality = Math.min(100, next.quality + 7); break; case "inventory": next.cash -= 8000; next.inventory = Math.min(100, next.inventory + 30); break; case "inventory-2": next.cash -= 15000; next.inventory = Math.min(100, next.inventory + 60); break; case "inventory-3": next.cash -= 21000; next.inventory = Math.min(100, next.inventory + 90); break; case "supply-contract": next.cash -= 35000; next.supplyContract = true; break;
    case "hire-manager": next.cash -= 45000; next.manager = true; next.staff = Math.min(100, next.staff + 8); break;
    case "extend-hours": next.cash -= 22000; next.extendedHours = true; next.serviceCapacity = Math.min(600, next.serviceCapacity + 40); break;
    case "loyalty-programme": next.cash -= 30000; next.loyalty = true; break;
    // Reinvestment is priced by whichever project was chosen; the route applies it.
    case "reinvest": break;
    case "no-action": break; }
  if (decision !== "raise-price") next.consecutivePriceRaises = 0; return next;
}
import { managerEffects, supplierEffects, type Manager, type Supplier } from "./people";
import { investmentEffects } from "./reinvestment";

export type Weather = { id: "clear" | "hot" | "rain" | "festival" | "cold"; label: string; demand: number };
export function weatherFor(seed: number, day: number): Weather {
  let x = (seed ^ Math.imul(day + 0x2545f491, 0x9e3779b1)) >>> 0;
  x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b) >>> 0; x ^= x >>> 13;
  const roll = (x >>> 0) / 4294967296;
  if (roll < 0.10) return { id: "rain", label: "Rain", demand: 0.88 };
  if (roll < 0.22) return { id: "hot", label: "Hot day", demand: 1.06 };
  if (roll < 0.30) return { id: "cold", label: "Cold snap", demand: 0.96 };
  if (roll < 0.36) return { id: "festival", label: "Festival crowds", demand: 1.18 };
  return { id: "clear", label: "Clear", demand: 1 };
}

function seededNoise(seed: number, day: number): number { let x = (seed ^ Math.imul(day + 0x9e3779b9, 0x85ebca6b)) >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0; x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0; x ^= x >>> 16; return 0.85 + (x / 4294967296) * 0.30; }
function priceDemandFactor(state: GameState): number { const tolerance = state.location === "premium" ? 0.10 : state.location === "high-footfall" ? 0.03 : 0; const baseIncrease = Math.max(0, state.priceIndex - 100) / 100; let elasticity = 1 - Math.min(0.52, baseIncrease * (1.20 - tolerance)); if (state.consecutivePriceRaises >= 2) elasticity -= Math.min(0.20, (state.consecutivePriceRaises - 1) * 0.065); if (state.consecutivePriceRaises >= 4) elasticity -= 0.07; return Math.max(0.28, elasticity); }
function serviceFactor(state: GameState): number { const targetStaff = state.format === "takeaway" ? 55 : state.format === "small-cafe" ? 65 : 72; return Math.min(1.08, 0.84 + state.staff / Math.max(1, targetStaff) * 0.16); }
function addMilestones(state: GameState, previousProfit: number): string[] {
  const unlocked = new Set(state.milestones);
  const add = (id: string, condition: boolean) => { if (condition) unlocked.add(id); };
  const daysOpen = Math.max(1, state.day - 1);

  // Survived — honest time served.
  add("open-business", true);
  add("week-one", state.day > 7);
  add("month-one", state.day > 30);
  add("quarter-one", state.day > 90);
  add("half-year", state.day > 182);
  add("full-year", state.day > 365);

  // Judgement — earned by how you played, not how long.
  add("steady-hand", state.daysSinceStockout >= 30);
  add("fair-price", state.raiseTestDay > 0 && state.day - state.raiseTestDay >= 7 && state.customers >= state.customersBeforeRaise * 0.95);
  add("bounced-back", state.lowCashSeen && state.profit > 0 && state.cash > Math.abs(state.profit || 1) * 60);
  add("word-gets-around", state.reputation >= 80 && state.quality >= 70);
  add("read-the-room", state.eventsHandled >= 3 && state.lossStreak === 0);
  add("lean-operator", state.monthRevenue > 0 && state.monthProfit > 0 && state.monthWages < state.monthRevenue * 0.25);
  add("full-house", state.serviceCapacity > 0 && state.customers >= state.serviceCapacity * 0.95);

  // Built something — real ambition.
  add("first-profit", state.profitableDays >= 1);
  add("profitable-month", state.profitableMonths >= 1);
  add("profit-5l", state.cumulativeProfit >= 500000);
  add("profit-20l", state.cumulativeProfit >= 2000000);
  add("served-5000", state.totalCustomers >= 5000);
  add("supply-secured", state.supplyContract);
  add("manager-hired", state.manager);
  add("doubled-capacity", state.bestCapacity > 0 && state.serviceCapacity >= state.bestCapacity * 2);
  add("bounce-back", previousProfit < 0 && state.profit > 0);
  add("crisis-survived", state.eventHistory.length >= 1 && state.cash > 0);
  void daysOpen;
  return [...unlocked];
}

function dayMessage(state: GameState, decision: Decision, previous: GameState): string { const profitDelta = state.profit - previous.profit; if (state.wastageToday > 2000) return "You're carrying too much stock. 📦 Some of it went to waste today — cash can't earn anything while it's sitting on the shelf."; if (state.inventory < 20) return "Careful — the shelves are getting bare. One more busy day could mean lost sales."; if (state.profitStreak >= 3) return "Now we're cooking. 🔥 Three good days in a row. Enjoy the win — tomorrow still has a vote."; if (state.profit < 0 && state.lossStreak >= 2) return "Oof. The business is feeling it. Take a breath — one smart move can change the direction."; if (decision === "raise-price" && state.consecutivePriceRaises >= 3) return "Your customers noticed. 💸 The extra margin came with a cost. Maybe give the prices a little breathing room."; if (decision === "lower-price" && state.profit > previous.profit) return "A little breathing room helped. Lower prices can recover demand when you've pushed too far."; if (decision === "raise-price" && state.profit > previous.profit) return "That price move paid off. ☕ Just remember: what works today may not work three days in a row."; if (decision === "no-action" && state.profit > 0) return "A steady day. 📈 Sometimes the smartest move is not to fix what isn't broken."; if (decision === "no-action" && state.profit < 0) return "You held steady today. That's useful information — now watch what the business is telling you."; if (state.profit > 0 && profitDelta > 0) return "Today paid off. 📈 Your business moved in the right direction. Enjoy this one."; if (state.profit > 0) return "A solid day. Nothing flashy — just a business doing its job."; if (state.profit < 0 && previous.profit >= 0) return "Careful. Costs are catching up. A rough day is information, not a verdict."; if (state.reputation > previous.reputation) return "People seem to like what you're doing. ⭐ Keep that feeling going."; if (state.reputation < previous.reputation) return "The customers have opinions. 😬 Watch what changed today before making the next move."; return "Another day in the books. Sometimes boring is profitable. Tomorrow, we try again."; }
export function advanceDay(state: GameState, decision: Decision = "marketing", turnSpend = 0, rainToday = false, resolvedEventId: GameEventId | null = null, resolvedEventOption: string | null = null): GameState {
  const location = LOCATION_OPTIONS.find(x => x.id === state.location)!; const items = state.menu.map(id => MENU_ITEMS.find(x => x.id === id)).filter(Boolean) as MenuItem[]; const menu = menuStats(items); const priceFactor = priceDemandFactor(state); const qualityFactor = 0.68 + state.quality / 230; const reputationFactor = 0.55 + state.reputation / 200 + (state.loyalty ? 0.06 : 0); const marketingFactor = 1 + state.marketing / 360;
  // Word of mouth: spending on reach only compounds when the product is worth talking about.
  const wordOfMouth = state.marketing >= 45 && state.quality >= 72 ? 1.07 : 1; const menuFactor = Math.min(1.80, 0.88 + menu.demand / 85); const service = serviceFactor(state) * (state.extendedHours ? 1.10 : 1) * managerEffects((state.managerProfile ?? null) as Manager | null).throughput;
  const builtCapacity = state.serviceCapacity + investmentEffects(state.investments ?? []).capacityBonus; const marketNoise = seededNoise(state.seed, state.day); const weather = rainToday ? { id: "rain" as const, label: "Rain", demand: 1 } : weatherFor(state.seed, state.day);
  const rainPenalty = rainToday ? 0.88 : 1; const stockPenalty = state.inventory < 15 ? 0.68 : state.inventory < 30 ? 0.82 : state.inventory < 45 ? 0.92 : 1;
  const demand = location.demand * priceFactor * qualityFactor * reputationFactor * marketingFactor * menuFactor * service * marketNoise * rainPenalty * stockPenalty * wordOfMouth * weather.demand; const demandCustomers = Math.max(0, Math.min(state.serviceCapacity, Math.round(105 * demand))); const customers = Math.min(demandCustomers, builtCapacity, Math.max(0, Math.floor(state.inventory * 9))); const averageTicket = Math.round((280 + 35 * Math.sqrt(Math.max(0, menu.ticket) / 10)) * (state.priceIndex / 100)); const revenue = customers * averageTicket;
  // Who you hired, who you buy from, and what you have built all change the sums.
  const mgr = managerEffects((state.managerProfile ?? null) as Manager | null);
  const sup = supplierEffects((state.supplierProfile ?? null) as Supplier | null);
  const inv = investmentEffects(state.investments ?? []);
  const rent = Math.round((location.rentMonthly * inv.rentMultiplier) / 30); const payroll = (state.crewWage ? state.crewWage + 900 : 7000 + Math.round(state.staff * 60)) + (state.manager ? (state.managerProfile?.salaryDaily ?? 2600) : 0) + (state.extendedHours ? 1900 : 0) + (state.loyalty ? 700 : 0) + inv.payrollDaily; const cogs = Math.round(revenue * (0.27 * sup.cogsFactor + (state.supplierCostMultiplier - 1) * 0.45 + (state.supplyContract ? 0.035 : 0))); const marketingSpend = Math.round(Math.max(0, state.marketing - 25) * 85); const menuOperatingCost = Math.round(menu.weeklyCost / 7); const capacityStress = customers >= state.serviceCapacity * 0.9 ? 3500 : customers >= state.serviceCapacity * 0.78 ? 1200 : 0; // A wider menu means more ingredients moving per customer.
  const menuBreadthFactor = 1 + Math.max(0, items.length - 5) * 0.04;
  const stockUsed = customers > 0 ? Math.max(2, Math.round((customers / 18) * menuBreadthFactor)) : 0; const wastage = state.inventory > 82 ? Math.round((state.inventory - 82) * 180 * mgr.wastageFactor) : 0; const stockoutCost = state.inventory - stockUsed < 0 ? Math.round(Math.abs(state.inventory - stockUsed) * 250) : 0; const serviceQualityPenalty = (customers >= state.serviceCapacity * 0.98 ? 2 : customers >= state.serviceCapacity * 0.9 ? 1 : 0) * (1 - mgr.serviceRelief); const operatingCost = rent + payroll + cogs + marketingSpend + menuOperatingCost + capacityStress + wastage + stockoutCost; const profit = revenue - operatingCost - turnSpend;
  const closedToday = customers === 0 && state.serviceCapacity > 0;
  // Reputation cannot float far above the quality actually being delivered.
  const reputationCeiling = Math.max(10, Math.min(96, state.quality + 12 + inv.reputationCeilingBonus));
  const overCeiling = Math.max(0, state.reputation - reputationCeiling);
  let reputationChange = (profit > 0 ? 0.45 : -0.5)
    + (state.quality >= 75 ? 0.3 : 0)
    - (state.quality < 50 ? 0.5 : 0)
    - (state.manager ? serviceQualityPenalty * 0.5 : serviceQualityPenalty)
    - (state.consecutivePriceRaises >= 3 ? 1.0 : state.consecutivePriceRaises === 2 ? 0.45 : 0)
    - (state.inventory - stockUsed < 0 ? 1.2 : 0)
    - (state.inventory < 20 ? 0.8 : 0)
    + (wastage > 2000 ? -0.35 : 0);
  // A cafe that served nobody was effectively shut. Word travels fast.
  if (closedToday) reputationChange = Math.min(reputationChange, 0) - 3.2;
  // Drift back down toward what the quality can support.
  reputationChange += mgr.reputationDaily + sup.reputationDaily;
  if (overCeiling > 0) reputationChange = Math.min(reputationChange, 0) - Math.min(3, overCeiling * 0.6);
  // Gains get harder the higher you already are.
  if (reputationChange > 0 && state.reputation > 70) reputationChange *= 0.35;
  if (reputationChange > 0 && state.reputation > 85) reputationChange *= 0.4;
  // Reputation can never sit above what the quality supports.
  const cappedRep = Math.min(state.reputation + reputationChange, reputationCeiling + 2);
  reputationChange = cappedRep - state.reputation; const qualityDrift = (state.quality > 40 ? -0.12 : 0) + mgr.qualityDrift + inv.qualityDrift + sup.qualityDaily;
  const previousProfit = state.profit;
  // A supply contract means deliveries arrive without the owner ordering them,
  // but it only covers routine demand and never fully fills the store.
  const restocked = state.supplyContract ? Math.round(stockUsed * (sup.autoRestock || 0.92)) : 0;
  const nextInventory = Math.max(0, Math.min(state.supplyContract ? 78 : 100, state.inventory - stockUsed + restocked));
  const stockoutToday = state.inventory - stockUsed < 0 || customers === 0;
  const monthBoundary = state.day % 30 === 0;
  const wagesToday = payroll;
  const next: GameState = { ...state, day: state.day + 1,
    daysSinceStockout: stockoutToday ? 0 : state.daysSinceStockout + 1,
    lowCashSeen: state.lowCashSeen || (profit < 0 && state.cash < Math.abs(profit) * 10),
    bestCapacity: Math.max(state.bestCapacity || state.serviceCapacity, state.serviceCapacity),
    monthProfit: monthBoundary ? 0 : state.monthProfit + profit,
    monthRevenue: monthBoundary ? 0 : state.monthRevenue + revenue,
    monthWages: monthBoundary ? 0 : state.monthWages + wagesToday,
    profitableMonths: monthBoundary && state.monthProfit + profit > 0 ? state.profitableMonths + 1 : state.profitableMonths,
    customersBeforeRaise: decision === "raise-price" ? state.customers : state.customersBeforeRaise,
    raiseTestDay: decision === "raise-price" ? state.day : state.raiseTestDay, cash: Math.round(state.cash + profit + turnSpend), revenue, profit, customers, totalCustomers: state.totalCustomers + customers, cumulativeRevenue: state.cumulativeRevenue + revenue, cumulativeProfit: state.cumulativeProfit + profit, reputation: Math.max(0, Math.min(100, Math.round((state.reputation + reputationChange) * 10) / 10)),
    quality: Math.max(0, Math.min(100, Math.round((state.quality + qualityDrift) * 10) / 10)), inventory: nextInventory, wastageToday: wastage, marketing: Math.max(25, state.marketing - 3 * inv.marketingDecayFactor), profitableDays: state.profitableDays + (profit > 0 ? 1 : 0), lossDays: state.lossDays + (profit < 0 ? 1 : 0), profitStreak: profit > 0 ? state.profitStreak + 1 : 0, lossStreak: profit < 0 ? state.lossStreak + 1 : 0, priceChangesLast7: state.day % 7 === 0 ? 0 : state.priceChangesLast7, lastDayMessage: "", weatherToday: weather.id };
  next.lastDayMessage = dayMessage(next, decision, state); next.milestones = addMilestones(next, previousProfit); next.dayHistory = [...state.dayHistory, { day: state.day, decision, eventId: resolvedEventId, eventOption: resolvedEventOption, cashBefore: state.cash + turnSpend, cashAfter: next.cash, revenue, profit, customers, reputation: next.reputation, priceIndex: next.priceIndex, inventory: next.inventory, wastage }]; return next;
}
function makeEvent(id: GameEventId, title: string, narrative: string, severity: 1 | 2 | 3, options: GameEvent["options"]): GameEvent { return { id, title, narrative, severity, options }; }
/** 0 = struggling, 1 = comfortable. Drives how hard the next situation is. */
export function performanceIndex(state: GameState): number {
  const runway = state.profit < 0 ? Math.min(1, state.cash / Math.max(1, Math.abs(state.profit) * 30)) : 1;
  const rep = Math.min(1, state.reputation / 80);
  const stock = Math.min(1, state.inventory / 60);
  const streak = state.profitStreak >= 3 ? 1 : state.lossStreak >= 3 ? 0 : 0.5;
  const profitable = state.cumulativeProfit > 0 ? 1 : 0.35;
  return Math.max(0, Math.min(1, runway * 0.3 + rep * 0.2 + stock * 0.15 + streak * 0.15 + profitable * 0.2));
}

/** Costs scale with how comfortable the player is: gentler when struggling. */
function tune(cost: number, perf: number): number {
  return Math.round((cost * (0.65 + perf * 0.6)) / 500) * 500;
}

export function generateEvent(state: GameState): GameEvent | null {
  if (state.day < 3 || state.currentEvent || state.day - state.lastEventDay < 2) return null;
  const perf = performanceIndex(state);
  const hard = perf > 0.66;      // doing well: push them
  const easy = perf < 0.34;      // struggling: give them a way back
  const c = (n: number) => tune(n, perf);
  const pool: Array<{ event: GameEvent; weight: number }> = [];
  const offer = (weight: number, event: GameEvent) => { if (weight > 0) pool.push({ event, weight }); };

  // --- operational pressure ---
  offer(state.inventory < 35 ? 3 : 0, makeEvent("stock-shortage", "Stock is running low",
    "A few popular items will run out before the day is over. You can protect today's sales or save the cash.", 1,
    [{ id: "emergency-stock", title: "Emergency restock", description: "Pay a premium for a same-day top-up.", cost: c(15000) },
     { id: "conserve-stock", title: "Conserve what's left", description: "Spend nothing and accept some lost sales.", cost: 0 }]));

  offer(state.consecutivePriceRaises >= 2 ? 3 : 0, makeEvent("bad-review", "Customers are talking about your prices",
    "A regular has posted that the cafe has got expensive. How you answer will shape the next few days.", 2,
    [{ id: "hold-price", title: "Hold prices steady", description: "Give people a reason to stay while things settle.", cost: 0 },
     { id: "add-value", title: "Add a small combo offer", description: "Protect the headline price and add value instead.", cost: c(7000) },
     { id: "ignore-review", title: "Let it pass", description: "Protect the margin and accept the risk.", cost: 0 }]));

  offer(1.2, makeEvent("supplier-increase", "Your supplier has raised prices",
    "An 18% increase on key ingredients, effective immediately.", 1,
    [{ id: "accept-supplier", title: "Absorb it", description: "No disruption, but every sale earns less.", cost: 0 },
     { id: "switch-supplier", title: "Find someone else", description: "Costs time and money now, protects margins later.", cost: c(12000) }]));

  offer(state.format === "takeaway" ? 0 : 1, makeEvent("equipment-issue", "Something is not sounding right",
    "One of your machines is making a noise it did not make last week.", 2,
    [{ id: "repair-now", title: "Get it repaired", description: "Pay now and stop it becoming a bigger problem.", cost: c(18000) },
     { id: "delay-repair", title: "Leave it for now", description: "Save the cash. It may hold. It may not.", cost: 0 }]));

  offer(1, makeEvent("staff-absence", "Someone has called in sick",
    "You are a person short and the lunch rush is coming.", 2,
    [{ id: "cover-shift", title: "Cover it yourself", description: "A long day, but service holds up.", cost: 0 },
     { id: "run-short", title: "Run short", description: "Save your energy and accept slower service.", cost: 0 }]));

  // --- Mumbai specifics ---
  offer(2.5, makeEvent("health-inspection", "A health inspector is at the door",
    "Unannounced, as they always are. Your kitchen is about to be looked at properly.", 2,
    [{ id: "full-clean", title: "Stop service and put it right", description: "Close for the afternoon and fix everything properly.", cost: c(9000) },
     { id: "quick-tidy", title: "Tidy quickly and hope", description: "Keep serving. Risk a fine and a bad note on file.", cost: 0 }]));

  offer(6, makeEvent("rent-hike", "Your landlord wants more",
    "The lease is up for renewal and he is asking for a significant increase.", 3,
    [{ id: "negotiate-rent", title: "Negotiate hard", description: "Spend on a broker and push back on the number.", cost: c(20000) },
     { id: "accept-rent", title: "Accept it", description: "No fuss, but your fixed costs rise for good.", cost: 0 }]));

  offer(state.reputation > 55 ? 1.2 : 0, makeEvent("delivery-app", "A delivery app wants you on the platform",
    "More orders, more visibility — and a commission on every single one.", 2,
    [{ id: "join-app", title: "Sign up", description: "New customers you would never have reached, at a cost per order.", cost: c(7000) },
     { id: "stay-off", title: "Stay independent", description: "Keep your margin and your own customers.", cost: 0 }]));

  offer(state.day > 40 ? 1 : 0, makeEvent("monsoon-flood", "The street is under water",
    "Heavy rain has flooded the lane. Nobody is walking to a cafe today.", 2,
    [{ id: "sandbags", title: "Protect the shop", description: "Sandbags, pumps and a long night.", cost: c(6000) },
     { id: "shut-early", title: "Shut early", description: "Send everyone home and lose the day's trade.", cost: 0 }]));

  offer(1, makeEvent("power-cut", "The power has gone",
    "No lights, no machines, and a queue outside.", 1,
    [{ id: "hire-genset", title: "Hire a generator", description: "Keep trading through it.", cost: c(4500) },
     { id: "wait-it-out", title: "Wait it out", description: "Serve what you can cold and lose the rest.", cost: 0 }]));

  offer(state.staff >= 70 ? 1.2 : 0, makeEvent("staff-poached", "A chain is trying to hire your best person",
    "They have been offered more money and a uniform. They are telling you out of loyalty.", 3,
    [{ id: "match-offer-staff", title: "Match the offer", description: "Keep them, and carry a higher wage bill.", cost: c(16000) },
     { id: "let-them-go", title: "Wish them well", description: "Save the money and lose experience off the floor.", cost: 0 }]));

  offer(state.reputation >= 65 ? 1.4 : 0, makeEvent("food-blogger", "Someone is photographing their coffee",
    "You recognise them. They review cafes, and a lot of people read it.", 2,
    [{ id: "look-after-them", title: "Look after them properly", description: "Comp the table and put your best out.", cost: c(2000) },
     { id: "treat-normal", title: "Treat them like anyone else", description: "Let the cafe speak for itself.", cost: 0 }]));

  offer(5, makeEvent("licence-renewal", "Your licence is due for renewal",
    "Paperwork, fees, and someone who can make it move faster.", 1,
    [{ id: "pay-proper", title: "Do it properly", description: "Pay the fees and file it yourself. Slow but clean.", cost: c(8000) },
     { id: "use-agent", title: "Use an agent", description: "Costs more, takes none of your time.", cost: c(14000) }]));

  offer(state.day > 30 ? 0.9 : 0, makeEvent("construction", "They have dug up the road outside",
    "Municipal work. Dust, noise, and a barrier where your customers used to walk.", 2,
    [{ id: "signage", title: "Put up signage and offers", description: "Spend on pulling people past the mess.", cost: c(6000) },
     { id: "ride-construction", title: "Wait for it to finish", description: "Nobody knows how long. Save the money.", cost: 0 }]));

  offer(state.day > 50 ? 1 : 0, makeEvent("rival-closes", "The cafe down the road has shut",
    "Their regulars are looking for somewhere new. So is their head barista.", 1,
    [{ id: "hire-their-staff", title: "Hire their barista", description: "Experience, and their regulars may follow.", cost: c(17000) },
     { id: "welcome-regulars", title: "Just welcome the crowd", description: "Spend nothing and see who turns up.", cost: 0 }]));

  // --- opportunity, weighted toward players who are struggling ---
  offer(easy ? 2.2 : 1, makeEvent("local-event", "There is an event round the corner",
    "A crowd will pass your door this week. Are you ready for them?", 1,
    [{ id: "prepare-staff", title: "Bring in extra hands", description: "Pay for help and catch more of the rush.", cost: c(16000) },
     { id: "take-the-risk", title: "Manage as you are", description: "Spend nothing and hope you cope.", cost: 0 }]));

  offer(state.reputation >= 70 ? (easy ? 2 : 1.2) : 0, makeEvent("viral-mention", "Someone posted about you",
    "A local food page has put your cafe in front of a lot of people.", 2,
    [{ id: "amplify", title: "Push it while it's warm", description: "Spend on a small boost behind the attention.", cost: c(6000) },
     { id: "let-it-spread", title: "Let it travel", description: "Spend nothing and see how far word carries.", cost: 0 }]));

  offer(state.serviceCapacity >= 150 ? (hard ? 1.6 : 1) : 0, makeEvent("bulk-order", "An office wants a standing order",
    "Good money, every week — and it will test whether you can cope.", 2,
    [{ id: "accept-order", title: "Take it on", description: "Real revenue, real pressure on service.", cost: 0 },
     { id: "decline-order", title: "Decline politely", description: "Protect the experience of everyone else.", cost: 0 }]));

  offer(hard ? 1.8 : 1, makeEvent("competitor-promotion", "A rival has launched an aggressive offer",
    "The cafe two streets over is buying attention, and some of it is yours.", 2,
    [{ id: "match-offer", title: "Match them", description: "Defend your customers, sacrifice margin.", cost: c(14000) },
     { id: "differentiate", title: "Compete on quality instead", description: "Spend on being better rather than cheaper.", cost: c(12000) },
     { id: "ignore-competitor", title: "Hold your nerve", description: "Stay out of a price war.", cost: 0 }]));

  offer(0.5, makeEvent("rain", "Rain has slowed the street",
    "Fewer people are walking today. You can spend to pull them in or ride it out.", 1,
    [{ id: "delivery-push", title: "Push a local promotion", description: "Spend to recover some of the day.", cost: c(5000) },
     { id: "ride-it-out", title: "Ride it out", description: "Save the cash and accept a quiet day.", cost: 0 }]));

  // When a situation may first appear, and how long before it can return.
  // A landlord does not raise the rent in your first month, and having done it
  // once, does not do it again until the lease comes round the following year.
  const RULES: Partial<Record<GameEventId, { earliest?: number; cooldown?: number }>> = {
    "rent-hike":         { earliest: 180, cooldown: 365 },
    "licence-renewal":   { earliest: 200, cooldown: 365 },
    "health-inspection": { earliest: 45,  cooldown: 210 },
    "tax-notice":        { earliest: 150, cooldown: 365 },
    "lease-offer":       { earliest: 240, cooldown: 365 },
    "delivery-app":      { earliest: 60,  cooldown: 365 },
    "rival-closes":      { earliest: 90,  cooldown: 300 },
    "rival-opens":       { earliest: 70,  cooldown: 250 },
    "metro-station":     { earliest: 120, cooldown: 365 },
    "construction":      { earliest: 40,  cooldown: 220 },
    "staff-poached":     { earliest: 50,  cooldown: 150 },
    "staff-raise":       { earliest: 70,  cooldown: 160 },
    "monsoon-flood":     { earliest: 30,  cooldown: 150 },
    "water-shortage":    { earliest: 25,  cooldown: 140 },
    "heatwave":          { earliest: 20,  cooldown: 130 },
    "festival-rush":     { earliest: 25,  cooldown: 120 },
    "exam-season":       { earliest: 35,  cooldown: 150 },
    "long-weekend":      { earliest: 20,  cooldown: 110 },
    "equipment-issue":   { earliest: 14,  cooldown: 110 },
    "pest-notice":       { earliest: 60,  cooldown: 200 },
    "theft":             { earliest: 45,  cooldown: 180 },
    "allergy-complaint": { earliest: 40,  cooldown: 190 },
    "review-bombing":    { earliest: 55,  cooldown: 200 },
    "newspaper-feature": { earliest: 60,  cooldown: 200 },
    "food-blogger":      { earliest: 30,  cooldown: 130 },
    "viral-mention":     { earliest: 30,  cooldown: 130 },
    "influencer-offer":  { earliest: 65,  cooldown: 180 },
    "catering-enquiry":  { earliest: 55,  cooldown: 140 },
    "musician-offer":    { earliest: 50,  cooldown: 200 },
    "milk-price":        { earliest: 20,  cooldown: 120 },
    "supplier-exclusive":{ earliest: 90,  cooldown: 250 },
    "payment-outage":    { earliest: 25,  cooldown: 130 },
    "rider-strike":      { earliest: 80,  cooldown: 180 },
    "struggling-cook":   { earliest: 70,  cooldown: 200 },
    "ageing-server":     { earliest: 110, cooldown: 250 },
    "family-illness":    { earliest: 60,  cooldown: 170 },
    "loyal-underperformer": { earliest: 95, cooldown: 220 },
    "supplier-increase": { earliest: 10,  cooldown: 120 },
    "competitor-promotion": { earliest: 15, cooldown: 130 },
    "bulk-order":        { earliest: 30,  cooldown: 110 },
    "power-cut":         { earliest: 10,  cooldown: 90 },
    "local-event":       { earliest: 12,  cooldown: 95 },
    "staff-absence":     { earliest: 3,   cooldown: 70 },
    "bad-review":        { earliest: 8,   cooldown: 100 },
    "rain":              { earliest: 3,   cooldown: 45 },
    "stock-shortage":    { earliest: 3,   cooldown: 40 },
  };
  const lastSeen = new Map<string, number>();
  for (const entry of state.eventHistory) {
    const [d, id] = entry.split(":");
    lastSeen.set(id, Math.max(lastSeen.get(id) ?? 0, Number(d) || 0));
  }
  const allowedNow = (id: GameEventId) => {
    const rule = RULES[id];
    if (!rule) return true;
    if (rule.earliest !== undefined && state.day < rule.earliest) return false;
    const seen = lastSeen.get(id);
    if (seen !== undefined && rule.cooldown !== undefined && state.day - seen < rule.cooldown) return false;
    return true;
  };

  // --- the city itself ---
  offer(1.1, makeEvent("water-shortage", "The tanker has not come",
    "The building's water has run out and the supplier is two days behind. You cannot wash a cup, let alone make coffee.", 2,
    [{ id: "buy-tanker", title: "Pay for a private tanker", description: "Expensive, immediate, and nobody notices anything was wrong.", cost: c(8000) },
     { id: "limited-menu", title: "Run a limited menu", description: "Serve what you can without water. Some people will leave.", cost: 0 }]));

  offer(1.1, makeEvent("heatwave", "44 degrees and climbing",
    "Nobody wants to walk anywhere. The ones who do want something cold and want to sit under the fan for an hour.", 1,
    [{ id: "cold-push", title: "Push cold drinks hard", description: "Lean into it with a chilled offer.", cost: c(6000) },
     { id: "endure-heat", title: "Ride it out", description: "Save the money and accept a slow week.", cost: 0 }]));

  offer(1.2, makeEvent("festival-rush", "The festival is coming",
    "The whole neighbourhood will be out on the street for four days. It will be the busiest you have ever been, if you are ready.", 2,
    [{ id: "stock-up-festival", title: "Stock up and staff up", description: "Prepare properly for the crowd.", cost: c(14000) },
     { id: "normal-festival", title: "Trade as normal", description: "Take what comes and keep the money.", cost: 0 }]));

  offer(1, makeEvent("exam-season", "Exam season has started",
    "Students have discovered you. They buy one chai and occupy a table for three hours.", 1,
    [{ id: "welcome-students", title: "Let them stay", description: "Slow money now, loyal customers for years.", cost: 0 },
     { id: "minimum-order", title: "Introduce a minimum order", description: "Protect your tables. Some will resent it.", cost: 0 }]));

  offer(1, makeEvent("long-weekend", "A long weekend",
    "Half the city is going away and the other half is looking for somewhere to sit.", 1,
    [{ id: "weekend-special", title: "Run a weekend special", description: "Spend a little to catch the crowd that stayed.", cost: c(5000) },
     { id: "weekend-normal", title: "Open as usual", description: "See who turns up.", cost: 0 }]));

  // --- officialdom ---
  offer(state.cumulativeProfit > 400000 ? 3.5 : 0, makeEvent("tax-notice", "A notice from the tax office",
    "A discrepancy in last quarter's filing. Probably nothing. Probably.", 3,
    [{ id: "hire-accountant", title: "Get an accountant on it", description: "Costs money, ends the matter cleanly.", cost: c(22000) },
     { id: "handle-tax-self", title: "Deal with it yourself", description: "Free, but it will eat your week and your attention.", cost: 0 }]));

  offer(1, makeEvent("pest-notice", "A complaint has been filed",
    "Somebody reported seeing something in the corner. Whether they did or not, it has been written down.", 3,
    [{ id: "full-fumigation", title: "Close and fumigate properly", description: "Lose two days of trade and put it beyond doubt.", cost: c(16000) },
     { id: "spot-treatment", title: "Treat it quietly overnight", description: "Cheaper, quicker, and it may not be enough.", cost: c(5000) }]));

  offer(state.cash > 900000 ? 0.9 : 0, makeEvent("lease-offer", "Your landlord wants to sell",
    "He is retiring to Pune and would rather sell the shop than manage it. He is offering it to you first.", 3,
    [{ id: "buy-the-shop", title: "Buy it", description: "An enormous cheque, and never another rent day.", cost: c(850000) },
     { id: "decline-purchase", title: "Let it pass", description: "Keep your cash. The next landlord is an unknown.", cost: 0 }]));

  // --- competition and the street ---
  offer(1.1, makeEvent("rival-opens", "Something is opening next door",
    "Hoardings went up on the empty unit beside you. Another cafe, by the look of the plans.", 2,
    [{ id: "pre-empt", title: "Get ahead of them", description: "Spend on reminding people why they come to you.", cost: c(13000) },
     { id: "wait-and-see", title: "Wait and see", description: "They may not be any good.", cost: 0 }]));

  offer(0.9, makeEvent("metro-station", "They are building a metro station",
    "Two years of dust and noise, and then a river of people passing your door every morning.", 2,
    [{ id: "endure-metro", title: "Sit tight and endure it", description: "It will hurt now and pay later.", cost: 0 },
     { id: "reposition", title: "Reposition for the commuters", description: "Spend now on being ready for who is coming.", cost: c(19000) }]));

  offer(state.reputation >= 60 ? 1 : 0, makeEvent("rider-strike", "The delivery riders are striking",
    "No app orders for at least three days. Everyone will have to come in person.", 1,
    [{ id: "walkin-offer", title: "Push a walk-in offer", description: "Give people a reason to make the trip.", cost: c(6000) },
     { id: "quiet-days", title: "Accept the quiet", description: "Save the money and wait it out.", cost: 0 }]));

  // --- people ---
  offer(state.staff >= 40 ? 1.1 : 0, makeEvent("staff-raise", "Your team wants more money",
    "They have been here a year, prices have gone up, and they have worked out that you know it.", 3,
    [{ id: "give-raise", title: "Give them the raise", description: "Costs you daily, and they will stay.", cost: c(9000) },
     { id: "refuse-raise", title: "Say not yet", description: "Save it. Expect the mood to change.", cost: 0 }]));

  offer(0.9, makeEvent("theft", "The till is short",
    "Not much, but it has happened three times this month, and it is not a mistake.", 3,
    [{ id: "install-cameras", title: "Put cameras in", description: "It stops. Everyone knows why they went up.", cost: c(12000) },
     { id: "let-it-go", title: "Say nothing for now", description: "Keep the peace and keep losing a little.", cost: 0 }]));

  offer(1, makeEvent("allergy-complaint", "Someone had a reaction",
    "A customer says there were nuts in something that should not have had nuts. They are unhappy and they are telling people.", 3,
    [{ id: "full-apology", title: "Apologise properly and retrain", description: "Cover their costs, fix the kitchen process.", cost: c(11000) },
     { id: "deny-fault", title: "Stand your ground", description: "You are not certain it was you. It may cost you anyway.", cost: 0 }]));

  // --- reputation, good and bad ---
  offer(state.reputation < 55 ? 1.1 : 0, makeEvent("review-bombing", "A run of one-star reviews",
    "Six in two days, all oddly similar. Someone is doing this on purpose.", 2,
    [{ id: "respond-publicly", title: "Reply to every one, politely", description: "Takes time and a small spend. People notice grace.", cost: c(4000) },
     { id: "ignore-reviews", title: "Ignore them", description: "They may pass. They may not.", cost: 0 }]));

  offer(state.reputation >= 62 ? 1.1 : 0, makeEvent("newspaper-feature", "A local paper wants to write about you",
    "A neighbourhood piece on places worth walking to. They want photographs.", 2,
    [{ id: "host-feature", title: "Do it properly", description: "Close an afternoon, put your best out, get it right.", cost: c(7000) },
     { id: "quick-feature", title: "Let them come as we are", description: "Costs nothing. It will look like a normal Tuesday.", cost: 0 }]));

  offer(state.reputation >= 58 ? 1 : 0, makeEvent("influencer-offer", "An influencer wants a collaboration",
    "Free food for a month in exchange for posts. Their following is real; whether it buys coffee is another question.", 2,
    [{ id: "accept-collab", title: "Agree to it", description: "A month of giving food away for a month of attention.", cost: c(9000) },
     { id: "decline-collab", title: "Politely decline", description: "Keep the food. Keep the margin.", cost: 0 }]));

  offer(state.serviceCapacity >= 120 ? 1 : 0, makeEvent("catering-enquiry", "An office wants catering",
    "A one-off order for eighty people next Friday. Good money if you can do it without wrecking the normal day.", 2,
    [{ id: "take-catering", title: "Take it on", description: "Real money, and a hard Friday.", cost: c(8000) },
     { id: "decline-catering", title: "Turn it down", description: "Protect the regular trade.", cost: 0 }]));

  offer(0.8, makeEvent("musician-offer", "A musician wants to play weekends",
    "A guitarist who plays quietly and brings a small crowd. He wants a fee and a free dinner.", 1,
    [{ id: "book-musician", title: "Book him", description: "Atmosphere, a reason to stay longer, and a weekly cost.", cost: c(7000) },
     { id: "no-music", title: "Keep it quiet", description: "Some people come here precisely because it is quiet.", cost: 0 }]));

  // --- supply and money ---
  offer(1.1, makeEvent("milk-price", "Milk has gone up again",
    "Eleven per cent overnight. It is the one thing you cannot buy less of.", 1,
    [{ id: "absorb-milk", title: "Absorb it", description: "Hold your prices and take the hit on margin.", cost: 0 },
     { id: "switch-dairy", title: "Find another dairy", description: "Cheaper, and the coffee will taste slightly different.", cost: c(5000) }]));

  offer(state.day > 90 ? 1 : 0, makeEvent("supplier-exclusive", "Your supplier wants exclusivity",
    "Better rates on everything, provided you buy nothing from anyone else.", 2,
    [{ id: "sign-exclusive", title: "Sign it", description: "Lower costs, and nowhere to turn if they let you down.", cost: 0 },
     { id: "stay-flexible", title: "Stay free to shop around", description: "Pay a little more for the ability to walk away.", cost: 0 }]));

  offer(0.9, makeEvent("payment-outage", "Card payments are down",
    "The bank's system is out and half your customers do not carry cash.", 1,
    [{ id: "cash-only-signs", title: "Put signs up and send people to the ATM", description: "Awkward, but you keep most of the day.", cost: c(2500) },
     { id: "trust-customers", title: "Let regulars pay tomorrow", description: "Costs you nothing today and buys real goodwill.", cost: 0 }]));

  // --- decisions with a person on the other side of them ---
  offer((state.crew?.cook ?? 0) > 0 ? 1.4 : 0, makeEvent("struggling-cook", "Something is wrong with your cook",
    "The food has been slipping for three weeks. He has been with you since the first month and he has never let you down before. You find out his mother is ill and he has been up most nights.", 3,
    [{ id: "replace-cook", title: "Replace him", description: "The kitchen recovers quickly. He will not find another job easily.", cost: c(9000) },
     { id: "second-cook", title: "Bring in a second cook to carry the load", description: "Costs you every day from now on. He keeps his job and his dignity.", cost: c(18000) },
     { id: "give-time-off", title: "Give him two weeks, paid", description: "The kitchen suffers now. He may come back stronger, or he may not come back.", cost: c(11000) }]));

  offer((state.crew?.server ?? 0) > 0 ? 1.2 : 0, makeEvent("ageing-server", "Your oldest server is slowing down",
    "He has been on the floor longer than you have owned the place. The regulars ask for him by name. He is also visibly struggling through a busy lunch.", 3,
    [{ id: "let-him-go", title: "Let him go", description: "Service speeds up. The regulars will notice he is gone.", cost: 0 },
     { id: "quieter-shifts", title: "Move him to quieter shifts", description: "Costs you a little in cover. He keeps his place.", cost: c(7000) },
     { id: "keep-as-is", title: "Change nothing", description: "Slower service, and a team that sees how you treat people.", cost: 0 }]));

  offer(state.staff >= 30 ? 1.2 : 0, makeEvent("family-illness", "Someone needs to be somewhere else",
    "One of your team has asked for a month off. Their father is in hospital in another state. They are not asking to be paid — they are asking whether the job will be there.", 3,
    [{ id: "hold-the-job", title: "Hold the job and pay half", description: "A month short-handed and a month of wages for nothing.", cost: c(14000) },
     { id: "unpaid-hold", title: "Hold the job, unpaid", description: "Fair, common, and they will remember which it was.", cost: 0 },
     { id: "fill-position", title: "Fill the position", description: "The cafe does not suffer. You will need to tell them.", cost: c(8000) }]));

  offer(state.staff >= 40 ? 1.1 : 0, makeEvent("loyal-underperformer", "Punctual, loyal, and not very good",
    "First in every morning, last to leave, never once complained. Also the reason drinks go back to the counter. Everyone on the team knows.", 3,
    [{ id: "train-them", title: "Pay to train them properly", description: "Slow, expensive, and it may work.", cost: c(13000) },
     { id: "move-them", title: "Move them off the counter", description: "Play to what they are good at. Capacity drops a little.", cost: 0 },
     { id: "let-them-go-loyal", title: "Let them go", description: "Quality recovers. The rest of the team watches how you do it.", cost: c(6000) }]));

  // Recently seen events step aside so situations do not repeat.
  const recent = state.eventHistory.slice(-4).map(entry => entry.split(":")[1]);
  const eligible = pool.filter(p => !recent.includes(p.event.id) && allowedNow(p.event.id));
  const usable = eligible.length ? eligible : pool;
  if (!usable.length) return null;

  const total = usable.reduce((sum, p) => sum + p.weight, 0);
  let cursor = (Math.abs(Math.sin((state.seed + state.day) * 7.13)) % 1) * total;
  for (const item of usable) { cursor -= item.weight; if (cursor <= 0) return item.event; }
  return usable[usable.length - 1].event;
}

export function applyEvent(state: GameState, optionId: string): GameState {
  if (!state.currentEvent) return state; const event = state.currentEvent; const option = event.options.find(item => item.id === optionId); if (!option || state.cash < option.cost) return state;
  const next = { ...state, currentEvent: null, lastEventDay: state.day, eventsHandled: (state.eventsHandled ?? 0) + 1, eventHistory: [...state.eventHistory, `${state.day}:${event.id}:${optionId}`] }; if (option.cost > 0) next.cash -= option.cost;
  switch (event.id) { case "supplier-increase": if (optionId === "accept-supplier") next.supplierCostMultiplier = Math.min(1.5, next.supplierCostMultiplier + 0.18); break; case "stock-shortage": if (optionId === "emergency-stock") next.inventory = Math.min(100, next.inventory + 35); else if (optionId === "conserve-stock") next.inventory = Math.max(0, next.inventory - 15); break; case "bad-review": if (optionId === "hold-price") { next.consecutivePriceRaises = 0; next.reputation = Math.min(100, next.reputation + 1); } else if (optionId === "add-value") { next.reputation = Math.min(100, next.reputation + 1); next.quality = Math.min(100, next.quality + 2); } else if (optionId === "ignore-review") next.reputation = Math.max(0, next.reputation - 4); break; case "rain": if (optionId === "delivery-push") next.marketing = Math.min(100, next.marketing + 10); break; case "competitor-promotion": if (optionId === "match-offer") next.marketing = Math.min(100, next.marketing + 12); else if (optionId === "differentiate") next.quality = Math.min(100, next.quality + 6); else next.reputation = Math.max(0, next.reputation - 1); break; case "local-event": if (optionId === "prepare-staff") next.serviceCapacity = Math.min(600, next.serviceCapacity + 20); break; case "equipment-issue": if (optionId === "delay-repair") next.quality = Math.max(0, next.quality - 8); break; case "viral-mention": if (optionId === "amplify") next.marketing = Math.min(100, next.marketing + 18); else next.reputation = Math.min(100, next.reputation + 1); break; case "bulk-order": if (optionId === "accept-order") next.serviceCapacity = Math.min(600, next.serviceCapacity + 10); break; case "staff-absence": if (optionId === "cover-shift") next.staff = Math.min(100, next.staff + 3); else next.quality = Math.max(0, next.quality - 4); break;
    case "health-inspection": if (optionId === "full-clean") { next.quality = Math.min(100, next.quality + 5); next.reputation = Math.min(100, next.reputation + 2); } else { next.reputation = Math.max(0, next.reputation - 6); next.quality = Math.max(0, next.quality - 3); } break;
    case "rent-hike": if (optionId === "accept-rent") next.supplierCostMultiplier = Math.min(1.6, next.supplierCostMultiplier + 0.10); else next.reputation = Math.min(100, next.reputation + 1); break;
    case "delivery-app": if (optionId === "join-app") { next.marketing = Math.min(100, next.marketing + 16); next.supplierCostMultiplier = Math.min(1.6, next.supplierCostMultiplier + 0.06); } break;
    case "monsoon-flood": if (optionId === "sandbags") next.reputation = Math.min(100, next.reputation + 1); else { next.inventory = Math.max(0, next.inventory - 12); next.reputation = Math.max(0, next.reputation - 2); } break;
    case "power-cut": if (optionId === "hire-genset") next.reputation = Math.min(100, next.reputation + 1); else { next.inventory = Math.max(0, next.inventory - 8); next.reputation = Math.max(0, next.reputation - 2); } break;
    case "staff-poached": if (optionId === "match-offer-staff") next.staff = Math.min(100, next.staff + 4); else { next.staff = Math.max(0, next.staff - 12); next.quality = Math.max(0, next.quality - 5); } break;
    case "food-blogger": if (optionId === "look-after-them") { next.reputation = Math.min(100, next.reputation + 5); next.marketing = Math.min(100, next.marketing + 8); } else next.reputation = Math.min(100, next.reputation + 2); break;
    case "licence-renewal": if (optionId === "use-agent") next.reputation = Math.min(100, next.reputation + 1); else next.quality = Math.max(0, next.quality - 1); break;
    case "construction": if (optionId === "signage") next.marketing = Math.min(100, next.marketing + 12); else next.reputation = Math.max(0, next.reputation - 2); break;
    case "rival-closes": if (optionId === "hire-their-staff") { next.staff = Math.min(100, next.staff + 9); next.quality = Math.min(100, next.quality + 4); } else next.marketing = Math.min(100, next.marketing + 6); break;

    case "water-shortage": if (optionId === "limited-menu") { next.reputation = Math.max(0, next.reputation - 3); next.inventory = Math.max(0, next.inventory - 6); } break;
    case "heatwave": if (optionId === "cold-push") next.marketing = Math.min(100, next.marketing + 9); else next.reputation = Math.max(0, next.reputation - 1); break;
    case "festival-rush": if (optionId === "stock-up-festival") { next.inventory = Math.min(100, next.inventory + 25); next.marketing = Math.min(100, next.marketing + 14); next.reputation = Math.min(100, next.reputation + 3); } else { next.reputation = Math.max(0, next.reputation - 3); next.inventory = Math.max(0, next.inventory - 14); } break;
    case "exam-season": if (optionId === "welcome-students") { next.reputation = Math.min(100, next.reputation + 4); next.priceIndex = Math.max(100, next.priceIndex - 2); } else next.reputation = Math.max(0, next.reputation - 3); break;
    case "long-weekend": if (optionId === "weekend-special") next.marketing = Math.min(100, next.marketing + 8); break;

    case "tax-notice": if (optionId === "handle-tax-self") { next.quality = Math.max(0, next.quality - 5); next.marketing = Math.max(25, next.marketing - 8); } break;
    case "pest-notice": if (optionId === "full-fumigation") next.reputation = Math.min(100, next.reputation + 2); else { next.reputation = Math.max(0, next.reputation - 7); next.quality = Math.max(0, next.quality - 4); } break;
    case "lease-offer": if (optionId === "buy-the-shop") { next.investments = [...(next.investments ?? []), "buy-lease"]; next.reputation = Math.min(100, next.reputation + 2); } break;

    case "rival-opens": if (optionId === "pre-empt") next.marketing = Math.min(100, next.marketing + 15); else { next.reputation = Math.max(0, next.reputation - 3); next.marketing = Math.max(25, next.marketing - 6); } break;
    case "metro-station": if (optionId === "reposition") next.marketing = Math.min(100, next.marketing + 18); else next.reputation = Math.max(0, next.reputation - 2); break;
    case "rider-strike": if (optionId === "walkin-offer") next.marketing = Math.min(100, next.marketing + 8); else next.reputation = Math.max(0, next.reputation - 1); break;

    case "staff-raise": if (optionId === "give-raise") { next.staff = Math.min(100, next.staff + 6); next.quality = Math.min(100, next.quality + 3); } else { next.staff = Math.max(0, next.staff - 10); next.quality = Math.max(0, next.quality - 4); } break;
    case "theft": if (optionId === "install-cameras") next.quality = Math.min(100, next.quality + 1); else next.supplierCostMultiplier = Math.min(1.6, next.supplierCostMultiplier + 0.04); break;
    case "allergy-complaint": if (optionId === "full-apology") { next.quality = Math.min(100, next.quality + 5); next.reputation = Math.max(0, next.reputation - 2); } else next.reputation = Math.max(0, next.reputation - 9); break;

    case "review-bombing": if (optionId === "respond-publicly") next.reputation = Math.min(100, next.reputation + 2); else next.reputation = Math.max(0, next.reputation - 6); break;
    case "newspaper-feature": if (optionId === "host-feature") { next.reputation = Math.min(100, next.reputation + 7); next.marketing = Math.min(100, next.marketing + 12); } else { next.reputation = Math.min(100, next.reputation + 2); next.marketing = Math.min(100, next.marketing + 4); } break;
    case "influencer-offer": if (optionId === "accept-collab") { next.marketing = Math.min(100, next.marketing + 16); next.supplierCostMultiplier = Math.min(1.6, next.supplierCostMultiplier + 0.03); } break;
    case "catering-enquiry": if (optionId === "take-catering") { next.inventory = Math.max(0, next.inventory - 16); next.reputation = Math.min(100, next.reputation + 3); } break;
    case "musician-offer": if (optionId === "book-musician") { next.reputation = Math.min(100, next.reputation + 5); next.marketing = Math.min(100, next.marketing + 6); } break;

    case "milk-price": if (optionId === "absorb-milk") next.supplierCostMultiplier = Math.min(1.6, next.supplierCostMultiplier + 0.09); else next.quality = Math.max(0, next.quality - 5); break;
    case "supplier-exclusive": if (optionId === "sign-exclusive") next.supplierCostMultiplier = Math.max(0.8, next.supplierCostMultiplier - 0.12); else next.supplierCostMultiplier = Math.min(1.6, next.supplierCostMultiplier + 0.03); break;
    case "payment-outage": if (optionId === "trust-customers") next.reputation = Math.min(100, next.reputation + 3); break;

    // These are all defensible. None of them is free.
    case "struggling-cook":
      if (optionId === "replace-cook") { next.quality = Math.min(100, next.quality + 6); next.reputation = Math.max(0, next.reputation - 4); next.staff = Math.max(0, next.staff - 3); }
      else if (optionId === "second-cook") { next.quality = Math.min(100, next.quality + 5); next.staff = Math.min(100, next.staff + 8); next.crew = { ...(next.crew ?? {}), cook: ((next.crew?.cook ?? 0) + 1) }; next.crewWage = (next.crewWage ?? 0) + 1100; next.reputation = Math.min(100, next.reputation + 2); }
      else { next.quality = Math.max(0, next.quality - 5); next.reputation = Math.min(100, next.reputation + 4); next.staff = Math.max(0, next.staff - 6); }
      break;
    case "ageing-server":
      if (optionId === "let-him-go") { next.reputation = Math.max(0, next.reputation - 6); next.serviceCapacity = Math.max(20, next.serviceCapacity + 12); next.crew = { ...(next.crew ?? {}), server: Math.max(0, (next.crew?.server ?? 1) - 1) }; next.crewWage = Math.max(0, (next.crewWage ?? 0) - 650); }
      else if (optionId === "quieter-shifts") { next.reputation = Math.min(100, next.reputation + 3); next.serviceCapacity = Math.max(20, next.serviceCapacity - 6); }
      else { next.serviceCapacity = Math.max(20, next.serviceCapacity - 14); next.reputation = Math.min(100, next.reputation + 1); }
      break;
    case "family-illness":
      if (optionId === "hold-the-job") { next.reputation = Math.min(100, next.reputation + 6); next.staff = Math.min(100, next.staff + 4); next.quality = Math.max(0, next.quality - 2); }
      else if (optionId === "unpaid-hold") { next.reputation = Math.min(100, next.reputation + 2); next.quality = Math.max(0, next.quality - 3); }
      else { next.reputation = Math.max(0, next.reputation - 5); next.staff = Math.max(0, next.staff - 5); }
      break;
    case "loyal-underperformer":
      if (optionId === "train-them") { next.quality = Math.min(100, next.quality + 4); next.staff = Math.min(100, next.staff + 5); }
      else if (optionId === "move-them") { next.serviceCapacity = Math.max(20, next.serviceCapacity - 10); next.quality = Math.min(100, next.quality + 3); }
      else { next.quality = Math.min(100, next.quality + 7); next.reputation = Math.max(0, next.reputation - 3); next.staff = Math.max(0, next.staff - 8); }
      break; }
  return next;
}

export type StarterPresetId = "steady" | "ambitious" | "lean";
export type StarterPreset = { id: StarterPresetId; name: string; blurb: string; capital: number; location: Location; format: BusinessFormat; menu: MenuItemId[] };
export const STARTER_PRESETS: StarterPreset[] = [
  { id: "steady", name: "Play it safe", blurb: "A small cafe on a residential street. Coffee, chai and snacks. Modest rent, regulars who come back.", capital: 1000000, location: "residential", format: "small-cafe", menu: ["filter-coffee", "masala-chai", "bun-maska", "vada-pav", "veg-sandwich", "espresso"] },
  { id: "ambitious", name: "Go big", blurb: "A full kitchen on a busy high street. Crowds every day, and rent to match.", capital: 2000000, location: "high-footfall", format: "full-cafe", menu: ["filter-coffee", "masala-chai", "cappuccino", "cold-coffee", "veg-sandwich", "grilled-sandwich", "fries", "pasta", "dessert"] },
  { id: "lean", name: "Start tiny", blurb: "A takeaway kiosk. Barely any rent, but nowhere for anyone to sit.", capital: 500000, location: "high-footfall", format: "takeaway", menu: ["filter-coffee", "instant-coffee", "masala-chai", "bun-maska", "vada-pav"] },
];
export function getPreset(id: string): StarterPreset | undefined { return STARTER_PRESETS.find(p => p.id === id); }

/** Short money for tight spaces: ₹30.7L, ₹1.24Cr, ₹8,500. */
export function formatCompactINR(value: number): string {
  const n = Math.round(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(abs >= 100000000 ? 0 : 2)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(abs >= 10000000 ? 0 : 1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(abs >= 100000 ? 0 : 1)}k`;
  return `${sign}₹${abs}`;
}
