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
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
