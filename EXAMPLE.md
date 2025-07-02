# Workflow Examples: Complete Development Cycle

Demonstration of a complete Session Manager workflow cycle from user request to task completion.

## Workflow Architecture

**Main cycle:**
User Request → createSession → planSessionIteration → runSessionIteration → updateSession → planSessionIteration → ... → qualityAssurance → Complete

**Key components:**
- **MCP Tools**: createSession, planSessionIteration, runSessionIteration, updateSession, clarifySession
- **Processes**: problemAnalysis, technicalDiscovery, codeImplementation, qualityAssurance
- **Blocker System**: Integrated blocker detection in planSessionIteration with logical session structure
- **Adaptive Control**: User involvement level depends on complexity

---

## Example 1: Simple Bug Fix (Light Control)

### Scenario: Fixing button styles

**User Request:**
```
Fix the login button hover color - it should use primary-dark from theme.js. 
Button is in src/components/Auth/LoginForm.jsx
```

**LLM → MCP:**
```javascript
mcp_sessionManager_createSession({
  project: "/Users/user/projects/myapp",
  sessionPath: "sessions/fix-login-button.laml"
})
```

**MCP Response:**
```javascript
{
  "success": true,
  "prompt": "Strategic planning...\n- Goal: Fix login button hover styling\n- Context: Sufficient\n- Blockers: None\n- Action: execute runSessionIteration({processes: ['codeImplementation']})"
}
```

**LLM → MCP:**
```javascript
mcp_sessionManager_runSessionIteration({
  project: "/Users/user/projects/myapp", 
  processes: ["codeImplementation"]
})
```

**LLM Execution:**
Current code analysis → Problem discovery → Fix:

```css
/* Before */
.login-btn:hover { background-color: var(--primary); }

/* After */  
.login-btn:hover { background-color: var(--primary-dark); }
```

**Automatic cycle completion:**
updateSession → planSessionIteration → qualityAssurance

**Result:**
✅ Task Complete - button fixed, QA passed

---

## Example 2: Complex Feature with Blockers (Active Control)

### Scenario: Notification system

**User Request:**
```
Implement a notification system for the app. Users should receive notifications 
for various events, and we need both in-app and email notifications.
```

**LLM → MCP:**
```javascript
mcp_sessionManager_createSession({
  project: "/Users/user/projects/myapp",
  sessionPath: "sessions/notification-system.laml"
})
```

**MCP Response:**
```javascript
{
  "prompt": "- Goal: Implement notification system\n- Context: High-level, needs analysis\n- Action: execute runSessionIteration({processes: ['problemAnalysis', 'technicalDiscovery', 'requirementsClarification']})"
}
```

**LLM → MCP:**
```javascript
mcp_sessionManager_runSessionIteration({
  project: "/Users/user/projects/myapp",
  processes: ["problemAnalysis", "technicalDiscovery", "requirementsClarification"]
})
```

**LLM Execution of Processes:**

**problemAnalysis:**
- Problem: No centralized notification system
- Users: All users affected
- Success: In-app + email notifications working

**technicalDiscovery:**
- Architecture: Node.js + React + PostgreSQL
- Patterns: Service layer, event-driven
- Integration: Existing auth system

**requirementsClarification:**
- Questions: Which notification types? Email service? Volume?
- Options: SendGrid vs AWS SES vs SMTP
- Gaps: Specific templates, business rules

**updateSession → planSessionIteration:**

**MCP Response:**
```javascript
{
  "prompt": "CRITICAL BLOCKERS DETECTED:\n- Type: USER_DECISION_REQUIRED\n- Details: Notification types, email service, volume expectations undefined\n- Impact: Cannot proceed without business decisions\n- Action: Request user decisions"
}
```

**LLM Response (Blocker Detected):**
🚫 **Critical Blockers - User Decisions Required:**

1. **Notification Types** - What specific events need notifications?
2. **Email Service** - SendGrid, AWS SES, or SMTP?
3. **Volume Scale** - Expected daily volume and processing approach?

These decisions affect database schema, integration approach, and architecture.

**User Response:**
```
1. Types: User actions (likes, comments, follows) + system events (security, account changes)
2. Email: SendGrid (we have account)  
3. Volume: 10k/day now, design for 100k scale
4. Add user opt-out preferences
```

**LLM → MCP:**
```javascript
mcp_sessionManager_runSessionIteration({
  project: "/Users/user/projects/myapp",
  processes: ["architecturalAnalysis", "implementationPlanning"]
})
```

**LLM Execution:**
- Architecture: Event-driven with service layer, Redis queue
- Plan: Database → Service → Email → Frontend → Integration

**User Checkpoint:**
```
User: "Break implementation into phases and let me approve each phase."
```

**LLM Response:**
**Phase Plan:**
- Phase 1: Database models + core service
- Phase 2: Email integration  
- Phase 3: Frontend + full integration

**User:** "Start with Phase 1, I'll review before external dependencies."

**LLM → MCP:**
```javascript
mcp_sessionManager_runSessionIteration({
  project: "/Users/user/projects/myapp",
  processes: ["codeImplementation"],
  context: "Phase 1 only: database models and core notification service"
})
```

**LLM Implementation:**
```javascript
// Database Schema
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

// NotificationService
class NotificationService {
  static TYPES = {
    USER_LIKE: 'user_like',
    USER_COMMENT: 'user_comment', 
    SECURITY_ALERT: 'security_alert'
  };

  static async createNotification(userId, type, data) {
    const template = this.getTemplate(type, data);
    const notification = await Notification.create(userId, type, template.title, template.message, data);
    this.emitRealTime(userId, notification);
    return notification;
  }
}
```

**User Feedback:**
```
User: "Great! Add batch notification support for system events, then continue with email integration."
```

**LLM Adaptation:**
```javascript
// Enhanced with batch support
static async createBatchNotifications(notifications) {
  const results = [];
  for (const { userId, type, data } of notifications) {
    const notification = await this.createNotification(userId, type, data);
    results.push(notification);
  }
  return results;
}
```

**Email Integration:**
```javascript
// EmailService with SendGrid
class EmailService {
  static async sendNotificationEmail(userId, notification) {
    const user = await User.findById(userId);
    const preferences = await UserPreference.getByUserId(userId);
    
    if (!preferences.emailEnabled) return;
    
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: notification.title,
      html: this.renderTemplate(notification)
    };
    
    await sgMail.send(msg);
  }
}
```

**Final Quality Assurance:**
updateSession → planSessionIteration → qualityAssurance

**Result:**
✅ **Complete Notification System**
- ✅ Database schema + models
- ✅ Core service with batch support  
- ✅ SendGrid email integration
- ✅ User preference management
- ✅ Real-time notifications
- ✅ Scalable for 100k+ notifications

---

## Key Workflow Patterns

### 1. **Integrated Blocker Detection**
```
planSessionIteration → session analysis → blocker detection → classification:
- USER_DECISION_REQUIRED → blockers.needToUserApprove: business decisions, architectural choices
- CLARIFY_RESOLVABLE → blockers.needToClarify: technical details, process clarifications
```

### 2. **Adaptive Control**
- **Light Control**: simple tasks, minimal oversight
- **Strategic Control**: checkpoints on key decisions  
- **Active Control**: complex tasks, phase-by-phase approval

### 3. **Cyclical Execution**
```
runSessionIteration → updateSession → planSessionIteration → repeat until goal achieved
```

### 4. **Context-Driven Execution**
- Context focuses process execution
- Detailed initial context eliminates discovery iterations
- Workflow adapts to user preferences

### 5. **Recovery and Adaptation**
- System gracefully handles requirement changes
- User feedback immediately integrated into execution
- Ability to pivot when approaches aren't working

---

## Best Practices

### ✅ **Effective Patterns**
- **Context Front-Loading**: Detailed initial context avoids discovery iterations
- **Single Session First**: Start with one session, split only when complexity becomes unmanageable
- **Strategic Checkpoints**: Review at decision points, not arbitrary intervals
- **Blocker Resolution**: Immediate attention to critical blockers
- **Adaptive Scope**: Dynamic scope management based on discoveries

### ⚠️ **Common Mistakes**
- **Insufficient Context**: Vague requests lead to discovery iterations
- **Scope Creep**: Adding features beyond explicit requests
- **Blocker Ignoring**: Continuing without resolving critical decisions
- **Over-Micromanagement**: Excessive checkpoints interrupt flow

---

## Conclusion

The workflow system provides powerful automation while maintaining human control over critical decisions. The system scales from simple fixes to complex feature development with appropriate oversight and quality assurance.

**Golden principle:** The workflow should feel like working with a very capable junior developer who needs good direction and occasional course correction, but not constant supervision.