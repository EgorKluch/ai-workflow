export type ProcessConfig = {
  purpose: string;
  prompt: string;
};

export type ProcessesConfig = {
  processes: Record<string, ProcessConfig>;
}; 