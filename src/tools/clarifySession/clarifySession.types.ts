export interface ClarifySessionRequest {
  project: string;
  context: string; // Description of uncertain situation, ambiguity, conflict that needs clarification
}

export interface ClarifySessionResponse {
  prompt: string; // Resolution strategy algorithm for LLM
  processes: Record<string, string>; // Available processes for selection (from getSessionProcesses)
  context: string; // Echo of input context parameter
}

export enum ClarifySessionErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  CORE_LOAD_ERROR = 'CORE_LOAD_ERROR',
  PROCESSES_LOAD_ERROR = 'PROCESSES_LOAD_ERROR',
  CLARIFY_SESSION_ERROR = 'CLARIFY_SESSION_ERROR'
} 