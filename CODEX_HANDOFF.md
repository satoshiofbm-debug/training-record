# CODEX_HANDOFF.md

## First build
Create an interactive MVP prototype of the TODAY workflow.

### Required layout
- Left: today's ~10 assigned sessions
- Top: multiple open client tabs
- Center: active client's session preparation and workout logging
- Right: goal consistency, history, trainer memo
- Fast tab switching with draft preservation

### Hard scenario
Trainer has sessions from 10:00 through 19:00.
Before the first session, the trainer opens and prepares Client A, B, and C.

At 10:00:
- A tab active
- condition checked
- prepared program used
- actual load edited during training
- session completed

At 10:58:
- trainer switches directly to already-open B
- B's prepared workout is still intact
- no search or reload

This workflow is mandatory.

## Seed client
Name: 白井 枝里子
Customer ID: A326
Purpose: ダイエット / ボディメイク
Goal: 体脂肪率26%、ウエスト-5cm
Goal confirmed: 2026-07-15

Example exercises:
1. ベンチプレス
2. ラットプルダウン
3. スプリットスクワット（DB）
4. チェストプレス
5. レッグカール
6. プランク

Each exercise shows:
- previous result
- today's recommendation
- why it supports the goal
- expected effect
- accept / modify / reject

## Example rationale
Goal:
体脂肪率26%、ウエスト-5cm

Today's policy:
- maintain/increase lean mass
- secure training volume
- improve posture and movement efficiency

Exercise:
スプリットスクワット

Why:
- recruits large lower-body musculature
- increases training volume and energy expenditure
- unilateral control supports stable movement

Progression:
Previous 10kg x 10 x 3, RPE8/RIR2
-> Today 12kg x 10 x 3 if condition permits

## Acceptance criteria
Trainer can:
- see all today's sessions while viewing one client
- open a client in a new tab in one action
- switch tabs in one action
- preserve independent drafts
- prepare workouts before sessions
- copy previous workout in one action
- edit only changed values
- understand why each exercise is included
- see connection to current client goal
- complete and switch to next client with minimal interaction

## Avoid
- modal-heavy flows
- mandatory long free-text
- one-client-only navigation
- page reload between clients
- forcing search for common exercises
- equally prominent duplicate planned/actual tables
- hiding rationale several clicks away

## Suggested prototype stack
- Next.js / React
- TypeScript
- lightweight component system
- seeded local data/simple persistence

Production consideration:
- PostgreSQL
- API layer
- autosave/draft persistence
- authorization
- audit trail
- booking integration
- CSV/API export

Do not overbuild backend integration first. Prove trainer workflow first.
