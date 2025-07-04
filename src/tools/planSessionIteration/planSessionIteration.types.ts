export interface PlanSessionIterationRequest {
  project: string; // Project path for config resolution (required)
}

export interface PlanSessionIterationResponse {
  prompt: string; // Planning algorithm prompt with available processes and requirements
} 