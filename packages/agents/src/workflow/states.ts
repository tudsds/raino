export const WorkflowState = {
  INTAKE: 'intake',
  CLARIFYING: 'clarifying',
  SPEC_COMPILED: 'spec_compiled',
  ARCHITECTURE_PLANNED: 'architecture_planned',
  CANDIDATES_DISCOVERED: 'candidates_discovered',
  INGESTED: 'ingested',
  BOM_GENERATED: 'bom_generated',
  DESIGN_PENDING: 'design_pending',
  DESIGN_GENERATED: 'design_generated',
  VALIDATED: 'validated',
  EXPORTED: 'exported',
  QUOTED: 'quoted',
  HANDED_OFF: 'handed_off',
} as const;

export type WorkflowStateType = (typeof WorkflowState)[keyof typeof WorkflowState];

export const ValidTransitions: Record<WorkflowStateType, WorkflowStateType[]> = {
  intake: ['clarifying'],
  clarifying: ['spec_compiled', 'clarifying'],
  spec_compiled: ['architecture_planned'],
  architecture_planned: ['candidates_discovered'],
  candidates_discovered: ['ingested'],
  ingested: ['bom_generated'],
  bom_generated: ['design_pending'],
  design_pending: ['design_generated'],
  design_generated: ['validated', 'design_generated'],
  validated: ['exported'],
  exported: ['quoted'],
  quoted: ['handed_off'],
  handed_off: [],
};

export const WorkflowStateLabels: Record<WorkflowStateType, string> = {
  intake: 'Intake',
  clarifying: 'Clarifying',
  spec_compiled: 'Spec Compiled',
  architecture_planned: 'Architecture Planned',
  candidates_discovered: 'Candidates Discovered',
  ingested: 'Ingested',
  bom_generated: 'BOM Generated',
  design_pending: 'Design Pending',
  design_generated: 'Design Generated',
  validated: 'Validated',
  exported: 'Exported',
  quoted: 'Quoted',
  handed_off: 'Handed Off',
};
