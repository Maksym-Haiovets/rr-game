import { ProfitGrade } from '../types';
export declare const PROFIT_GRADES: ProfitGrade[];
export declare function getCurrentGrade(takes: number, stops: number, profit: number): ProfitGrade | null;
export declare function updateProfitGradeDisplay(takes: number, stops: number, profit: number): void;
