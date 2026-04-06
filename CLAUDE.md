**Workflow Orchestration**

**1. Plan Mode Default**
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

**2. Subagent Strategy**
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

**3. Self-Improvement Loop**
- After ANY correction from the user: update `project-management/lessonsClaude.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

**4. Verification Before Done**
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

**5. Demand Elegance (Balanced)**
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

**6. Autonomous Bug Fixing**
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

**Session Start Ritual**

1. Read `project-management/lessonsClaude.md` — avoid repeating technical mistakes
2. Read `project-management/todo.md` — pick up where we left off
3. Read `project-management/projectlog.md` (latest entry) — recall context
4. Read `product-vision.md` - check if we are still alligned to the vision. If allignment seems off, suggest a way to reallign and ask Frederic you should proceed with your solution.
5. Suggest 1-2 product lessons for `project-management/lessonsFrederic.md` based on previous session
6. Ask Frederic to confirm or add to them before starting work

**Task Management**

1. **Plan First**: Write plan to `project-management/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Log Results**: Add daily entry to `project-management/projectlog.md`
6. **Capture Technical Lessons**: Update `project-management/lessonsClaude.md` after corrections
7. **Log Decisions**: Add significant choices to `project-management/decisions.md`
8. **Park Ideas**: Out-of-scope ideas go to `project-management/maybelater.md`

**Project Management Files**

All project tracking lives in `project-management/`:
- `todo.md` — active tasks (keep short, current sprint only)
- `projectlog.md` — daily session notes (what we did, decisions, what's next)
- `lessonsClaude.md` — technical implementation lessons
- `lessonsFrederic.md` — product and design lessons
- `decisions.md` — decision log with rationale
- `maybelater.md` — ideas parked for later

**Key Reference Documents**

- `docs/product-vision.md` — product vision, users, organisation philosophy, design decisions
- `docs/domain-model-brief.md` — target relational data model (build toward, not yet implemented)
- `docs/canonical-layer-huizinga-brief.md` — arena-based canonical layer design for Phase 2 (concepts)
- `docs/provisional-domain-model-phase2.md` — concrete table schemas for threads, arenas, tags, discovery

**Core Principles**

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
