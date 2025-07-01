import { McpSession } from 'flowmcp';
import { UpdateSessionRequest, UpdateSessionResponse, UpdateSessionErrorCode } from './updateSession.types.js';
import { getCoreConfig } from '../../utils/getConfig/index.js';
import { CoreConfig } from '../../types/core.types.js';

export async function updateSession(session: McpSession, args: UpdateSessionRequest): Promise<UpdateSessionResponse> {
  
  try {
    const { project } = args;
    
    // Validate parameters
    if (!project) {
      session.logger.addError({
        code: UpdateSessionErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
      return { prompt: '' };
    }

    // Read session update prompt from core.yaml
    let coreConfigData: CoreConfig;
    try {
      coreConfigData = getCoreConfig<CoreConfig>();
    } catch (configError) {
      session.logger.addError({
        code: UpdateSessionErrorCode.CONFIG_LOAD_ERROR,
        message: `Failed to load core configuration: ${configError instanceof Error ? configError.message : String(configError)}`,
        context: { arguments: args, configError }
      });
      return { prompt: '' };
    }

    const updateSessionProcess = coreConfigData.core.processes.updateSession;
    if (!updateSessionProcess) {
      session.logger.addError({
        code: UpdateSessionErrorCode.PROCESS_NOT_FOUND,
        message: 'updateSession process not found in core.yaml',
        context: { arguments: args }
      });
      return { prompt: '' };
    }

    // Return prompt as string for LLM execution
    const response: UpdateSessionResponse = {
      prompt: updateSessionProcess.prompt
    };
    
    return response;
    
  } catch (error) {
    session.logger.addError({
      code: UpdateSessionErrorCode.UPDATE_ERROR,
      message: `updateSession operation failed: ${error instanceof Error ? error.message : String(error)}`,
      context: { 
        arguments: args,
        error: error instanceof Error ? error.stack : String(error)
      }
    });
    
    return { prompt: '' };
  }
} 