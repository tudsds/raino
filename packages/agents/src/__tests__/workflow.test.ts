import { describe, it, expect } from 'vitest';
import { WorkflowMachine, InvalidTransitionError } from '../workflow/machine';
import { WorkflowState, ValidTransitions } from '../workflow/states';

describe('WorkflowMachine', () => {
  it('starts in intake state by default', () => {
    const machine = new WorkflowMachine();
    expect(machine.getCurrentState()).toBe('intake');
  });

  it('starts in specified initial state', () => {
    const machine = new WorkflowMachine('spec_compiled');
    expect(machine.getCurrentState()).toBe('spec_compiled');
  });

  it('performs valid transition: intake → clarifying', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    expect(machine.getCurrentState()).toBe('clarifying');
  });

  it('performs full happy path transitions', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');
    machine.transition('architecture_planned');
    machine.transition('candidates_discovered');
    machine.transition('ingested');
    machine.transition('bom_generated');
    machine.transition('design_pending');
    machine.transition('design_generated');
    machine.transition('validated');
    machine.transition('exported');
    machine.transition('quoted');
    machine.transition('handed_off');
    expect(machine.getCurrentState()).toBe('handed_off');
  });

  it('allows clarifying → clarifying (self-loop)', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('clarifying');
    expect(machine.getCurrentState()).toBe('clarifying');
  });

  it('allows design_generated → design_generated (re-generation)', () => {
    const machine = new WorkflowMachine('design_generated');
    machine.transition('design_generated');
    expect(machine.getCurrentState()).toBe('design_generated');
  });

  it('throws on invalid transition: intake → bom_generated', () => {
    const machine = new WorkflowMachine();
    expect(() => machine.transition('bom_generated')).toThrow(InvalidTransitionError);
  });

  it('throws on invalid transition from handed_off (terminal state)', () => {
    const machine = new WorkflowMachine('handed_off');
    expect(() => machine.transition('intake')).toThrow(InvalidTransitionError);
  });

  it('InvalidTransitionError contains from/to state info', () => {
    const machine = new WorkflowMachine();
    try {
      machine.transition('bom_generated');
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidTransitionError);
      const err = error as InvalidTransitionError;
      expect(err.from).toBe('intake');
      expect(err.to).toBe('bom_generated');
      expect(err.message).toContain('intake');
      expect(err.message).toContain('bom_generated');
    }
  });

  it('canTransition returns true for valid transitions', () => {
    const machine = new WorkflowMachine();
    expect(machine.canTransition('clarifying')).toBe(true);
  });

  it('canTransition returns false for invalid transitions', () => {
    const machine = new WorkflowMachine();
    expect(machine.canTransition('bom_generated')).toBe(false);
  });

  it('records transition history', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');

    const history = machine.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]!.from).toBe('intake');
    expect(history[0]!.to).toBe('clarifying');
    expect(history[1]!.from).toBe('clarifying');
    expect(history[1]!.to).toBe('spec_compiled');
    expect(history[0]!.timestamp).toBeLessThanOrEqual(history[1]!.timestamp);
  });

  it('returns a copy of history (immutable)', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    const history1 = machine.getHistory();
    const history2 = machine.getHistory();
    expect(history1).not.toBe(history2);
    expect(history1).toEqual(history2);
  });

  it('serializes and deserializes correctly', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');

    const serialized = machine.serialize();
    expect(serialized.currentState).toBe('spec_compiled');
    expect(serialized.history).toHaveLength(2);

    const restored = WorkflowMachine.deserialize(serialized);
    expect(restored.getCurrentState()).toBe('spec_compiled');
    expect(restored.getHistory()).toHaveLength(2);
    expect(restored.getHistory()[0]!.to).toBe('clarifying');
    expect(restored.getHistory()[1]!.to).toBe('spec_compiled');
  });

  it('restored machine can continue transitions', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');

    const serialized = machine.serialize();
    const restored = WorkflowMachine.deserialize(serialized);
    restored.transition('architecture_planned');
    expect(restored.getCurrentState()).toBe('architecture_planned');
    expect(restored.getHistory()).toHaveLength(3);
  });

  it('reset clears state and history', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');
    expect(machine.getHistory()).toHaveLength(2);

    machine.reset();
    expect(machine.getCurrentState()).toBe('intake');
    expect(machine.getHistory()).toHaveLength(0);
  });

  it('reset to specific state', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');

    machine.reset('bom_generated');
    expect(machine.getCurrentState()).toBe('bom_generated');
    expect(machine.getHistory()).toHaveLength(0);
  });
});

describe('WorkflowState', () => {
  it('has all expected states', () => {
    const states = Object.values(WorkflowState);
    expect(states).toContain('intake');
    expect(states).toContain('clarifying');
    expect(states).toContain('spec_compiled');
    expect(states).toContain('architecture_planned');
    expect(states).toContain('candidates_discovered');
    expect(states).toContain('ingested');
    expect(states).toContain('bom_generated');
    expect(states).toContain('design_pending');
    expect(states).toContain('design_generated');
    expect(states).toContain('validated');
    expect(states).toContain('exported');
    expect(states).toContain('quoted');
    expect(states).toContain('handed_off');
    expect(states).toHaveLength(13);
  });
});

describe('ValidTransitions', () => {
  it('intake can only transition to clarifying', () => {
    expect(ValidTransitions['intake']).toEqual(['clarifying']);
  });

  it('handed_off has no valid transitions', () => {
    expect(ValidTransitions['handed_off']).toEqual([]);
  });

  it('every state has a defined transitions array', () => {
    const states = Object.values(WorkflowState);
    for (const state of states) {
      expect(Array.isArray(ValidTransitions[state])).toBe(true);
    }
  });
});
