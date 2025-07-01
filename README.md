# Session Manager MCP Server

Advanced MCP (Model Context Protocol) server implementing fully automated development workflow. Built with **FlowMCP** toolkit following systematic process execution architecture.

## Features

- **Full Automation**: Complete automation from user request to implementation
- **Systematic Progression**: Each process analyzes session state to determine next steps
- **Context Preservation**: Every process completion updates session state for intelligent analysis
- **Cyclical Execution**: Continuous workflow cycles until goal achievement
- **FlowMCP Integration**: Built with FlowMCP toolkit for automatic validation and error handling
- **Project Parameter**: Automatic project path injection for all tools
- **TypeScript**: Full TypeScript support with proper ES module configuration
- **Testing**: Comprehensive Jest test suite with ES module support  
- **Error Handling**: Robust error handling with FlowMCP's session-based error collection
- **Cursor Integration**: Ready for Cursor IDE integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage

### Development

```bash
# Watch mode for development
npm run dev

# Run tests
npm run test

# Run tests in watch mode  
npm run test-dev
```

### Production

```bash
# Build and start the server
npm start
```

## Tools

### createSession (dataReturningTool)

Initialize development session with LAML file and trigger first iteration planning.

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)
- `sessionPath` (required, string): Relative path to session file (e.g., "sessions/feature-auth.laml")

**Returns:**
- `processes` (object): Available processes from config.yaml with their purposes
- `prompt` (string): Algorithm prompt for LLM to start workflow execution

### runSessionIteration (promptReturningTool)

Execute specified processes and return combined execution prompt.

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)
- `processes` (required, array): Array of process names to execute (e.g., ["problemAnalysis", "technicalDiscovery"])
- `context` (optional, string): Specific context or focus area for process execution guidance

**Returns:**
- `prompt` (string): Unified execution algorithm prompt for LLM
- `context` (string): Echo of input context parameter
- `processes` (object): Process definitions loaded from config.yaml

### getSessionProcesses (dataReturningTool)

Return available processes from config.yaml.

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)

**Returns:**
- `processes` (object): Available processes mapped to their purposes

### updateSession (promptReturningTool)

Return prompt for session state update procedure.

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)
- `updates` (required, object): Session update data structure (flexible schema)

**Returns:**
- `prompt` (string): Algorithm prompt for session update procedure

### clarifySession (promptReturningTool)

Handle uncertainty by selecting appropriate processes for resolution.

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)
- `context` (required, string): Description of uncertain situation, ambiguity, conflict that needs clarification

**Returns:**
- `prompt` (string): Resolution strategy algorithm for LLM
- `processes` (object): Available processes for selection
- `context` (string): Echo of input context parameter

### planSessionIteration (promptReturningTool)

Analyze session state and determine next iteration approach.

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)

**Returns:**
- `prompt` (string): Strategic planning algorithm for LLM
- `processes` (object): Available processes for strategic selection

## Cursor Integration

1. Build the project:
```bash
npm run build
```

2. Add to your Cursor settings (`~/.cursor/settings.json`):
```json
{
  "mcp": {
    "servers": {
      "session-manager": {
        "command": "node",
        "args": ["/path/to/session-manager/dist/index.js"]
      }
    }
  }
}
```

3. Restart Cursor

4. The session management tools should now be available in Cursor

## Configuration

The server uses YAML configuration files:

- **`src/config.yaml`**: Process definitions with purposes and prompts
- **`src/core.yaml`**: Core process templates for updateSession and clarifySession

No additional configuration is required - the server works with the provided configuration files.

## Development

### Project Structure

```
session-manager/
├── src/
│   ├── index.ts          # Main server implementation
│   ├── tools/            # MCP tool implementations
│   │   ├── createSession/
│   │   ├── runSessionIteration/
│   │   ├── getSessionProcesses/
│   │   ├── updateSession/
│   │   ├── clarifySession/
│   │   └── planSessionIteration/
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── config.yaml       # Process definitions
│   ├── core.yaml         # Core process prompts
│   └── __tests__/
│       └── index.test.ts # Test suite
├── dist/                 # Compiled output (generated)
├── sessions/             # Session files directory
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Architecture

- **FlowMCP Toolkit**: Built with FlowMCP for enhanced MCP tool development  
- **Automatic Project Injection**: All tools automatically receive project parameter
- **Session-based Error Handling**: Uses McpSession for error collection and response generation
- **Tool Type Classification**: promptReturningTools vs dataReturningTools architecture
- **Cyclical Workflow**: Continuous execution cycles until goal achievement
- **Process Configuration**: Flexible process definitions via config.yaml and core.yaml
- **ES Modules**: Full ES module support with NodeNext module resolution
- **TypeScript**: Strict TypeScript configuration with isolated modules
- **Testing**: Jest with ES module support and comprehensive test coverage

### Error Codes

- `VALIDATION_ERROR`: Input validation errors (e.g., missing required parameters)
- `CONFIG_LOAD_ERROR`: Configuration file loading errors
- `PROCESS_NOT_FOUND`: Requested process not found in configuration
- `PLAN_SESSION_ERROR`: Session planning operation failures
- `CREATE_SESSION_ERROR`: Session creation operation failures
- `RUN_ERROR`: Process execution errors
- `UPDATE_ERROR`: Session update operation failures
- `CLARIFY_SESSION_ERROR`: Session clarification operation failures
- `GET_PROCESSES_ERROR`: Process retrieval operation failures

### FlowMCP Features Used

- **McpBuilder**: Automatic tool registration with schema validation
- **McpSession**: Error handling and result generation
- **Automatic Project Parameter**: All tools receive validated project path
- **Error Collection**: Frequency-based error tracking and reporting

### Workflow Execution Pattern

The server implements a cyclical workflow execution pattern:

1. **createSession**: Initialize session and trigger planning
2. **planSessionIteration**: Analyze session state and determine next steps
3. **runSessionIteration**: Execute selected processes
4. **updateSession**: Save progress and update context
5. **planSessionIteration**: Determine next cycle
6. Repeat until goal achievement (qualityAssurance process confirms completion)

### Key Processes

The system requires these processes in `config.yaml`:
- **qualityAssurance**: Final validation process that can terminate workflow
- **codeImplementation**: Main development implementation process
- Additional domain-specific processes as needed

### Adding New Processes

1. Add process definition to `src/config.yaml`:
```yaml
newProcess:
  purpose: "Single sentence describing process goal"
  prompt: |
    Multi-line execution instructions for LLM
    
    Your tasks:
    - Specific task 1
    - Specific task 2
    
    CRITICAL HELP CRITERION: Condition requiring clarifySession()
    
    Key deliverables:
    - Deliverable 1
    - Deliverable 2
```

2. The process becomes automatically available to all tools
3. Test process execution via `runSessionIteration`

## Testing

The project includes comprehensive tests with Jest configured for ES modules:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test-dev

# Run with coverage
npm test -- --coverage
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request 