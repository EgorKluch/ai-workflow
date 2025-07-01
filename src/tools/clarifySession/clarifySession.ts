import { McpSession } from 'flowmcp';
import { ClarifySessionRequest, ClarifySessionResponse, ClarifySessionErrorCode } from './clarifySession.types.js';
import { getCoreConfig, getConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';
import { CoreConfig } from '../../types/core.types.js';

export async function clarifySession(session: McpSession, args: ClarifySessionRequest): Promise<ClarifySessionResponse> {
  
  try {
    const { project, context } = args;
    
    // Validate parameters
    if (!project) {
      session.logger.addError({
        code: ClarifySessionErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
      return { prompt: '', processes: {}, context: '' };
    }

    if (!context) {
      session.logger.addError({
        code: ClarifySessionErrorCode.INVALID_REQUEST,
        message: 'Context parameter is required - describe the problem that requires clarification',
        context: { arguments: args }
      });
      return { prompt: '', processes: {}, context: '' };
    }

    // Get available processes via getSessionProcesses equivalent
    let availableProcesses: Record<string, string> = {};
    try {
      const configData = getConfig<Config>();
      for (const [processName, processConfig] of Object.entries(configData.config.processes)) {
        availableProcesses[processName] = processConfig.purpose;
      }
    } catch (configError) {
      session.logger.addError({
        code: ClarifySessionErrorCode.PROCESSES_LOAD_ERROR,
        message: `Failed to load available processes: ${configError instanceof Error ? configError.message : String(configError)}`,
        context: { arguments: args, configError }
      });
      return { prompt: '', processes: {}, context: '' };
    }

    // Read clarification prompt template from core.yaml
    let coreConfig: CoreConfig;
    try {
      coreConfig = getCoreConfig<CoreConfig>();
    } catch (coreError) {
      session.logger.addError({
        code: ClarifySessionErrorCode.CORE_LOAD_ERROR,
        message: `Failed to load core.yaml: ${coreError instanceof Error ? coreError.message : String(coreError)}`,
        context: { arguments: args, coreError }
      });
      return { prompt: '', processes: {}, context: '' };
    }

    // Get clarifySession process
    const clarifyProcess = coreConfig.core.processes.clarifySession;
    if (!clarifyProcess) {
      session.logger.addError({
        code: ClarifySessionErrorCode.CORE_LOAD_ERROR,
        message: 'clarifySession process not found in core.yaml',
        context: { arguments: args }
      });
      return { prompt: '', processes: {}, context: '' };
    }

    // Combine template with context and available processes
    const resolutionPrompt = `${clarifyProcess.prompt}

PROBLEM CONTEXT PROVIDED: ${context}

AVAILABLE PROCESSES FOR SELECTION:
${Object.entries(availableProcesses).map(([name, purpose]) => `- ${name}: ${purpose}`).join('\n')}

RESOLUTION ALGORITHM:
1. Analyze the provided problem context to identify specific information gaps
2. Select appropriate processes from the available list that can help resolve the uncertainty
3. Validate that selected processes make logical sense for the problem context
4. Call runSessionIteration with selected processes and transformed context
5. If after iteration completion the problem is not resolved, explicitly request user help

Remember: Transform the problem context into actionable iteration context that guides resolution.`;

    // Return structured result with resolution algorithm
    const response: ClarifySessionResponse = {
      prompt: resolutionPrompt,
      processes: availableProcesses,
      context: context
    };
    
    return response;
    
  } catch (error) {
    session.logger.addError({
      code: ClarifySessionErrorCode.CLARIFY_SESSION_ERROR,
      message: `Clarify session operation failed: ${error instanceof Error ? error.message : String(error)}`,
      context: { 
        arguments: args,
        error: error instanceof Error ? error.stack : String(error)
      }
    });
    
    return { prompt: '', processes: {}, context: '' };
  }
} 