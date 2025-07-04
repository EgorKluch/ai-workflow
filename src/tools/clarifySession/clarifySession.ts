import { McpSession } from 'flowmcp';
import { ClarifySessionRequest, ClarifySessionResponse, ClarifySessionErrorCode } from './clarifySession.types.js';
import { getCoreConfig, getConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';
import { CoreConfig } from '../../types/core.types.js';
import { resolveProjectPath } from '../../utils/pathUtils/index.js';

export async function clarifySession(session: McpSession, args: ClarifySessionRequest): Promise<ClarifySessionResponse> {
  
  try {
    const { project: rawProject, context } = args;
    
    // Decode URL-encoded project path (Windows compatibility)
    const project = resolveProjectPath(rawProject);
    
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
      const configData = getConfig<Config>(project);
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
      coreConfig = getCoreConfig<CoreConfig>(project);
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

    // Get template extensions from core.yaml
    const extensions = coreConfig.core.templates?.clarifySessionExtensions;
    if (!extensions) {
      session.logger.addError({
        code: ClarifySessionErrorCode.CORE_LOAD_ERROR,
        message: 'clarifySessionExtensions templates not found in core.yaml',
        context: { arguments: args }
      });
      return { prompt: '', processes: {}, context: '' };
    }

    // Combine template with context and available processes using template
    const availableProcessesList = Object.entries(availableProcesses)
      .map(([name, purpose]) => `- ${name}: ${purpose}`)
      .join('\n');

    const extensionSection = extensions.contextSection
      .replace('{{CONTEXT}}', context)
      .replace('{{AVAILABLE_PROCESSES}}', availableProcessesList);

    const resolutionPrompt = `${clarifyProcess.prompt}\n\n${extensionSection}`;

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