import { Achievement } from '../types';
interface AchievementRule {
    code: string;
    title: string;
    description: string;
    checkCondition: (stats: any) => boolean;
}
export declare const ACHIEVEMENT_RULES: AchievementRule[];
export declare function initAchievements(achievements: Achievement[]): void;
export declare function incrementClicks(): void;
export declare function checkAchievements(stats: {
    takes: number;
    stops: number;
    profit: number;
    winRate: number;
}): Promise<void>;
export declare function updateAchievementsDisplay(): void;
export {};
