import { Position, UserSettings, Achievement } from '../../src/types/shared';

export { Position, UserSettings, Achievement };

export interface GameState {
  positions: Position[];
  settings: UserSettings;
  achievements: Achievement[];
  stats: {
    takes: number;
    stops: number;
    profit: number;
    winRate: number;
  };
}

export interface ProfitGrade {
  label: string;
  profitPct: number;
  takes: number;
  stops: number;
  winRate: number;
  className: string;
}