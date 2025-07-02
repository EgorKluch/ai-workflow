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
    // Get available processes via getSessionProcesses equivalent
    const configData = getConfig<Config>();
    const processes = Object.keys(configData.config.processes).reduce((result, processName) => {
      const process = configData.config.processes[processName];
      return {
        ...result,
        [processName]: process.purpose
      };
    }, {} as Record<string, string>);

    // Load planning prompt from core.yaml
    const coreConfig = getCoreConfig<CoreConfig>();
    const planProcess = coreConfig.core.processes.planSessionIteration;
    
    if (!planProcess) {
      session.logger.addError({
        code: 'PLAN_SESSION_ERROR',
        message: 'planSessionIteration process not found in core.yaml',
        context: { args }
      });
      return {
        prompt: '',
        processes: {}
      };
    }

    // Replace template variables in the prompt
    const availableProcessesList = Object.entries(processes)
      .map(([name, purpose]) => `- ${name}: ${purpose}`)
      .join('\n');
    
    const prompt = planProcess.prompt.replace('{{AVAILABLE_PROCESSES}}', availableProcessesList);

    return {
      prompt,
      processes
    };
  } catch (error) {
    session.logger.addError({
      code: 'PLAN_SESSION_ERROR',
      message: `Failed to plan session iteration: ${error instanceof Error ? error.message : String(error)}`,
      context: { args }
    });
    
    return {
      prompt: '',
      processes: {}
    };
  }
} 