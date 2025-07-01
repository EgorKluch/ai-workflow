export interface GetSessionProcessesRequest {
  project: string;
}

export interface GetSessionProcessesResponse {
  processes: Record<string, string>;
}

export enum GetSessionProcessesErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR',
  GET_PROCESSES_ERROR = 'GET_PROCESSES_ERROR'
} 