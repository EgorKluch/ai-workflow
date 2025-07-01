export interface PlanSessionIterationRequest {
  // No input parameters - LLM uses session path from context
}

export interface PlanSessionIterationResponse {
  prompt: string;
  processes: Record<string, string>; // processName -> purpose mapping
} 