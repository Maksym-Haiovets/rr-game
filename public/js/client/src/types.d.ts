import { Position, UserSettings } from '../../src/types/shared';
export { Position, UserSettings };
export interface GameState {
    positions: Position[];
    settings: UserSettings;
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
    description: string;
}
