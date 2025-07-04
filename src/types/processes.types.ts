export type ProcessConfig = {
  purpose: string;
  requirements?: string[];
  prompt: {
    role: string;
    text: string;
    actions?: {
      trigger: string;
      action: string;
    }[];
    respond: string;
  };
};

export type ProcessesConfig = {
  processes: Record<string, ProcessConfig>;
}; 