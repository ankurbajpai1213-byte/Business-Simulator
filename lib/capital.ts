export const CAPITAL_OPTIONS = [500000, 1000000, 2000000, 3500000, 5000000] as const;

export const CAPITAL_NOTES: Record<number, string> = {
  500000: "Tight. You'll feel every rupee you spend.",
  1000000: "Careful money. Room for one mistake, not two.",
  2000000: "Comfortable. You can build properly and still breathe.",
  3500000: "Generous. Ambitious plans become possible.",
  5000000: "Serious money. Now the question is what you do with it.",
};

// Kept for older imports.
export const CAPITAL_CAPTIONS = CAPITAL_NOTES;
