export interface Position {
  id: number;
  result: 'none' | 'take' | 'stop';
}

export interface UserSettings {
  id: number;
  risk_per_position: number;
  reward_ratio: number;
  tutorial_completed: boolean;
  tutorial_skipped_forever: boolean;
}

export interface GameStats {
  takes: number;
  stops: number;
  profit: number;
  winRate: number;
}

export interface GameState {
  positions: Position[];
  settings: UserSettings;
  stats: GameStats;
}

export interface ProfitGrade {
  id: string;
  title: string;
  minProfit: number;
  minWinRate: number;
  color: string;
  emoji: string;
}