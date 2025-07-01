export type RunSessionIterationRequest = {
  project: string;
  processes: string[]; // Array of process names to execute
  context?: string; // Specific context or focus area
};

export type RunSessionIterationResponse = {
  prompt: string; // Unified execution algorithm prompt for LLM
  context?: string; // Echo of input context parameter
  processes: Record<string, { purpose: string; prompt: string; }>; // Process definitions from config.yaml
};

export enum RunSessionIterationErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  PROCESS_NOT_FOUND = 'PROCESS_NOT_FOUND',
  RUN_ERROR = 'RUN_ERROR',
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR'
} 