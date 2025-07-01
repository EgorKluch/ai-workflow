export type CreateSessionRequest = {
  project: string;
  sessionPath: string;
};

export type CreateSessionResponse = {
  processes: Record<string, string>; // Available processes from config.yaml with their purposes
  prompt: string; // Algorithm prompt for LLM to start workflow execution
};

export enum CreateSessionErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  CREATE_SESSION_ERROR = 'CREATE_SESSION_ERROR'
} 