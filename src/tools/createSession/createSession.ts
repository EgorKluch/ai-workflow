import { McpSession } from 'flowmcp';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { CreateSessionRequest, CreateSessionResponse, CreateSessionErrorCode } from './createSession.types.js';
import { planSessionIteration } from '../planSessionIteration/planSessionIteration.js';

export async function createSession(session: McpSession, args: CreateSessionRequest): Promise<CreateSessionResponse> {
  
  try {
    const { project, sessionPath } = args;
    
    // Validate parameters
    if (!project) {
      session.logger.addError({
        code: CreateSessionErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
      return { processes: {}, prompt: '' };
    }

    if (!sessionPath) {
      session.logger.addError({
        code: CreateSessionErrorCode.INVALID_REQUEST,
        message: 'sessionPath parameter is required',
        context: { arguments: args }
      });
      return { processes: {}, prompt: '' };
    }



    // Check if file with sessionPath exists and delete it if it does
    const fullSessionPath = join(project, sessionPath);
    if (existsSync(fullSessionPath)) {
      unlinkSync(fullSessionPath);
    }

    // Create directory if it doesn't exist
    const sessionDir = dirname(fullSessionPath);
    if (!existsSync(sessionDir)) {
      mkdirSync(sessionDir, { recursive: true });
    }

    // Create new session file at sessionPath with recommended structure
    const sessionTemplate = `# Session File
goal: "No information" # User will provide goal here

# IMMUTABLE SECTIONS (preserve exactly, can expand)
immutable:
  scopeBoundaries:
    inScope: "No information" # items explicitly in scope
    outOfScope: "No information" # items explicitly out of scope
  
  userDecisions: "No information" # confirmed user choices and preferences
  constraints: "No information" # technical, business, or resource limitations
  successCriteria: "No information" # measurable completion outcomes
  architecturalDecisions: "No information" # major technical architecture choices

# EVOLVING SECTIONS (replace outdated content)
evolving:
  technicalContext:
    currentArchitecture: "No information" # system structure overview
    patterns: "No information" # coding patterns to follow
    dependencies: "No information" # critical integrations and libraries
  
  requirements:
    functional: "No information" # what system must do
    nonFunctional: "No information" # performance, security, usability requirements
  
  progressState:
    completed: []
    inProgress: []
    pending: []
  
  analysisResults: "No information" # key findings from various analyses

# BLOCKER MANAGEMENT (special handling)
blockers:
  needToUserApprove: []
  needToClarify: []

# CONSOLIDATABLE SECTIONS (merge similar content)
consolidatable:
  implementationNotes: "No information" # important technical observations

# EXPENDABLE SECTIONS (can become obsolete)
expendable:
  workingNotes: "No information" # temporary analysis and thoughts
  debugInfo: []
`;

    writeFileSync(fullSessionPath, sessionTemplate, 'utf8');

    // Call planSessionIteration() internally
    const planResult = await planSessionIteration(session, {});
    
    // Return planSessionIteration result directly without modification
    return planResult;
    
  } catch (error) {
    session.logger.addError({
      code: CreateSessionErrorCode.CREATE_SESSION_ERROR,
      message: `Create session operation failed: ${error instanceof Error ? error.message : String(error)}`,
      context: { 
        arguments: args,
        error: error instanceof Error ? error.stack : String(error)
      }
    });
    
    return { processes: {}, prompt: '' };
  }
} 