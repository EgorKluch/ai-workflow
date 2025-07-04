export type RunSessionIterationRequest = {
  project: string;
  processes: string[]; // Array of process names to execute
};

export type RunSessionIterationResponse = {
  prompt: string; // Unified execution algorithm prompt for LLM
};

export enum RunSessionIterationErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  PROCESS_NOT_FOUND = 'PROCESS_NOT_FOUND',
  RUN_ERROR = 'RUN_ERROR',
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR',
  CORE_LOAD_ERROR = 'CORE_LOAD_ERROR'
} 