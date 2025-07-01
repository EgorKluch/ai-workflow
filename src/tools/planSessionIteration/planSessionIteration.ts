import { McpSession } from 'flowmcp';
import { getConfig } from '../../utils/getConfig/index.js';
import { Config } from '../../types/config.types.js';
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

    // Prepare strategic planning prompt with decision logic
    const prompt = `You are responsible for strategic planning that determines next workflow steps based on session progress.

Your tasks:
- Read session file and parse session goal to determine success criteria
- Evaluate current progress against goal requirements by analyzing session content
- If session goal is fully achieved: execute runSessionIteration({processes: ['qualityAssurance']})
- If goal not achieved, determine if implementation can begin or if information is missing
- If information missing: formulate description of missing information and call clarifySession({context: <description>})
- If information sufficient: execute runSessionIteration({processes: ['codeImplementation']})

CRITICAL: This is a decision-making process that analyzes session state and determines next steps.
The algorithm includes branching logic for different session states.

Available processes for strategic selection:
${Object.entries(processes).map(([name, purpose]) => `- ${name}: ${purpose}`).join('\n')}

Key decision points:
1. Goal Achievement Check: Is the session goal fully completed?
2. Implementation Readiness: Is there sufficient information to proceed with implementation?
3. Information Gaps: What specific information is missing that prevents progress?

Follow this decision tree:
- Goal Complete → runSessionIteration({processes: ['qualityAssurance']})
- Goal Incomplete + Information Missing → clarifySession({context: <gap description>})
- Goal Incomplete + Information Sufficient → runSessionIteration({processes: ['codeImplementation']})

Always base decisions on actual session content analysis, not assumptions.`;

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