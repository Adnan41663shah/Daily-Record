# EMS CloudBlitz CRM - Functional Operations Manual

## 1) Overview

This document is the complete business-operational manual for EMS CloudBlitz CRM.

It covers:
- Platform overview and operating intent
- End-to-end inquiry workflow (creation to conversion/admission)
- Presales full workflow, instructions, conditions, and permissions
- Sales full workflow, instructions, conditions, and permissions
- Admin full workflow, controls, conditions, and permissions
- Page-wise mapping of what each role finds and does

The objective is to run a zero-leakage lead process with auditable actions at every stage.

---

## 2) Core Operating Principles

1. Every active inquiry must have an owner.
2. Every active inquiry must have a next action.
3. Every interaction must be logged in timeline/messages.
4. Every handover must include business context.
5. Every closure must include a reason and outcome.

If these principles are followed, dashboards and reports remain accurate for management decisions.

---

## 3) Roles, Responsibilities, and Permission Model

### Roles
- Admin
- Presales
- Sales

### Responsibility split
- Presales: first contact, qualification, nurturing, and forward to Sales.
- Sales: counseling progression, conversion handling, admission closure.
- Admin: process governance, user control, options control, reporting, and intervention.

### Permission matrix

| Action | Admin | Presales | Sales |
|---|---|---|---|
| Create inquiry | Yes | Yes | Yes (policy based) |
| Edit inquiry | Yes | Yes (role fields) | Yes (role fields) |
| Assign/Reassign/Bulk Reassign | Yes | Limited/No | No |
| Forward to Sales | Yes | Yes | No |
| Claim inquiry | Yes | No | Yes |
| Add/Update/Close follow-up | Yes | Yes | Yes |
| Add messages | Yes | Yes | Yes |
| Update conversion/admission | Yes | No | Yes |
| Users management | Yes | No | No |
| Manage options/master data | Yes | No | No |
| Reports (full) | Yes | Limited | Limited |
| Center dashboard | Yes | No | Yes |

Access boundaries:
- Role determines available pages/actions.
- Center permissions filter visible data within role.
- Hidden action/button means action is not permitted.

---

## 4) Page-Wise Access: What Each Role Finds Where

### Public
- `Login`
- `Register`
- `Auth callback`

### Common authenticated
- `Dashboard`
- `Inquiry details`
- `My inquiries`
- `Profile`
- `Calls`
- `Center inquiries` (permission based)

### Admin pages
- `Presales inquiries`
- `Sales inquiries`
- `Admin follow-ups` and personal inquiry variants
- `Users`
- `Manage options`
- `Reports`

### Presales pages
- `Presales follow-ups queue`

### Sales pages
- `Sales follow-ups queue`
- `Sales assigned inquiries`
- `Sales unified inquiries view`

### Admin + Sales shared pages
- `Admitted students`
- `Conversions`
- `Center dashboard`

---

## 5) Entire Inquiry Workflow: Creation to Conversion/Admission

## Stage A: Inquiry Creation

Where:
- Internal inquiry create form
- Website form endpoint (public source)

Rules:
- Required fields must be completed.
- Source and center should be captured or routed by policy.

If/Else:
- If required field missing -> block save and correct data.
- If probable duplicate found -> log duplicate handling note as per policy.
- If center unclear -> route to default center and flag for admin review.

Output:
- Inquiry created, ownership path starts, activity trail begins.

## Stage B: Presales Qualification

Where:
- `Presales inquiries`
- `Inquiry details`
- `Presales follow-ups queue`

Mandatory actions:
1. Attempt first contact.
2. Record message with outcome.
3. Add follow-up with exact date/time.
4. Update qualification indicators.

If/Else:
- If lead reachable and interested -> continue qualification.
- If unreachable -> record attempt, set next follow-up.
- If invalid lead (wrong number/fake) -> close with valid disposition.
- If high-potential but aging -> escalate to Admin.

## Stage C: Follow-Up Discipline

Where:
- Follow-up queues
- Inquiry details timeline

If/Else:
- If follow-up due today -> action same day.
- If follow-up overdue -> higher priority than non-urgent fresh leads.
- If plan changes -> update follow-up, do not skip silently.
- If follow-up completed -> close with meaningful outcome note.

Global control:
- No active inquiry can remain without next scheduled action.

## Stage D: Forward to Sales

Where:
- `Inquiry details` using `Forward to Sales`

Preconditions:
- Qualification complete
- Latest interaction note available
- Program/intent clear for Sales handover

If/Else:
- If qualification incomplete -> do not forward.
- If forwarded with weak context -> Sales may request correction.
- If wrong forward happened -> Admin rebalancing/reassignment required.

## Stage E: Sales Progression

Where:
- `Sales assigned inquiries`
- `Sales unified inquiries view`
- `Sales follow-ups queue`
- `Inquiry details`

If/Else:
- If claimable high-priority lead available -> claim immediately.
- If lead progresses -> update stage/sub-stage same day.
- If lead pauses -> keep active with realistic follow-up date.
- If conversion intent confirmed -> update conversion status.
- If admission completed -> update admission status and closure.
- If lead lost -> close with standardized reason and notes.

## Stage F: Conversion / Admission Closure

Where:
- Inquiry status actions
- `Conversions`
- `Admitted students`

If/Else:
- If converted but not admitted -> keep intermediate status policy.
- If admitted complete -> final close with timestamp and remark.
- If reversal/cancellation -> audit note and policy correction.

Outcome:
- Dashboards and reports update automatically from final states.

---

## 6) Presales Workflow Manual (Deep)

### Presales mission
- Fast first-contact SLA
- Reliable qualification
- Accurate handover context
- Follow-up discipline without leakage

### Presales page instructions

`Dashboard`:
- Check new, due, overdue counts and decide day priority.

`Presales inquiries`:
- Pick new leads, validate profile basics, start contact attempts.

`Inquiry details`:
- Maintain messages, update qualification, manage follow-ups, forward when ready.

`Presales follow-ups queue`:
- Clear all due and overdue follow-ups by priority.

`Calls`:
- Map call outcomes to inquiry notes and next action.

`My inquiries`:
- Track personal ownership and closure readiness.

### Presales if/else operating flow

1. Start shift queue check:
- If overdue follow-ups are high -> clear overdues first.
- Else process new leads first.

2. Contact loop:
- If contact successful -> qualify and plan next step.
- Else -> log attempt and schedule next follow-up.

3. Qualification decision:
- If ready for Sales -> forward with full context.
- Else -> continue nurture cycle.

4. End-of-day control:
- If active lead has no next action -> fix immediately.
- If repeated no-response high intent -> escalate to Admin.

### Presales permissions
- Can create/edit allowed inquiry fields.
- Can add messages and manage follow-ups.
- Can forward to Sales.
- Cannot manage users/options.
- Cannot finalize conversion/admission.

---

## 7) Sales Workflow Manual (Deep)

### Sales mission
- Progress qualified leads to conversion
- Keep funnel stage data accurate
- Close admissions with complete records

### Sales page instructions

`Dashboard`:
- Review open pipeline, due callbacks, probable closures.

`Sales assigned inquiries`:
- Claim and prioritize actionable leads.

`Sales unified inquiries view`:
- Track stage movement and stalled leads.

`Inquiry details`:
- Read Presales history, update stage, run follow-up plan, close outcomes.

`Sales follow-ups queue`:
- Execute all due callbacks and commitments.

`Conversions`:
- Review conversion consistency and pending admissions.

`Admitted students`:
- Validate final admitted cases and coordination context.

`Center dashboard`:
- Monitor center-level closure performance.

### Sales if/else operating flow

1. Queue action:
- If unclaimed priority leads exist -> claim first.
- Else clear due follow-ups first.

2. Stage handling:
- If conversation advances -> update stage/sub-stage immediately.
- Else if objection remains -> record reason and next follow-up.

3. Outcome handling:
- If converted -> mark conversion.
- If admitted -> mark admission final.
- If lost -> close with standard loss reason.

4. Exception:
- If ownership conflict -> raise admin reassignment.
- If center mapping wrong -> raise admin correction.

### Sales permissions
- Can claim/manage sales-stage inquiries.
- Can add messages and follow-ups.
- Can update conversion/admission.
- Cannot manage users/options.
- Cannot perform admin-level balancing.

---

## 8) Admin Workflow Manual (Deep)

### Admin mission
- Maintain process control and compliance
- Ensure correct user access and master data quality
- Detect and fix funnel bottlenecks early

### Admin page instructions

`Dashboard`:
- Track system pressure: unattended, due, overdue, closures.

`Presales inquiries`:
- Identify delayed first-stage handling and weak qualification.

`Sales inquiries`:
- Identify stalled sales funnel and closure delays.

`Admin follow-ups`:
- Monitor due/overdue discipline across teams.

`Users`:
- Create users, update role/centers, deactivate exits.

`Manage options`:
- Maintain clean sources, courses, stages, sub-stages, dispositions, centers.

`Reports`:
- Analyze productivity and outcome trends by team/user/source/center.

`Center dashboard`:
- Compare center performance and leakage points.

`Calls`:
- Run quality checks for dispute and coaching evidence.

### Admin if/else operating flow

1. Daily health scan:
- If overdue/unattended spike -> immediate balancing and monitoring.
- Else continue standard governance checks.

2. Workload balancing:
- If one queue overloaded -> reassign/bulk reassign.
- If repeated poor follow-up discipline -> coaching + tighter review.

3. User governance:
- If user leaves -> deactivate same day.
- If role changes -> update access before next shift.
- If user reports access issue -> verify role + center + session state.

4. Master-data governance:
- If new approved category needed -> add standardized option.
- If duplicate options found -> merge/rationalize as per policy.

5. Data-quality governance:
- If conversion/admission mismatch found -> audit timeline and correct.
- If repeated mismatch by team -> enforce corrective SOP.

### Admin permissions
- Full user lifecycle and role/center access control.
- Assignment, reassignment, bulk balancing authority.
- Master options authority.
- Full report and cross-team visibility.
- Process intervention and escalation authority.

---

## 9) Global Compliance Rules

1. No active inquiry without owner.
2. No active inquiry without next action.
3. No handover without context.
4. No closure without reason.
5. No operation outside role and center permissions.

Any violation should be corrected in the same shift.

---

## 10) Daily Checklists

### Presales
- Clear due/overdue follow-ups.
- Ensure every active lead has next action.
- Forward only qualified leads with context.
- Keep notes meaningful after every interaction.

### Sales
- Work prioritized assigned/claimed leads.
- Update stage/sub-stage same day.
- Keep follow-up queue current.
- Close outcomes with valid reasons.

### Admin
- Monitor pressure points and leakage risk.
- Balance assignments.
- Validate users, permissions, and options.
- Review reports and trigger corrective action.

---

## 11) Escalation Protocol

Escalate to Admin when:
- High-potential leads remain unreachable repeatedly
- Ownership conflict blocks progress
- Required option/master value is missing
- Center permission mismatch blocks operations
- Dashboard/report trend appears inconsistent with ground reality

Escalation note must include:
- Inquiry ID
- Current owner
- Last action time
- Issue summary
- Decision requested

---

## 12) Final Instruction

Use this CRM as a process-control system, not memory-based tracking.

When page discipline, role boundaries, and the defined `if/else` logic are followed, inquiry handling remains controlled from form creation through conversion or admission closure.
