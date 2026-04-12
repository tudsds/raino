import { ValidTransitions, WorkflowState } from './states';
export class InvalidTransitionError extends Error {
    from;
    to;
    constructor(from, to) {
        const allowed = ValidTransitions[from].join(', ');
        super(`Invalid transition from "${from}" to "${to}". Allowed transitions: [${allowed}]`);
        this.name = 'InvalidTransitionError';
        this.from = from;
        this.to = to;
    }
}
export class WorkflowMachine {
    state;
    transitionHistory;
    constructor(initialState = WorkflowState.INTAKE) {
        this.state = initialState;
        this.transitionHistory = [];
    }
    transition(to) {
        if (!this.canTransition(to)) {
            throw new InvalidTransitionError(this.state, to);
        }
        const from = this.state;
        this.transitionHistory.push({
            from,
            to,
            timestamp: Date.now(),
        });
        this.state = to;
    }
    canTransition(to) {
        const allowed = ValidTransitions[this.state];
        return allowed.includes(to);
    }
    getCurrentState() {
        return this.state;
    }
    getHistory() {
        return [...this.transitionHistory];
    }
    serialize() {
        return {
            currentState: this.state,
            history: [...this.transitionHistory],
        };
    }
    static deserialize(data) {
        const machine = new WorkflowMachine(data.currentState);
        machine.transitionHistory = data.history.map((entry) => ({ ...entry }));
        return machine;
    }
    reset(state = WorkflowState.INTAKE) {
        this.state = state;
        this.transitionHistory = [];
    }
}
//# sourceMappingURL=machine.js.map