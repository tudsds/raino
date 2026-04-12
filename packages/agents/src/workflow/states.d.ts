export declare const WorkflowState: {
    readonly INTAKE: "intake";
    readonly CLARIFYING: "clarifying";
    readonly SPEC_COMPILED: "spec_compiled";
    readonly ARCHITECTURE_PLANNED: "architecture_planned";
    readonly CANDIDATES_DISCOVERED: "candidates_discovered";
    readonly INGESTED: "ingested";
    readonly BOM_GENERATED: "bom_generated";
    readonly DESIGN_GENERATED: "design_generated";
    readonly VALIDATED: "validated";
    readonly EXPORTED: "exported";
    readonly QUOTED: "quoted";
    readonly HANDED_OFF: "handed_off";
};
export type WorkflowStateType = (typeof WorkflowState)[keyof typeof WorkflowState];
export declare const ValidTransitions: Record<WorkflowStateType, WorkflowStateType[]>;
export declare const WorkflowStateLabels: Record<WorkflowStateType, string>;
//# sourceMappingURL=states.d.ts.map