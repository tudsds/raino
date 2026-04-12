import { type WorkflowStateType } from './states';
export interface TransitionEntry {
    from: WorkflowStateType;
    to: WorkflowStateType;
    timestamp: number;
}
export interface SerializedMachine {
    currentState: WorkflowStateType;
    history: TransitionEntry[];
}
export declare class InvalidTransitionError extends Error {
    readonly from: WorkflowStateType;
    readonly to: WorkflowStateType;
    constructor(from: WorkflowStateType, to: WorkflowStateType);
}
export declare class WorkflowMachine {
    private state;
    private transitionHistory;
    constructor(initialState?: WorkflowStateType);
    transition(to: WorkflowStateType): void;
    canTransition(to: WorkflowStateType): boolean;
    getCurrentState(): WorkflowStateType;
    getHistory(): TransitionEntry[];
    serialize(): SerializedMachine;
    static deserialize(data: SerializedMachine): WorkflowMachine;
    reset(state?: WorkflowStateType): void;
}
//# sourceMappingURL=machine.d.ts.map