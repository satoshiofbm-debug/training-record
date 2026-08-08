# Training Record MVP

Personal trainer向けのTODAYワークフローMVPです。  
`AGENTS.md` と `CODEX_HANDOFF.md` の要件に沿って、10セッション/日の高速入力、複数クライアントタブ、前回コピー、目標と種目理由の接続、RPE/RIR、下書き自動保存、構造化エクスポートを実装しています。

## Open

Open `index.html` in a browser.

Local server:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/`.

## Implemented MVP

- Left panel: today's 10 assigned sessions
- Top rail: multiple open client tabs
- Center pane: condition, pain, workout preparation, actual logging
- Right pane: goal consistency chain, previous history, trainer memo
- Seed hard scenario: 10:00, 11:00, 12:00 clients are pre-opened with preserved drafts
- One-action previous workout copy
- Exercise-level actual load/reps/sets, RPE, RIR
- AI recommendation accept / modify / reject
- Autosaved independent drafts per client tab
- Warn before closing a tab with unsaved changes
- Structured JSON export for future database/API integration
