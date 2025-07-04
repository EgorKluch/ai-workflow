import { McpSession } from 'flowmcp';
import { getConfig, getCoreConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';
import { CoreConfig } from '../../types/core.types.js';
import { PlanSessionIterationRequest, PlanSessionIterationResponse } from './planSessionIteration.types.js';

export async function planSessionIteration(
  session: McpSession,
  args: PlanSessionIterationRequest
): Promise<PlanSessionIterationResponse> {
  try {
    // Get project path from args
    const { project } = args;
    
    // Validate project parameter
    if (!project || typeof project !== 'string') {
      session.logger.addError({
        code: 'PLAN_SESSION_ERROR',
        message: 'Project parameter is required and must be a non-empty string',
        context: { args }
      });
      return {
        prompt: ''
      };
    }

    // Get all processes from config
    const configData = getConfig<Config>(project);
    const allProcesses = configData.config.processes;

    // Load planning prompt from core.yaml
    const coreConfig = getCoreConfig<CoreConfig>(project);
    const planProcess = coreConfig.core.processes.planSessionIteration;
    
    if (!planProcess) {
      session.logger.addError({
        code: 'PLAN_SESSION_ERROR',
        message: 'planSessionIteration process not found in core.yaml',
        context: { args }
      });
      return {
        prompt: ''
      };
    }

    // Format ALL processes with their requirements as hints for LLM
    const availableProcessesList = Object.entries(allProcesses)
      .map(([name, processConfig]) => {
        let processInfo = `- ${name}: ${processConfig.purpose}`;
        
        // Add requirements as execution conditions for LLM
        if (processConfig.requirements && processConfig.requirements.length > 0) {
          processInfo += `\n  can be executed when:`;
          processConfig.requirements.forEach(req => {
            processInfo += `\n    * ${req}`;
          });
        }
        
        return processInfo;
      })
      .join('\n');
    
    const prompt = planProcess.prompt.replace('{{AVAILABLE_PROCESSES}}', availableProcessesList);

    return {
      prompt
    };
  } catch (error) {
    session.logger.addError({
      code: 'PLAN_SESSION_ERROR',
      message: `Failed to plan session iteration: ${error instanceof Error ? error.message : String(error)}`,
      context: { args }
    });
    
    return {
      prompt: ''
    };
  }
} 