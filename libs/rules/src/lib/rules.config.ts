export const rulesConfig = {
  taxRate: 0.1,
  currency: 'USD',
  defaultValidDays: 30,
  discountRules: {
    enabled: false,
    thresholds: [] as number[],
  },
} as const;
