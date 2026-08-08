# AGENTS.md

## Project
Training Record Management System

## Mission
Build a training decision-support system for personal trainers.

Primary purpose:
Use the previous session result and the client's current condition to help the trainer decide what to do today.

## Priorities
1. Input speed
2. Readability
3. Data consistency
4. AI analyzability
5. Detail

Target: 90%+ logging completion and average logging time <= 2 minutes/session.

## Critical operating constraints
- A trainer may handle around 10 clients/day.
- Trainers must be able to prepare workout menus before sessions.
- Multiple client sessions must be open simultaneously.
- Switching between clients must be instant.
- Independent unsaved draft state per client tab.
- Autosave drafts.
- Warn before closing a tab with unsaved changes.
- Today's sessions stay visible in a persistent list.
- Scale target: 4,000-5,000 clients.
- Centralized normalized data; do not use one file/sheet per client as the underlying model.
- Design for future booking-system integration.

## Core workflow
1. Open TODAY.
2. See today's assigned sessions.
3. Open several upcoming clients as tabs.
4. Prepare programs before sessions.
5. Switch tabs without losing drafts.
6. At session start, confirm condition/pain.
7. Start from previous-session copy or AI recommendation.
8. Edit only changed weights/reps/sets.
9. Record RPE and RIR.
10. Add a short trainer memo.
11. AI structures the memo.
12. Complete/save.
13. Switch immediately to the next open client tab.

## Goal consistency
Every exercise must answer:
- Why are we doing this exercise?
- Which client goal does it support?
- What effect is expected?
- Why is it appropriate today?

Required chain:
Client goal -> today's session policy -> exercise choice -> load/reps/sets -> observed result -> next-session recommendation.

## Data hierarchy
Session -> SessionExercise -> ExerciseSet

Core entities:
customers, trainers, goals, sessions, conditions, pain_records, exercises,
session_exercises, exercise_sets, session_notes, assessments,
ai_recommendations, ai_feedback.

Use IDs as integration keys:
customer_id, trainer_id, session_id, exercise_id, set_id, goal_id, assessment_id.

## Exercise master
Centralized, searchable.
Priority:
1. Recently used by this client
2. Recently used by this trainer
3. Frequently used exercises
4. Search
Allow exceptional free-entry/new exercise creation with canonical IDs.

## Condition
Fast tap-based input:
- sleep: good / normal / poor
- fatigue: low / normal / high
- nutrition: good / normal / poor
- general condition: good / normal / poor

## Pain/discomfort
Store body_part, severity, onset, optional context, optional note.

## Goals
Historical, never simply overwritten.
Store goal_id, customer_id, purpose, goal, confirmed_at, active_from, active_to,
is_current, trainer_id, note.

## Assessments
Separate page: body composition, posture, ROM, strength, movement assessment, other.
Always retain assessment date.

## Planned vs actual
Store both.
Default UI emphasizes actual performance.
Only expose plan-vs-actual differences when useful.

## RPE/RIR
Store both. Default UX may be exercise-level; data model should allow future set-level input.
Avoid duplicate manual entry where possible.

## AI V1
Recommend today's actions from:
- current purpose/goal
- previous session
- RPE/RIR
- today's condition
- pain/discomfort
- recent history
- latest relevant assessment

Output:
- recommended exercise/load/reps/sets
- concise reason
- relationship to goal
- accept / modify / reject

Persist:
AI recommendation -> trainer decision -> modification reason -> actual result.

## Session notes
Trainer enters a short rough memo.
AI may structure it into:
- today's interview
- client's subjective report
- progress toward goal
- trainer observations
- connection to next session

## MVP
- client search
- today's session list
- multi-client tabs
- pre-session preparation
- autosaved independent drafts
- client page
- current goal + last confirmed date
- previous workout display
- copy previous workout
- exercise search
- set-level load/reps
- RPE/RIR
- session duration
- condition
- pain/discomfort
- session memo
- AI recommendation
- exercise rationale linked to goal
- AI accept/modify/reject
- structured export

## UX principle
Prefer a desktop-first responsive web app over direct spreadsheet editing.
The spreadsheet/database is a data/export layer, not the trainer's primary UX.
