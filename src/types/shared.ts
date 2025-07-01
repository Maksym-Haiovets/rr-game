// Shared types between client and server
export interface Position {
  id: number;
  result: 'none' | 'take' | 'stop';
}

export interface UserSettings {
  risk_per_position: number;
  reward_ratio: number;
  tutorial_completed: boolean;
  tutorial_skipped_forever: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProfitCalculation {
  takes: number;
  stops: number;
  totalProfit: number;
  winRate: number;
  profitLevel: string;
  color: string;
}