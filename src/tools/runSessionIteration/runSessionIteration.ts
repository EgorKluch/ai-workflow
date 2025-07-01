import { McpSession } from 'flowmcp';
import { RunSessionIterationRequest, RunSessionIterationResponse, RunSessionIterationErrorCode } from './runSessionIteration.types.js';
import { getConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';

export async function runSessionIteration(session: McpSession, args: RunSessionIterationRequest): Promise<RunSessionIterationResponse> {
  
  try {
    const { project, processes, context } = args;
    
    // Validate parameters
    if (!project) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
      return { prompt: '', processes: {} };
    }

    if (!processes || !Array.isArray(processes) || processes.length === 0) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Processes parameter is required and must be a non-empty array',
        context: { arguments: args }
      });
      return { prompt: '', processes: {} };
    }

    // Load process definitions from config.yaml for specified process names
    let configData: Config;
    try {
      configData = getConfig<Config>();
    } catch (configError) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.CONFIG_LOAD_ERROR,
        message: `Failed to load processes configuration: ${configError instanceof Error ? configError.message : String(configError)}`,
        context: { arguments: args, configError }
      });
      return { prompt: '', processes: {} };
    }

    // Validate all processes exist and load their definitions
    const processDefinitions: Record<string, { purpose: string; prompt: string; }> = {};
    const missingProcesses: string[] = [];

    for (const processName of processes) {
      const processConfig = configData.config.processes[processName];
      if (!processConfig) {
        missingProcesses.push(processName);
      } else {
        processDefinitions[processName] = {
          purpose: processConfig.purpose,
          prompt: processConfig.prompt
        };
      }
    }

    if (missingProcesses.length > 0) {
      const availableProcesses = Object.keys(configData.config.processes);
      session.logger.addError({
        code: RunSessionIterationErrorCode.PROCESS_NOT_FOUND,
        message: `Processes not found: ${missingProcesses.join(', ')}`,
        context: { 
          arguments: args,
          missingProcesses,
          availableProcesses
        }
      });
      return { prompt: '', processes: {} };
    }

    // Prepare unified execution prompt with process instructions
    let unifiedPrompt = `Execute the following processes in sequence:\n\n`;

    // Add each process prompt
    for (const processName of processes) {
      const process = processDefinitions[processName];
      unifiedPrompt += `=== PROCESS: ${processName} ===\n`;
      unifiedPrompt += `Purpose: ${process.purpose}\n\n`;
      unifiedPrompt += `${process.prompt}\n\n`;
      unifiedPrompt += `=== END PROCESS: ${processName} ===\n\n`;
    }

    // Include context guidance if context parameter provided
    if (context) {
      unifiedPrompt += `CONTEXT GUIDANCE:\n${context}\n\n`;
      unifiedPrompt += `Apply this context to refine your process execution for more precise results.\n\n`;
    }

    // Add mandatory updateSession + planSessionIteration sequence to prompt
    unifiedPrompt += `MANDATORY COMPLETION SEQUENCE:\n`;
    unifiedPrompt += `After completing all processes above:\n`;
    unifiedPrompt += `1. Call updateSession() to save your progress and findings\n`;
    unifiedPrompt += `2. After updateSession completion, call planSessionIteration() to determine next steps\n`;
    unifiedPrompt += `3. Follow the instructions returned by planSessionIteration\n\n`;
    unifiedPrompt += `This sequence ensures proper workflow continuation and context preservation.`;

    const response: RunSessionIterationResponse = {
      prompt: unifiedPrompt,
      context: context,
      processes: processDefinitions
    };
    
    return response;
    
  } catch (error) {
    session.logger.addError({
      code: RunSessionIterationErrorCode.RUN_ERROR,
      message: `Run operation failed: ${error instanceof Error ? error.message : String(error)}`,
      context: { 
        arguments: args,
        error: error instanceof Error ? error.stack : String(error)
      }
    });
    
    return { prompt: '', processes: {} };
  }
} 