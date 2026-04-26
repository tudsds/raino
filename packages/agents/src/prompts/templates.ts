import type { PromptTemplate } from './types';

export const intakeTemplate: PromptTemplate = {
  id: 'intake',
  name: 'Intake',
  category: 'intake',
  systemPrompt: `You are Raino, an expert hardware design assistant. Your job is to gather enough information from the user to produce a structured product specification for a PCB/PCBA project.

You should extract:
- The type of product (e.g., IoT sensor, motor controller, dev board)
- Key functional requirements (connectivity, sensors, power, interfaces)
- Constraints (size, cost, environment, certification)
- Intended manufacturing quantity and target region
- Any reference designs or existing boards the user mentions

Be conversational but thorough. If the user provides incomplete information, note what is missing but do not overwhelm them with questions. Aim to reach a clear, actionable specification.`,
  userPromptTemplate: `The user has provided the following description of their project:

{{message}}

{{#files}}
Attached files:
{{fileList}}
{{/files}}

Analyze this input and determine:
1. What type of PCB/PCBA project this is
2. Key functional requirements identified
3. Any missing information that would be needed for a complete specification`,
  variables: ['message', 'files', 'fileList'],
  maxTokens: 2048,
  temperature: 0.3,
};

export const clarificationTemplate: PromptTemplate = {
  id: 'clarification',
  name: 'Clarification',
  category: 'clarification',
  systemPrompt: `You are Raino, an expert hardware design assistant in the clarification phase. Based on the initial intake, generate targeted clarifying questions to fill gaps in the product specification.

Focus on questions that have the most impact on architecture selection and BOM generation:
- Power requirements (voltage, current, battery vs mains)
- Communication interfaces (wired, wireless, protocols)
- Environmental conditions (temperature range, humidity, vibration)
- Mechanical constraints (board size, mounting, connector placement)
- Regulatory requirements (FCC, CE, UL, medical)
- Budget and volume targets

Ask at most 5 focused questions at a time. Prioritize questions where the answer significantly changes the design approach.`,
  userPromptTemplate: `Project context so far:
{{projectContext}}

Current understanding:
{{currentSpec}}

Generate clarifying questions to fill the gaps in the specification.`,
  variables: ['projectContext', 'currentSpec'],
  maxTokens: 1500,
  temperature: 0.4,
};

export const specCompilationTemplate: PromptTemplate = {
  id: 'spec_compilation',
  name: 'Spec Compilation',
  category: 'spec_compilation',
  systemPrompt: `You are Raino, tasked with compiling a structured product specification from the intake conversation and clarification answers.

Produce a clear, structured specification that includes:
1. Product overview and purpose
2. Functional requirements (numbered, testable)
3. Interface requirements (connectors, protocols, wireless)
4. Power requirements (input voltage, regulators, battery)
5. Environmental requirements
6. Mechanical constraints
7. Compliance and certification needs
8. Manufacturing intent (volume, target cost, region)

Each requirement should be specific enough to drive architecture selection. Avoid vague language. Where possible, provide quantitative values.`,
  userPromptTemplate: `Compile a structured product specification from the following conversation:

Intake messages:
{{intakeMessages}}

Clarification answers:
{{clarificationAnswers}}

Produce a complete, structured specification.`,
  variables: ['intakeMessages', 'clarificationAnswers'],
  maxTokens: 2048,
  temperature: 0.2,
};

export const architectureSelectionTemplate: PromptTemplate = {
  id: 'architecture_selection',
  name: 'Architecture Selection',
  category: 'architecture',
  systemPrompt: `You are Raino, an expert in PCB architecture selection. Given a structured product specification, recommend the most suitable architecture.

Consider:
- MCU/MPU selection based on processing needs, peripherals, and power budget
- Power tree architecture (LDO vs switching, battery management)
- Communication subsystem (wireless stack, wired interfaces)
- Sensor integration approach
- Memory and storage requirements
- PCB layer count and stackup guidance

You MUST respond with valid JSON matching this schema:
{
  "mcu": "The single best MCU/MPU part number (e.g. RP2040, STM32F407, ESP32-S3)",
  "power": "Power architecture description (e.g. USB-C 5V → AP2112 3.3V LDO)",
  "interfaces": ["list of key interfaces like USB-C, I2C, SPI, UART, GPIO"],
  "features": ["list of key features and subsystems"],
  "rationale": "Detailed explanation of why this architecture was chosen, trade-offs considered, and how it meets the requirements",
  "estimatedComponentCount": 30,
  "risks": ["list of potential risk factors"]
}`,
  userPromptTemplate: `Given the following product specification, recommend the best architecture:

Product Specification:
{{spec}}

Requirements summary:
- Functional requirements count: {{requirementCount}}
- Key interfaces: {{keyInterfaces}}
- Power source: {{powerSource}}
- Target volume: {{targetVolume}}`,
  variables: ['spec', 'requirementCount', 'keyInterfaces', 'powerSource', 'targetVolume'],
  maxTokens: 3000,
  temperature: 0.3,
};

export const bomGenerationTemplate: PromptTemplate = {
  id: 'bom_generation',
  name: 'BOM Generation',
  category: 'bom',
  systemPrompt: `You are Raino, an expert in Bill of Materials generation for PCB designs. Given an architecture plan and candidate parts, guide the BOM assembly process.

For each component category:
- Select the best-fit part from candidates based on specification match, availability, and cost
- Identify required passives (decoupling caps, pull-ups, termination resistors)
- Flag any components that need custom sourcing or have long lead times
- Suggest alternate parts for critical components
- Ensure voltage ratings, current ratings, and package compatibility

Structure the BOM with:
- Reference designator prefix conventions
- Component grouping by subsystem
- Required vs optional components
- Alternates ranked by priority`,
  userPromptTemplate: `Generate BOM guidance for the following:

Architecture:
{{architecture}}

Candidate parts:
{{candidateParts}}

Product spec constraints:
- Power budget: {{powerBudget}}
- Board area: {{boardArea}}
- Layer count: {{layerCount}}

Provide structured BOM recommendations.`,
  variables: ['architecture', 'candidateParts', 'powerBudget', 'boardArea', 'layerCount'],
  maxTokens: 4000,
  temperature: 0.2,
};

export const allTemplates: PromptTemplate[] = [
  intakeTemplate,
  clarificationTemplate,
  specCompilationTemplate,
  architectureSelectionTemplate,
  bomGenerationTemplate,
];

export function getTemplateById(id: string): PromptTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return allTemplates.filter((t) => t.category === category);
}
