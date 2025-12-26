export interface RulesConfig {
  taxRates: {
    standard: number;
    premium: number;
  };
  currency: string;
  defaultValidDays: number;
  discountRules: {
    enabled: boolean;
    premium: {
      threshold: number;
      percentage: number;
    };
    standard: {
      threshold: number;
      percentage: number;
    };
  };
}

export const rulesConfig: RulesConfig = {
  taxRates: {
    standard: 0.1, // 10%
    premium: 0.08, // 8%
  },
  currency: 'USD',
  defaultValidDays: 30,
  discountRules: {
    enabled: true,
    premium: {
      threshold: 100, // $100
      percentage: 0.1, // 10% discount
    },
    standard: {
      threshold: 500, // $500
      percentage: 0.05, // 5% discount
    },
  },
} as const;
