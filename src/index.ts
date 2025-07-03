import { McpBuilder, McpSession } from 'flowmcp';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { createSession, CreateSessionRequest } from './tools/createSession/index.js';
import { runSessionIteration, RunSessionIterationRequest } from './tools/runSessionIteration/index.js';
import { getSessionProcesses, GetSessionProcessesRequest } from './tools/getSessionProcesses/index.js';
import { updateSession, UpdateSessionRequest } from './tools/updateSession/index.js';
import { clarifySession, ClarifySessionRequest } from './tools/clarifySession/index.js';
import { resolveBlockers, ResolveBlockersRequest } from './tools/resolveBlockers/index.js';
import { planSessionIteration, PlanSessionIterationRequest } from './tools/planSessionIteration/index.js';

export class SessionManagerMcpServer {
  private builder: McpBuilder;
  private server: Server;

  constructor() {
    this.builder = new McpBuilder();
    this.server = new Server({
      name: 'session-manager',
      version: '2.0.0',
    });
    this.setupTools();
  }

  private setupTools() {
    // Add createSession tool (dataReturningTool)
    this.builder.addTool({
      name: 'createSession',
      description: 'Initialize development session with LAML file and trigger first iteration planning',
      inputSchema: {
        type: 'object',
        properties: {
          sessionPath: {
            type: 'string',
            description: 'Relative path to session file (e.g., "sessions/feature-auth.laml")'
          }
        },
        required: ['sessionPath'],
        additionalProperties: false
      }
    }, async (session: McpSession, request: CallToolRequest) => {
      const args = request.params.arguments as CreateSessionRequest;
      const result = await createSession(session, args);
      return session.getResult(result);
    });

    // Add runSessionIteration tool (promptReturningTool)
    this.builder.addTool({
      name: 'runSessionIteration',
      description: 'Execute specified processes and return combined execution prompt',
      inputSchema: {
        type: 'object',
        properties: {
          processes: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of process names to execute (e.g., ["problemAnalysis", "technicalDiscovery"])'
          },
          context: {
            type: 'string',
            description: 'Specific context or focus area for process execution guidance'
          }
        },
        required: ['processes'],
        additionalProperties: false
      }
    }, async (session: McpSession, request: CallToolRequest) => {
      const args = request.params.arguments as RunSessionIterationRequest;
      const result = await runSessionIteration(session, args);
      return session.getResult(result);
    });

    // Add getSessionProcesses tool (dataReturningTool)
    this.builder.addTool({
      name: 'getSessionProcesses',
      description: 'Return available processes from config.yaml',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      }
    }, async (session: McpSession, request: CallToolRequest) => {
      const args = request.params.arguments as unknown as GetSessionProcessesRequest;
      const result = await getSessionProcesses(session, args);
      return session.getResult(result);
    });

    // Add updateSession tool (promptReturningTool)
    this.builder.addTool({
      name: 'updateSession',
      description: 'Return prompt for session state update procedure',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      }
    }, async (session: McpSession, request: CallToolRequest) => {
      const args = request.params.arguments as UpdateSessionRequest;
      const result = await updateSession(session, args);
      return session.getResult(result);
    });

    // Add clarifySession tool (promptReturningTool)
    this.builder.addTool({
      name: 'clarifySession',
      description: 'Handle uncertainty by selecting appropriate processes for resolution',
      inputSchema: {
        type: 'object',
        properties: {
          context: {
            type: 'string',
            description: 'Description of uncertain situation, ambiguity, conflict that needs clarification'
          }
        },
        required: ['context'],
        additionalProperties: false
      }
    }, async (session: McpSession, request: CallToolRequest) => {
      const args = request.params.arguments as unknown as ClarifySessionRequest;
      const result = await clarifySession(session, args);
      return session.getResult(result);
    });

    // Add resolveBlockers tool (promptReturningTool)
    this.builder.addTool({
      name: 'resolveSessionBlockers',
      description: 'Analyze encountered blockers, classify them, update session with blockers, and determine resolution strategy',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      }
    }, async (session: McpSession, request: CallToolRequest) => {
      const args = request.params.arguments as ResolveBlockersRequest;
      const result = await resolveBlockers(session, args);
      return session.getResult(result);
    });

    // Add planSessionIteration tool (promptReturningTool)
    this.builder.addTool({
      name: 'planSessionIteration',
      description: 'Analyze session state and determine next iteration approach',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      }
    }, async (session: McpSession, request: CallToolRequest) => {
      const args = request.params.arguments as PlanSessionIterationRequest;
      const result = await planSessionIteration(session, args);
      return session.getResult(result);
    });

    // Apply all tools to server
    this.builder.applyToServer(this.server);
  }



  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Session Manager MCP server running on stdio');
  }
}

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new SessionManagerMcpServer();
  server.run().catch((error: Error) => {
    console.error('Failed to run server:', error);
    process.exit(1);
  });
} 