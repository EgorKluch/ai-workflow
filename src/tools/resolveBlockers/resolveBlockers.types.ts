export type ResolveBlockersRequest = {
  project: string;
};

export type ResolveBlockersResponse = {
  prompt: string; // Blocker resolution strategy algorithm for LLM
};

export enum ResolveBlockersErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR',
  RESOLVE_ERROR = 'RESOLVE_ERROR'
} 