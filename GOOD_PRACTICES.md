# Workflow Mastery: 6 Essential Patterns

This document outlines the core patterns for maximizing effectiveness with the Session Manager MCP Server. These practices help you work with tasks of any complexity - from simple fixes to complex features - by optimizing how you interact with the workflow system.

## Philosophy: Workflow Scales With You

The workflow system automatically adapts to task complexity. Your role is to guide it efficiently by following these proven patterns that reduce friction and maximize value delivery.

---

## 1. Context Front-Loading

### 🎯 The Pattern
**Load all necessary context into the session creation instead of letting workflow discover it through iterations.**

### 🎪 Why This Matters
Every time workflow stops to ask for missing information, you lose momentum and efficiency. Context discovery iterations are expensive - they consume time without delivering business value. Front-loading context eliminates these interruptions and allows workflow to focus on productive work from iteration 1.

### 📋 How It Works
Before creating a session, gather:
- **File locations** and relevant code references
- **Error messages** or specific issues to address  
- **Requirements** and acceptance criteria
- **Constraints** and technical preferences
- **Examples** of existing patterns to follow

### 🚀 Example: Adding Search Functionality
```
❌ Context-Poor Session Creation:
"Implement search for the product catalog"

Result: Workflow spends iterations discovering:
- Where is the product data model?
- What fields should be searchable?  
- Are there existing UI patterns?
- What's the performance requirement?
→ 2-3 discovery iterations before productive work

✅ Context-Rich Session Creation:
"Implement search for product catalog. Search fields: name, description, category. 
Product model in src/models/Product.js, existing search UI pattern in src/components/UserSearch.js, 
current product list in src/pages/ProductCatalog.jsx. 
Requirements: instant search (no search button), max 200ms response time, 
handle 10k+ products efficiently."

Result: Workflow immediately starts architectural analysis and implementation
→ Direct path to solution
```

### 💡 Pro Tips
- Spend 5 minutes gathering context to save 30 minutes of discovery
- Include file paths, not just vague descriptions
- Reference existing patterns in the codebase
- Specify non-obvious requirements upfront

---

## 2. Single Session First

### 🎯 The Pattern  
**Always start with one session, regardless of task complexity. Split only when management becomes difficult.**

### 🎪 Why This Matters
Workflow exists to REDUCE micromanagement, not create it. Multiple sessions mean multiple contexts, more coordination overhead, and fragmented attention. The system is designed to handle complex tasks in single sessions. Split only when you genuinely feel overwhelmed managing the complexity, not because you think the task "seems big."

### 📋 How It Works
1. **Start with one session** - even for seemingly complex tasks
2. **Monitor your management burden** - how hard is it to follow progress?
3. **Split when YOU feel overwhelmed** - subjective difficulty controlling the work
4. **Split at logical completion points** - when current work delivers standalone value

### 🚀 Example: User Profile System
```
Initial Approach: "Implement complete user profile system with editing, image upload, and privacy settings"

❌ Wrong: Pre-plan multiple sessions
"This is complex, I should create separate sessions for editing, upload, and privacy"
→ Unnecessary coordination overhead from the start

✅ Right: Start with one session
Sessions proceeds:
- Iterations 1-3: Profile editing form - going smoothly
- Iterations 4-5: Image upload logic - still manageable  
- Iteration 6-7: Privacy settings - getting complex to track
- User feeling: "This is becoming hard to follow and control"

Decision point: "Let's complete the profile editing and image upload in this session, 
then create a separate session for privacy settings"

Result:
- Session 1: Complete profile editing with image upload (delivers standalone value)
- Session 2: Privacy settings (if needed)
```

### 💡 Pro Tips
- Don't fear "big" tasks - workflow scales well
- Split criterion: "Am I struggling to manage this?"
- Always complete something valuable before splitting
- Trust your subjective sense of management difficulty

---

## 3. Adaptive Control Strategy

### 🎯 The Pattern
**Match your involvement level to the task complexity and your confidence in the approach.**

### 🎪 Why This Matters
Different tasks need different control approaches. Micromanaging simple tasks kills velocity. Under-managing complex tasks leads to wrong decisions and rework. The key is dynamically adjusting your control level based on risk, complexity, and your domain knowledge.

### 📋 How It Works
- **Light Control**: For well-understood tasks with low risk
- **Strategic Control**: For moderate complexity with key decision points  
- **Active Control**: For high complexity or unfamiliar territory

### 🚀 Example: API Rate Limiting Implementation
```
Task: "Add rate limiting to our REST API"

Phase 1 - Light Control (familiar territory):
User: "Analyze current API structure and implement basic rate limiting"
→ Workflow runs autonomously for 2-3 iterations
→ User: "Looks good, continue with implementation"

Phase 2 - Strategic Control (technical decisions):
User: "Before implementing the storage layer, let me review the approach"
→ Workflow presents Redis vs in-memory vs database options
→ User: "Use Redis for production scalability, continue with that approach"

Phase 3 - Light Control (routine implementation):  
User: "Implement Redis-based rate limiting and add tests"
→ Workflow completes implementation autonomously
→ User: "Perfect, ship it"

Outcome: Minimal management overhead while ensuring key technical decisions align with system architecture
```

### 💡 Pro Tips
- Start with lighter control and increase if needed
- Focus control on irreversible or high-impact decisions
- Let workflow handle routine implementation details
- Your comfort level should guide control intensity

---

## 4. Strategic Scope Boundaries

### 🎯 The Pattern
**Actively manage what's included and excluded from the session based on discovered complexity and changing priorities.**

### 🎪 Why This Matters
Scope creep is productivity's biggest enemy, but rigid scope can miss critical discoveries. The goal is controlled scope evolution - allowing necessary expansions while preventing feature drift. Good scope management keeps sessions focused and deliverable while staying responsive to real-world complexity.

### 📋 How It Works
- **Initial Scope**: Start with clear boundaries
- **Discovery-Based Expansion**: Add critical elements discovered during analysis
- **Temptation Resistance**: Reject nice-to-have additions
- **Dynamic Adjustment**: Respond to changing priorities or constraints

### 🚀 Example: User Notification System
```
Initial Scope: "Add email notifications for user account events"

Discovery Phase:
- Workflow finds: "Email delivery needs retry logic for reliability"
- Smart expansion: "Add retry logic to inScope - this is essential for production"

Mid-Implementation:
- Workflow suggests: "Also add SMS notifications and push notifications"  
- Smart boundary: "Move SMS and push to outOfScope - this is scope creep"

Late Discovery:
- Workflow finds: "Current email template system is broken"
- Critical decision: "Add email template fix to inScope - blocking core functionality"

Business Priority Change:
- Stakeholder: "We need unsubscribe functionality for compliance"
- Smart adaptation: "Add unsubscribe to inScope - legal requirement"

Final Scope: Email notifications + retry logic + template fix + unsubscribe
Excluded: SMS, push notifications, advanced template editor
```

### 💡 Pro Tips
- Expand scope for discovered essentials, not nice-to-haves
- Ask: "Does this block the core value?" for expansion decisions
- Document why items are moved outOfScope for future reference
- Be ruthless about feature drift prevention

---

## 5. Iteration Checkpoint Strategy

### 🎯 The Pattern
**Place review checkpoints at moments of maximum decision value, not arbitrary intervals.**

### 🎪 Why This Matters
Poorly timed checkpoints either interrupt productive flow or miss critical decision moments. Strategic checkpoints maximize the value of your review time by focusing on moments where your input has the highest impact on direction and quality.

### 📋 How It Works
- **Architecture Decisions**: Before major technical commitments
- **Implementation Approach**: After analysis, before coding
- **Integration Points**: Before connecting to existing systems
- **Completion Review**: Before considering the work done

### 🚀 Example: Shopping Cart Feature
```
Task: "Implement persistent shopping cart with user session handling"

❌ Poor Checkpoint Timing:
- After every iteration (interrupts flow)
- Only at the very end (misses key decisions)

✅ Strategic Checkpoint Placement:

Checkpoint 1 - After Architecture Analysis:
"Review the session storage approach before implementation"
→ User validates technical approach, confirms Redis vs database choice
→ Value: Prevents rework from wrong architectural decision

Checkpoint 2 - After Core Implementation:  
"Test basic cart functionality before adding persistence"
→ User validates core behavior, UX flow
→ Value: Ensures foundation is solid before complexity

Checkpoint 3 - Before Integration:
"Review integration with existing user auth system"
→ User validates security approach, session handling
→ Value: Prevents auth vulnerabilities or conflicts

Result: High-impact reviews at decision-critical moments
```

### 💡 Pro Tips
- Time checkpoints around decisions, not arbitrary progress markers
- Ask: "What could go wrong if I don't review now?"
- Focus on irreversible or high-cost-to-change decisions
- Skip checkpoints for routine implementation work

---

## 6. Recovery and Adaptation

### 🎯 The Pattern
**Quickly recognize when workflow is off-track and decisively redirect rather than hoping it will self-correct.**

### 🎪 Why This Matters
Perfect plans rarely survive contact with reality. Code bases are messier than expected, requirements evolve, and technical constraints emerge. The ability to quickly pivot maintains productivity and prevents the sunk-cost fallacy from wasting iterations on unworkable approaches.

### 📋 How It Works
- **Early Warning Signs**: Recognize when workflow is struggling or going off-track
- **Rapid Assessment**: Quickly evaluate if current approach is viable
- **Decisive Pivoting**: Change direction without attachment to original plan
- **Value Preservation**: Salvage useful work while changing approach

### 🚀 Example: Database Migration Feature
```
Task: "Implement database migration system for schema updates"

Original Plan: Build custom migration runner

Iteration 1-2: Analysis of database structure - going well
Iteration 3: Custom migration implementation - workflow struggling with edge cases
Iteration 4: Still struggling with transaction handling, rollback logic

❌ Poor Recovery:
"Keep trying the custom approach, it will work eventually"
→ Waste more iterations on fundamentally difficult approach

✅ Good Recovery - Recognition:
User: "This is taking too long and getting complex. Let me reassess."

✅ Good Recovery - Rapid Pivot:
User: "Stop custom implementation. Switch to using established migration library like Knex migrations. 
Focus on integrating that instead of building from scratch."

✅ Good Recovery - Value Preservation:
"Keep the database analysis work from iterations 1-2, but change implementation approach"

Result: 
- Saved 3-4 iterations of difficult custom development
- Delivered more reliable solution using proven library
- Maintained progress momentum
```

### 💡 Pro Tips
- Set iteration limits for experimental approaches
- Don't be attached to original technical plans
- Ask: "Is this approach working or are we fighting it?"
- Pivot early rather than late - sunk cost fallacy is real

---

## Putting It All Together

### 🎯 The Workflow Mastery Cycle

1. **Prepare thoroughly** (Context Front-Loading) → Start with maximum information
2. **Start simple** (Single Session First) → One session unless proven complex  
3. **Control strategically** (Adaptive Control) → Match involvement to risk/complexity
4. **Guard scope actively** (Strategic Boundaries) → Expand thoughtfully, resist drift
5. **Review smartly** (Strategic Checkpoints) → Focus on high-value decision moments
6. **Adapt quickly** (Recovery & Adaptation) → Pivot when plans meet reality

### 🚀 Success Metrics

**Efficiency Indicators:**
- ⚡ Productive work starts in iteration 1 (good context loading)
- 🎯 Scope stays focused on core value (good boundary management)
- 🔄 Minimal iteration waste on discovery or rework (good adaptation)
- 🎪 Management effort feels proportional to complexity (good control strategy)

**Quality Indicators:**
- ✅ Technical decisions align with system architecture
- 🛡️ Implementation handles edge cases and error scenarios  
- 📋 Delivered functionality meets all requirements
- 🚀 Code follows established project patterns and standards

### 💡 Remember

These patterns are tools, not rules. Adapt them to your context, team, and problem domain. The goal is productive collaboration with workflow, not perfect adherence to process. Trust your judgment and let these patterns guide better decisions about when and how to engage with the system.

**The Golden Principle:** Workflow should feel like having a very capable junior developer who needs good direction and occasional course correction, not constant supervision.