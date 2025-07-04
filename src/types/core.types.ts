import { ProcessConfig } from './processes.types.js';

export type RunSessionIterationTemplates = {
  purpose: string;
  unifiedPromptHeader: string;
  processTemplate: string;
  contextGuidance: string;
  mandatoryCompletion: string;
};

export type ClarifySessionExtensions = {
  purpose: string;
  contextSection: string;
};

export type CoreTemplates = {
  runSessionIteration: RunSessionIterationTemplates;
  clarifySessionExtensions: ClarifySessionExtensions;
};

export type CoreProcess = {
  purpose: string;
  prompt: string; // In core.yaml, prompt is a string, not an object
};

export type CoreProcessesConfig = {
  processes: Record<string, CoreProcess>;
  templates?: CoreTemplates;
};

export type CoreConfig = {
  core: CoreProcessesConfig;
}; 