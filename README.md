# Session Manager MCP Server

Advanced MCP (Model Context Protocol) server implementing fully automated development workflow. Built with **FlowMCP** toolkit following systematic process execution architecture.

## Features

- **Full Automation**: Complete automation from user request to implementation
- **Systematic Progression**: Each process analyzes session state, detects critical blockers, and determines next steps
- **Critical Blocker Detection**: Automatically identifies and classifies blockers preventing session progress
- **Context Preservation**: Every process completion updates session state for intelligent analysis
- **Cyclical Execution**: Continuous workflow cycles until goal achievement with blocker resolution
- **User Consultation**: Intelligent user engagement for critical decisions and ambiguity resolution
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

Intelligent session content actualization with critical blocker management and information prioritization.

**Features:**
- **Information Classification**: Categorizes content as IMMUTABLE, EVOLVING, CONSOLIDATABLE, or EXPENDABLE
- **Critical Blocker Management**: Manages and preserves blockers identified by planning process
- **Semantic Consolidation**: Merges repetitive content while preserving meaning
- **Critical Context Preservation**: Protects scope boundaries, user decisions, and agreed constraints
- **Contradiction Resolution**: Resolves conflicts based on user decisions and authoritative information
- **Progress Tracking**: Marks implementation steps as blocked if dependent on unresolved critical items

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)

**Returns:**
- `prompt` (string): Advanced session actualization algorithm with blocker management and classification framework

### clarifySession (promptReturningTool)

Resolve information gaps by first consulting user with clear questions, then executing targeted process iterations, and escalating only if automated resolution fails.

**Features:**
- **User Consultation**: Formulates clear, specific questions for user consultation with context
- **Strategic Process Execution**: Selects appropriate processes based on user guidance
- **Targeted Resolution**: Transforms user responses into actionable iteration context
- **Automated Escalation**: Escalates to user only if automated approaches fail after consultation

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)
- `context` (required, string): Description of uncertain situation, ambiguity, conflict that needs clarification

**Returns:**
- `prompt` (string): Resolution strategy algorithm with user consultation for LLM
- `processes` (object): Available processes for selection
- `context` (string): Echo of input context parameter

### planSessionIteration (promptReturningTool)

Analyze session state, detect critical blockers, and determine next workflow steps with comprehensive blocker resolution.

**Features:**
- **Critical Blocker Detection**: Systematically detects blockers preventing progress continuation
- **Blocker Classification**: Classifies blockers as USER_DECISION_REQUIRED or CLARIFY_RESOLVABLE
- **Strategic Decision Making**: Determines workflow steps based on goal achievement and blocker analysis
- **Progress Control**: Blocks further progress until critical issues are resolved

**Parameters:**
- `project` (automatic, string): Absolute path to the project directory (automatically injected by FlowMCP)

**Returns:**
- `prompt` (string): Strategic planning algorithm with critical blocker detection for LLM
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

- **`config/config.yaml`**: Process definitions with purposes and prompts
- **`config/core.yaml`**: Core process templates for updateSession, clarifySession, and planSessionIteration

No additional configuration is required - the server works with the provided configuration files.

## Development

### Project Structure

```
session-manager/
├── config/
│   ├── config.yaml       # Process definitions
│   └── core.yaml         # Core process prompts
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
│   └── __tests__/        # Test suite
│       ├── tools/        # Tool-specific tests
│       ├── integration/  # Integration tests
│       └── utils/        # Utility tests
├── dist/                 # Compiled output (generated)
├── sessions/             # Session files directory
├── tmp/                  # Temporary files
├── package.json
├── tsconfig.json
├── jest.config.js
├── process.yaml          # Workflow documentation
└── README.md
```

### Architecture

- **FlowMCP Toolkit**: Built with FlowMCP for enhanced MCP tool development  
- **Automatic Project Injection**: All tools automatically receive project parameter
- **Session-based Error Handling**: Uses McpSession for error collection and response generation
- **Critical Blocker System**: Integrated blocker detection, classification, and resolution workflow
- **Tool Type Classification**: promptReturningTools vs dataReturningTools architecture
- **Cyclical Workflow**: Continuous execution cycles with blocker resolution until goal achievement
- **User Consultation Framework**: Intelligent user engagement for critical decisions and ambiguity resolution
- **Process Configuration**: Flexible process definitions via config/config.yaml and config/core.yaml
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

The server implements a cyclical workflow execution pattern with critical blocker detection:

1. **createSession**: Initialize session and trigger planning
2. **planSessionIteration**: Analyze session state, detect critical blockers, and determine next steps
3. **Blocker Resolution**: Handle USER_DECISION_REQUIRED (user consultation) or CLARIFY_RESOLVABLE (clarifySession)
4. **runSessionIteration**: Execute selected processes (only if no critical blockers)
5. **updateSession**: Save progress, manage blockers, and update context
6. **planSessionIteration**: Determine next cycle with re-evaluation of blockers
7. Repeat until goal achievement (qualityAssurance process confirms completion)

**Blocker Integration**: Progress is blocked until critical issues are resolved, preventing wasted implementation effort.

### Key Processes

The system requires these processes in `config/config.yaml`:
- **qualityAssurance**: Final validation process that can terminate workflow
- **codeImplementation**: Main development implementation process
- Additional domain-specific processes as needed

**Note**: Blocker detection is integrated directly into `planSessionIteration` as the sole blocker detection mechanism, eliminating the need for a separate `blockerAnalysis` process.

### Adding New Processes

1. Add process definition to `config/config.yaml`:
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

## Critical Blocker Management System

The system includes automatic detection and classification of critical blockers that prevent session progress, ensuring robust workflow management where critical decisions are never skipped.

### Blocker Types

**USER_DECISION_REQUIRED**:
- Elements in `onReview` section affecting core functionality
- Conflicting business requirements 
- Scope boundary changes requiring approval
- Architecture decisions with business impact

**CLARIFY_RESOLVABLE**:
- Technical implementation details needing clarification
- Non-critical requirement ambiguities  
- Process or workflow questions
- Technical option selections with clear trade-offs

### Workflow Integration

1. **Planning Phase**: `planSessionIteration` detects critical blockers before determining next steps
2. **Update Phase**: `updateSession` manages and preserves blocker context
3. **Progress Control**: Implementation is blocked until critical issues are resolved
4. **User Consultation**: Critical blockers trigger user decision requests via `clarifySession`

### Session Structure with Blocker Management

# Recommended logical session structure
goal: "Implement user authentication system"

# IMMUTABLE sections (preserved exactly)
immutable:
  scopeBoundaries:
    inScope: 
      authentication:
        basic: "User login/logout functionality"
        sessions: "Session management and persistence"
      userManagement:
        profiles: "Basic user profile management"
        validation: "Input validation and sanitization"
    outOfScope: 
      analytics: "Advanced user analytics and reporting"
      integrations: "Third-party authentication providers"

  userDecisions: 
    security:
      hashing: "Use bcrypt for password hashing with salt rounds of 12"
      sessions: "JWT tokens with 24-hour expiration, refresh token rotation"
    architecture:
      database: "PostgreSQL for user data persistence"
      caching: "Redis for session storage and rate limiting"
      
  constraints: 
    performance: "Authentication response time under 200ms"
    security: "OWASP compliance for authentication flows"
    
  successCriteria: 
    functionality: "Users can register, login, logout, and manage basic profiles"
    security: "All authentication flows properly secured and validated"
    testing: "Manual testing procedures for all authentication scenarios"
    
  architecturalDecisions: 
    sessionStorage: "JWT with Redis backing for scalability"
    passwordPolicy: "Minimum 8 characters with complexity requirements"

# EVOLVING sections (updated with current state)
evolving:
  technicalContext:
    currentArchitecture: 
      system: "Node.js + React + PostgreSQL"
      patterns: "Service layer architecture with event-driven components"
      security: "Helmet.js for headers, express-rate-limit for protection"
    dependencies:
      core: "Express.js web framework with TypeScript"
      authentication: "Passport.js for authentication strategies"
      database: "Prisma ORM for PostgreSQL interactions"
      validation: "Joi for request validation and sanitization"

  requirements:
    functional:
      authentication: "Secure user registration, login, logout workflows"
      sessions: "Persistent session management with automatic expiration"
      profiles: "Basic user profile viewing and editing capabilities"
    nonFunctional:
      security: "HTTPS enforcement, rate limiting, input sanitization"
      performance: "Sub-200ms authentication response times"
      usability: "Clear error messages and intuitive authentication flows"

  progressState:
    inProgress: 
      - "authentication analysis: Reviewing existing auth patterns and security requirements"
    pending: 
      - "implementation: Building authentication middleware and user models"
      - "testing: Manual verification of authentication workflows"

  analysisResults: 
    securityAssessment: "Existing system lacks comprehensive authentication - requires full implementation"
    integrationPoints: "Auth system must integrate with existing user management and session handling"

# BLOCKER MANAGEMENT (special handling)
# CRITICAL: ALL BLOCKERS MUST BE RESOLVED - no permanent blocking allowed  
# needToUserApprove: requires user decision/approval to proceed
# needToClarify: requires clarification but can be resolved through clarifySession()
blockers:
  needToUserApprove:
    - "Business decision required: Password reset functionality - Impact: affects core auth system security and user experience flows"
    - "Scope change needed: Social login integration - Approval: expand scope to include OAuth providers or defer to future iteration"
  needToClarify:
    - "Technical question: Rate limiting strategy - Context: need to define specific limits for login attempts and account creation"
    - "Implementation approach: Session cleanup strategy - Options: automatic cleanup vs manual cleanup vs hybrid approach"

# CONSOLIDATABLE sections (merge similar content)
consolidatable:
  implementationNotes: 
    security: "Implement comprehensive input validation and sanitization for all authentication endpoints"
    testing: "Create manual testing procedures for successful auth flows, failure scenarios, and edge cases"

# EXPENDABLE sections (can become obsolete)
expendable:
  workingNotes: 
    discovery: "Initial analysis complete - identified security gaps and integration requirements"
  debugInfo: [] 