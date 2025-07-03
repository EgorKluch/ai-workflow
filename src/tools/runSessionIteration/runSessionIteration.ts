import { McpSession } from 'flowmcp';
import { RunSessionIterationRequest, RunSessionIterationResponse, RunSessionIterationErrorCode } from './runSessionIteration.types.js';
import { getConfig, getCoreConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';
import { CoreConfig } from '../../types/core.types.js';
import { resolveProjectPath } from '../../utils/pathUtils/index.js';

export async function runSessionIteration(session: McpSession, args: RunSessionIterationRequest): Promise<RunSessionIterationResponse> {
  
  try {
    const { project: rawProject, processes, context } = args;
    
    // Decode URL-encoded project path (Windows compatibility)
    const project = resolveProjectPath(rawProject);
    
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

    // Load templates from core.yaml
    let coreConfig: CoreConfig;
    try {
      coreConfig = getCoreConfig<CoreConfig>();
    } catch (coreError) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.CONFIG_LOAD_ERROR,
        message: `Failed to load core.yaml: ${coreError instanceof Error ? coreError.message : String(coreError)}`,
        context: { arguments: args, coreError }
      });
      return { prompt: '', processes: {} };
    }

    const templates = coreConfig.core.templates?.runSessionIteration;
    if (!templates) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.CONFIG_LOAD_ERROR,
        message: 'runSessionIteration templates not found in core.yaml',
        context: { arguments: args }
      });
      return { prompt: '', processes: {} };
    }

    // Prepare unified execution prompt with process instructions
    let unifiedPrompt = templates.unifiedPromptHeader;

    // Add each process prompt using template
    for (const processName of processes) {
      const process = processDefinitions[processName];
      let processSection = templates.processTemplate
        .replace(/{{PROCESS_NAME}}/g, processName)
        .replace('{{PROCESS_PURPOSE}}', process.purpose)
        .replace('{{PROCESS_PROMPT}}', process.prompt);
      unifiedPrompt += processSection + '\n';
    }

    // Include context guidance if context parameter provided
    if (context) {
      const contextSection = templates.contextGuidance
        .replace('{{CONTEXT}}', context);
      unifiedPrompt += contextSection + '\n\n';
    }

    // Add mandatory completion sequence
    unifiedPrompt += templates.mandatoryCompletion;

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