import { ProcessConfig } from './processes.types.js';

export type CoreProcessesConfig = {
  processes: Record<string, ProcessConfig>;
};

export type CoreConfig = {
  core: CoreProcessesConfig;
}; 