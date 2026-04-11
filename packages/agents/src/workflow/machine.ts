import { type WorkflowStateType, ValidTransitions, WorkflowState } from './states';

export interface TransitionEntry {
  from: WorkflowStateType;
  to: WorkflowStateType;
  timestamp: number;
}

export interface SerializedMachine {
  currentState: WorkflowStateType;
  history: TransitionEntry[];
}

export class InvalidTransitionError extends Error {
  public readonly from: WorkflowStateType;
  public readonly to: WorkflowStateType;

  constructor(from: WorkflowStateType, to: WorkflowStateType) {
    const allowed = ValidTransitions[from].join(', ');
    super(`Invalid transition from "${from}" to "${to}". Allowed transitions: [${allowed}]`);
    this.name = 'InvalidTransitionError';
    this.from = from;
    this.to = to;
  }
}

export class WorkflowMachine {
  private state: WorkflowStateType;
  private transitionHistory: TransitionEntry[];

  constructor(initialState: WorkflowStateType = WorkflowState.INTAKE) {
    this.state = initialState;
    this.transitionHistory = [];
  }

  transition(to: WorkflowStateType): void {
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

  canTransition(to: WorkflowStateType): boolean {
    const allowed = ValidTransitions[this.state];
    return allowed.includes(to);
  }

  getCurrentState(): WorkflowStateType {
    return this.state;
  }

  getHistory(): TransitionEntry[] {
    return [...this.transitionHistory];
  }

  serialize(): SerializedMachine {
    return {
      currentState: this.state,
      history: [...this.transitionHistory],
    };
  }

  static deserialize(data: SerializedMachine): WorkflowMachine {
    const machine = new WorkflowMachine(data.currentState);
    machine.transitionHistory = data.history.map((entry) => ({ ...entry }));
    return machine;
  }

  reset(state: WorkflowStateType = WorkflowState.INTAKE): void {
    this.state = state;
    this.transitionHistory = [];
  }
}
