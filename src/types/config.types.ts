import { ProcessConfig } from './processes.types.js';

export interface Config {
  config: {
    processes: Record<string, ProcessConfig>;
  };
} 