export declare class TutorialManager {
    private isActive;
    private currentStep;
    private steps;
    constructor();
    private initSteps;
    start(): Promise<void>;
    private showStep;
    private highlightElement;
    private showTooltip;
    private nextStep;
    private skip;
    private complete;
}
export declare const tutorialManager: TutorialManager;
