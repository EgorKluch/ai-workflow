import { McpSession } from 'flowmcp';
import { GetSessionProcessesRequest, GetSessionProcessesResponse, GetSessionProcessesErrorCode } from './getSessionProcesses.types.js';
import { getConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';

export async function getSessionProcesses(session: McpSession, args: GetSessionProcessesRequest): Promise<GetSessionProcessesResponse> {
  
  try {
    const { project } = args;
    
    // Validate parameters
    if (!project) {
      session.logger.addError({
        code: GetSessionProcessesErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
      return { processes: {} };
    }

    // Load processes from config.yaml
    let configData: Config;
    try {
      configData = getConfig<Config>();
    } catch (configError) {
      session.logger.addError({
        code: GetSessionProcessesErrorCode.CONFIG_LOAD_ERROR,
        message: `Failed to load processes configuration: ${configError instanceof Error ? configError.message : String(configError)}`,
        context: { arguments: args, configError }
      });
      return { processes: {} };
    }

    // Extract process names and purposes
    // Return object mapping process names to their purpose descriptions
    // Implementation: reduce(processes, (result, {purpose}, name) => ({...result, [name]: purpose}), {})
    const processes = Object.keys(configData.config.processes).reduce((result, processName) => {
      const processConfig = configData.config.processes[processName];
      return {
        ...result,
        [processName]: processConfig.purpose
      };
    }, {} as Record<string, string>);

    const response: GetSessionProcessesResponse = {
      processes
    };
    
    return response;
    
  } catch (error) {
    session.logger.addError({
      code: GetSessionProcessesErrorCode.GET_PROCESSES_ERROR,
      message: `Get processes operation failed: ${error instanceof Error ? error.message : String(error)}`,
      context: { 
        arguments: args,
        error: error instanceof Error ? error.stack : String(error)
      }
    });
    
    return { processes: {} };
  }
} 