export type UpdateSessionRequest = {
  project: string;
};

export type UpdateSessionResponse = {
  prompt: string; // Algorithm prompt for session update procedure
};

export enum UpdateSessionErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  PROCESS_NOT_FOUND = 'PROCESS_NOT_FOUND',
  UPDATE_ERROR = 'UPDATE_ERROR',
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR'
} 