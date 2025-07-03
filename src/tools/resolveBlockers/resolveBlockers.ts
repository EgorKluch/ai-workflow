import { McpSession } from 'flowmcp';
import { ResolveBlockersRequest, ResolveBlockersResponse, ResolveBlockersErrorCode } from './resolveBlockers.types.js';
import { getCoreConfig } from '../../utils/getConfig/index.js';
import { CoreConfig } from '../../types/core.types.js';
import { resolveProjectPath } from '../../utils/pathUtils/index.js';

export async function resolveBlockers(session: McpSession, args: ResolveBlockersRequest): Promise<ResolveBlockersResponse> {
  
  try {
    const { project: rawProject } = args;
    
    // Decode URL-encoded project path (Windows compatibility)
    const project = resolveProjectPath(rawProject);
    
    // Validate parameters
    if (!project) {
      session.logger.addError({
        code: ResolveBlockersErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
      return { prompt: '' };
    }

    // Load templates from core.yaml
    let coreConfig: CoreConfig;
    try {
      coreConfig = getCoreConfig<CoreConfig>();
    } catch (coreError) {
      session.logger.addError({
        code: ResolveBlockersErrorCode.CONFIG_LOAD_ERROR,
        message: `Failed to load core.yaml: ${coreError instanceof Error ? coreError.message : String(coreError)}`,
        context: { arguments: args, coreError }
      });
      return { prompt: '' };
    }

    const resolveBlockersProcess = coreConfig.core.processes?.resolveSessionBlockers;
    if (!resolveBlockersProcess) {
      session.logger.addError({
        code: ResolveBlockersErrorCode.CONFIG_LOAD_ERROR,
        message: 'resolveBlockers process not found in core.yaml',
        context: { arguments: args }
      });
      return { prompt: '' };
    }

    // Prepare blocker resolution prompt
    const prompt = resolveBlockersProcess.prompt;

    const response: ResolveBlockersResponse = {
      prompt
    };
    
    return response;
    
  } catch (error) {
    session.logger.addError({
      code: ResolveBlockersErrorCode.RESOLVE_ERROR,
      message: `Resolve blockers operation failed: ${error instanceof Error ? error.message : String(error)}`,
      context: { 
        arguments: args,
        error: error instanceof Error ? error.stack : String(error)
      }
    });
    
    return { prompt: '' };
  }
} 