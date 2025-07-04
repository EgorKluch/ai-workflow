import { McpSession } from 'flowmcp';
import { RunSessionIterationRequest, RunSessionIterationResponse, RunSessionIterationErrorCode } from './runSessionIteration.types.js';
import { getConfig, getCoreConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';
import { CoreConfig } from '../../types/core.types.js';
import { ProcessConfig } from '../../types/processes.types.js';
import { resolveProjectPath } from '../../utils/pathUtils/index.js';

/**
 * Converts structured process configuration to formatted prompt string
 */
function formatProcessPrompt(processConfig: ProcessConfig, processName: string): string {
  const { role, text, actions, respond } = processConfig.prompt;
  
  let prompt = `${role}\n\n`;
  
  // Add session reading instruction
  prompt += `FIRST: Read the current session file to understand the current state and progress.\n\n`;
  
  // Add main prompt content
  prompt += `${text}\n\n`;
  
  // Add actions if present - they are checked after task completion
  if (actions && actions.length > 0) {
    prompt += `IMPORTANT: After completing all tasks above, analyze and check these trigger conditions. If any trigger condition is true, execute the corresponding action and finish with that action (do NOT proceed to standard response).\n`;
    
    // Group actions by action type
    const actionsByType = new Map<string, string[]>();
    actions.forEach(({ trigger, action }) => {
      if (!actionsByType.has(action)) {
        actionsByType.set(action, []);
      }
      const triggers = actionsByType.get(action);
      if (triggers) {
        triggers.push(trigger);
      }
    });
    
    // Format each action group
    actionsByType.forEach((triggers, actionType) => {
      prompt += `${actionType} when:\n`;
      triggers.forEach(trigger => {
        prompt += `- ${trigger}\n`;
      });
      prompt += '\n';
    });
  
  }
  
  // Add progress update requirement
  prompt += `PROGRESS UPDATE: After completing this process, call updateSession() to save progress.\n\n`;
  
  // Add respond
  prompt += `HOW TO RESPOND: ${respond}`;
  
  return prompt;
}

export async function runSessionIteration(session: McpSession, args: RunSessionIterationRequest): Promise<RunSessionIterationResponse> {
  
  try {
    const { project: rawProject, processes } = args;
    
    // Decode URL-encoded project path (Windows compatibility)
    const project = resolveProjectPath(rawProject);
    
    // Validate parameters
    if (!project) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
      return { prompt: '' };
    }

    if (!processes || !Array.isArray(processes) || processes.length === 0) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Processes parameter is required and must be a non-empty array',
        context: { arguments: args }
      });
      return { prompt: '' };
    }

    // Load process definitions from config.yaml for specified process names
    let configData: Config;
    try {
      configData = getConfig<Config>(project);
    } catch (configError) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.CONFIG_LOAD_ERROR,
        message: `Failed to load processes configuration: ${configError instanceof Error ? configError.message : String(configError)}`,
        context: { arguments: args, configError }
      });
      return { prompt: '' };
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
          prompt: formatProcessPrompt(processConfig, processName)
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
      return { prompt: '' };
    }

    // Load core runSessionIteration template from core.yaml
    let coreConfigData: CoreConfig;
    try {
      coreConfigData = getCoreConfig<CoreConfig>(project);
    } catch (coreError) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.CORE_LOAD_ERROR,
        message: `Failed to load core configuration: ${coreError instanceof Error ? coreError.message : String(coreError)}`,
        context: { arguments: args, coreError }
      });
      return { prompt: '' };
    }

    const templates = coreConfigData.core.templates?.runSessionIteration;
    if (!templates) {
      session.logger.addError({
        code: RunSessionIterationErrorCode.CONFIG_LOAD_ERROR,
        message: 'runSessionIteration templates not found in core.yaml',
        context: { arguments: args }
      });
      return { prompt: '' };
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

    // Add mandatory completion sequence
    unifiedPrompt += templates.mandatoryCompletion;

    return {
      prompt: unifiedPrompt
    };
    
  } catch (error) {
    session.logger.addError({
      code: RunSessionIterationErrorCode.RUN_ERROR,
      message: `Run operation failed: ${error instanceof Error ? error.message : String(error)}`,
      context: { 
        arguments: args,
        error: error instanceof Error ? error.stack : String(error)
      }
    });
    
    return { prompt: '' };
  }
} 