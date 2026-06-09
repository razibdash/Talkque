export const BILLING_PLANS = {
  starter: { name: 'Starter', includedMinutes: 500 },
  growth: { name: 'Growth', includedMinutes: 2500 },
  scale: { name: 'Scale', includedMinutes: 10000 },
} as const;

export type BillingPlanId = keyof typeof BILLING_PLANS;
