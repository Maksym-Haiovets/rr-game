import { ProfitGrade } from '../types';
export declare const PROFIT_GRADES: ProfitGrade[];
export declare function detectGrade(takes: number, stops: number): ProfitGrade | null;
export declare function getGradeByProfit(profitPct: number): ProfitGrade | null;
export declare function updateGradeDisplay(takes: number, stops: number, profitPct: number): void;
