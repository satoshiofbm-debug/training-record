(() => {
  const STORAGE_KEY = "training-record-mvp-v1";
  const SAVE_DELAY = 350;

  const conditions = [
    { key: "sleep", label: "睡眠", options: ["good", "normal", "poor"], ja: { good: "良い", normal: "普通", poor: "短い" } },
    { key: "fatigue", label: "疲労", options: ["low", "normal", "high"], ja: { low: "低い", normal: "普通", high: "高い" } },
    { key: "nutrition", label: "栄養", options: ["good", "normal", "poor"], ja: { good: "良い", normal: "普通", poor: "不足" } },
    { key: "general", label: "体調", options: ["good", "normal", "poor"], ja: { good: "良い", normal: "普通", poor: "不調" } },
  ];

  const seed = {
    trainer: "大金 聡",
    date: "2026-08-08",
    sessions: [
      makeSession("s1000", "10:00", "A326", "白井 枝里子", "ダイエット / ボディメイク", "体脂肪率26%、ウエスト-5cm", "2026-07-15"),
      makeSession("s1100", "11:00", "A911", "森下 航", "筋力向上", "ベンチプレス80kgを安定して挙上", "2026-07-20"),
      makeSession("s1200", "12:00", "A214", "西野 真由", "姿勢改善", "肩こりを減らし、胸椎伸展を改善", "2026-07-05"),
      makeSession("s1300", "13:00", "A508", "田辺 智子", "産後リコンディショニング", "骨盤周囲の安定性を高める", "2026-06-28"),
      makeSession("s1400", "14:00", "A771", "久保 健太", "ランニング補強", "10kmを痛みなく走り切る", "2026-07-18"),
      makeSession("s1500", "15:00", "A145", "河野 由衣", "ボディメイク", "下半身の筋量を増やし姿勢を整える", "2026-07-22"),
      makeSession("s1600", "16:00", "A639", "榊原 亮", "肩の不安軽減", "プレス動作で肩前面の不安を減らす", "2026-06-30"),
      makeSession("s1700", "17:00", "A402", "遠藤 梨花", "減量", "3ヶ月で-4kg、週2回運動習慣化", "2026-07-12"),
      makeSession("s1800", "18:00", "A583", "岡本 拓", "腰痛予防", "デスクワーク後の腰部張りを軽減", "2026-07-08"),
      makeSession("s1900", "19:00", "A930", "石井 萌", "大会準備", "ヒップラインと背中のアウトライン改善", "2026-07-25"),
    ],
  };

  const templates = [
    {
      name: "ベンチプレス",
      previous: "40kg x 8 x 3, RPE8/RIR2",
      recommendation: "42.5kg x 8 x 3",
      actual: { load: "42.5", reps: "8", sets: "3", rpe: "8", rir: "2" },
      reason: "上半身の大筋群を使い、除脂肪量の維持と消費量確保につなげる",
      effect: "胸郭の安定、押す動作の筋出力向上",
    },
    {
      name: "ラットプルダウン",
      previous: "32kg x 10 x 3, RPE7/RIR3",
      recommendation: "34kg x 10 x 3",
      actual: { load: "34", reps: "10", sets: "3", rpe: "7", rir: "3" },
      reason: "背部の活動量を確保し、姿勢改善と見た目の変化を支える",
      effect: "肩甲帯の安定、上半身ボリューム確保",
    },
    {
      name: "スプリットスクワット（DB）",
      previous: "10kg x 10 x 3, RPE8/RIR2",
      recommendation: "12kg x 10 x 3 if condition permits",
      actual: { load: "12", reps: "10", sets: "3", rpe: "8", rir: "2" },
      reason: "下半身の大筋群を使い、消費量と片脚コントロールを同時に高める",
      effect: "臀部・大腿部の刺激、安定した動作獲得",
    },
    {
      name: "チェストプレス",
      previous: "28kg x 10 x 2, RPE7/RIR3",
      recommendation: "30kg x 10 x 2",
      actual: { load: "30", reps: "10", sets: "2", rpe: "7", rir: "3" },
      reason: "ベンチプレス後に安全に押す量を補う",
      effect: "トレーニング量の底上げ",
    },
    {
      name: "レッグカール",
      previous: "24kg x 12 x 3, RPE7/RIR3",
      recommendation: "26kg x 12 x 3",
      actual: { load: "26", reps: "12", sets: "3", rpe: "7", rir: "3" },
      reason: "膝関節を安定させ、下半身種目の質を支える",
      effect: "ハムストリングスの強化",
    },
    {
      name: "プランク",
      previous: "45sec x 3, RPE7/RIR3",
      recommendation: "50sec x 3",
      actual: { load: "自重", reps: "50秒", sets: "3", rpe: "7", rir: "3" },
      reason: "体幹の固定力を高め、腰部の代償を抑える",
      effect: "姿勢保持、腹部コントロール",
    },
  ];

  const state = {
    sessions: seed.sessions,
    openTabs: [],
    activeSessionId: null,
    drafts: {},
    saveTimer: null,
  };

  const dom = {};

  document.addEventListener("DOMContentLoaded", () => {
    bindDom();
    restore();
    seedHardScenario();
    bindEvents();
    renderAll();
  });

  function makeSession(id, time, customerId, name, purpose, goal, confirmedAt) {
    return {
      id,
      time,
      duration: 50,
      customerId,
      name,
      purpose,
      goal,
      confirmedAt,
      status: "not-started",
      latestAssessment: "姿勢: 骨盤前傾やや強め / ROM: 股関節伸展不足",
      previousNote: "前回はフォーム安定。終盤に疲労で膝が内側へ入りやすい。",
      policy: "除脂肪量の維持・必要なトレーニング量の確保・姿勢と動作効率の改善",
    };
  }

  function bindDom() {
    [
      "openCount",
      "doneCount",
      "sessionSearch",
      "openNextBtn",
      "sessionList",
      "dateLabel",
      "activeTitle",
      "copyPreviousBtn",
      "saveDraftBtn",
      "completeBtn",
      "tabRail",
      "emptyState",
      "clientWorkspace",
      "clientName",
      "clientMeta",
      "draftState",
      "sessionStatus",
      "conditionGrid",
      "painPart",
      "painSeverity",
      "painNote",
      "addExerciseBtn",
      "resetWorkoutBtn",
      "exerciseRows",
      "goalChain",
      "historyBox",
      "trainerMemo",
      "structureMemoBtn",
      "exportBtn",
      "structuredMemo",
      "toast",
    ].forEach((id) => {
      dom[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    dom.sessionSearch.addEventListener("input", renderSessions);
    dom.openNextBtn.addEventListener("click", openNextSession);
    dom.sessionList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-session]");
      if (!button) return;
      openSession(button.dataset.openSession);
    });
    dom.tabRail.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close-tab]");
      if (close) {
        closeTab(close.dataset.closeTab);
        return;
      }
      const tab = event.target.closest("[data-tab-session]");
      if (tab) activateSession(tab.dataset.tabSession);
    });
    dom.copyPreviousBtn.addEventListener("click", copyPreviousWorkout);
    dom.saveDraftBtn.addEventListener("click", () => saveActiveDraft(true));
    dom.completeBtn.addEventListener("click", completeActiveSession);
    dom.conditionGrid.addEventListener("click", handleConditionClick);
    dom.painPart.addEventListener("input", updatePain);
    dom.painSeverity.addEventListener("change", updatePain);
    dom.painNote.addEventListener("input", updatePain);
    dom.addExerciseBtn.addEventListener("click", addExercise);
    dom.resetWorkoutBtn.addEventListener("click", resetWorkout);
    dom.exerciseRows.addEventListener("input", handleExerciseInput);
    dom.exerciseRows.addEventListener("click", handleExerciseDecision);
    dom.trainerMemo.addEventListener("input", handleMemoInput);
    dom.structureMemoBtn.addEventListener("click", structureMemo);
    dom.exportBtn.addEventListener("click", exportActiveSession);
    window.addEventListener("beforeunload", (event) => {
      if (!hasUnsavedDraft()) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function restore() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) return;
      state.openTabs = Array.isArray(stored.openTabs) ? stored.openTabs : [];
      state.activeSessionId = stored.activeSessionId || null;
      state.drafts = stored.drafts && typeof stored.drafts === "object" ? stored.drafts : {};
      if (stored.statuses) {
        state.sessions = state.sessions.map((session) => ({
          ...session,
          status: stored.statuses[session.id] || session.status,
        }));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function seedHardScenario() {
    if (state.openTabs.length) return;
    state.openTabs = ["s1000", "s1100", "s1200"];
    state.activeSessionId = "s1000";
    state.openTabs.forEach((id) => {
      ensureDraft(id);
      state.drafts[id].prepared = true;
      state.drafts[id].dirty = false;
      state.drafts[id].lastSavedAt = new Date().toISOString();
    });
    persist();
  }

  function renderAll() {
    dom.dateLabel.textContent = `${formatDate(seed.date)} / ${seed.trainer}`;
    renderSessions();
    renderTabs();
    renderWorkspace();
    updateCounts();
  }

  function renderSessions() {
    const query = dom.sessionSearch.value.trim().toLowerCase();
    const sessions = state.sessions.filter((session) => {
      if (!query) return true;
      return `${session.time} ${session.name} ${session.customerId} ${session.purpose}`.toLowerCase().includes(query);
    });
    dom.sessionList.innerHTML = sessions.map((session) => {
      const active = session.id === state.activeSessionId ? "active" : "";
      const open = state.openTabs.includes(session.id) ? "opened" : "";
      const mini = session.status === "done" ? "done" : open ? "open" : session.status === "not-started" ? "planned" : session.status;
      return `
        <button class="session-item ${active}" data-open-session="${escapeHtml(session.id)}">
          <span class="session-time">${escapeHtml(session.time)}</span>
          <span class="session-info">
            <strong>${escapeHtml(session.name)}</strong>
            <span>${escapeHtml(session.customerId)} / ${escapeHtml(session.purpose)}</span>
            <span class="mini-state ${session.status === "done" ? "done" : ""}">${escapeHtml(mini)}</span>
          </span>
        </button>
      `;
    }).join("");
  }

  function renderTabs() {
    dom.tabRail.innerHTML = state.openTabs.map((sessionId) => {
      const session = getSession(sessionId);
      const draft = ensureDraft(sessionId);
      const active = sessionId === state.activeSessionId ? "active" : "";
      const dirty = draft.dirty ? `<span class="dirty-dot">●</span>` : "";
      return `
        <button class="client-tab ${active}" data-tab-session="${escapeHtml(sessionId)}">
          <span class="client-tab-name">${dirty} ${escapeHtml(session.time)} ${escapeHtml(session.name)}</span>
          <span class="close-tab" data-close-tab="${escapeHtml(sessionId)}" title="タブを閉じる"><svg><use href="#i-close"></use></svg></span>
        </button>
      `;
    }).join("");
  }

  function renderWorkspace() {
    const session = getActiveSession();
    const hasActive = Boolean(session);
    dom.emptyState.classList.toggle("hidden", hasActive);
    dom.clientWorkspace.classList.toggle("hidden", !hasActive);
    dom.copyPreviousBtn.disabled = !hasActive;
    dom.saveDraftBtn.disabled = !hasActive;
    dom.completeBtn.disabled = !hasActive;
    if (!session) {
      dom.activeTitle.textContent = "セッションを開いてください";
      return;
    }

    const draft = ensureDraft(session.id);
    dom.activeTitle.textContent = `${session.time} ${session.name}`;
    dom.clientName.textContent = session.name;
    dom.clientMeta.textContent = `${session.customerId} / ${session.duration}分 / ${session.purpose}`;
    dom.draftState.textContent = draft.dirty ? "unsaved" : `saved ${draft.lastSavedAt ? formatTime(draft.lastSavedAt) : ""}`;
    dom.draftState.className = `state-pill ${draft.dirty ? "dirty-pill" : ""}`;
    dom.sessionStatus.textContent = statusLabel(session.status);
    dom.sessionStatus.className = `state-pill ${session.status === "done" ? "done-pill" : "muted-pill"}`;
    renderConditions(draft);
    renderPain(draft);
    renderExercises(draft);
    renderGoalChain(session, draft);
    renderHistory(session, draft);
    renderMemo(draft);
  }

  function renderConditions(draft) {
    dom.conditionGrid.innerHTML = conditions.map((condition) => {
      const selected = draft.condition[condition.key];
      const buttons = condition.options.map((option) => `
        <button class="${selected === option ? "active" : ""}" data-condition="${condition.key}" data-value="${option}">
          ${escapeHtml(condition.ja[option])}
        </button>
      `).join("");
      return `
        <div class="condition-block">
          <span class="condition-label">${escapeHtml(condition.label)}</span>
          <div class="segmented">${buttons}</div>
        </div>
      `;
    }).join("");
  }

  function renderPain(draft) {
    dom.painPart.value = draft.pain.bodyPart;
    dom.painSeverity.value = String(draft.pain.severity);
    dom.painNote.value = draft.pain.note;
  }

  function renderExercises(draft) {
    dom.exerciseRows.innerHTML = draft.exercises.map((exercise, index) => `
      <tr>
        <td>
          <div class="exercise-title">
            ${escapeHtml(exercise.name)}
            <span>${escapeHtml(exercise.effect)}</span>
          </div>
        </td>
        <td>${escapeHtml(exercise.previous)}</td>
        <td>${escapeHtml(exercise.recommendation)}<br><span class="muted">${escapeHtml(exercise.reason)}</span></td>
        <td>
          <div class="actual-grid">
            <input data-exercise="${index}" data-field="load" value="${escapeHtml(exercise.actual.load)}" aria-label="load">
            <input data-exercise="${index}" data-field="reps" value="${escapeHtml(exercise.actual.reps)}" aria-label="reps">
            <input data-exercise="${index}" data-field="sets" value="${escapeHtml(exercise.actual.sets)}" aria-label="sets">
          </div>
        </td>
        <td><input class="rating-input" data-exercise="${index}" data-field="rpe" value="${escapeHtml(exercise.actual.rpe)}" aria-label="RPE"></td>
        <td><input class="rating-input" data-exercise="${index}" data-field="rir" value="${escapeHtml(exercise.actual.rir)}" aria-label="RIR"></td>
        <td>
          <div class="decision-row">
            ${["accept", "modify", "reject"].map((decision) => `
              <button class="${exercise.decision === decision ? "active" : ""}" data-decision="${decision}" data-exercise="${index}">
                ${decisionLabel(decision)}
              </button>
            `).join("")}
          </div>
        </td>
      </tr>
    `).join("");
  }

  function renderGoalChain(session, draft) {
    const firstExercise = draft.exercises.find((exercise) => exercise.decision !== "reject") || draft.exercises[0];
    dom.goalChain.innerHTML = [
      ["Client goal", `${session.goal}（${session.confirmedAt}確認）`],
      ["Today's policy", session.policy],
      ["Exercise choice", firstExercise ? `${firstExercise.name}: ${firstExercise.reason}` : "種目未設定"],
      ["Load / reps / sets", firstExercise ? `${firstExercise.actual.load} x ${firstExercise.actual.reps} x ${firstExercise.actual.sets}` : "未入力"],
      ["Observed result", `RPE${firstExercise?.actual.rpe || "-"} / RIR${firstExercise?.actual.rir || "-"}`],
      ["Next recommendation", nextRecommendation(draft)],
    ].map(([title, text]) => `
      <div class="chain-node">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(text)}</span>
      </div>
    `).join("");
  }

  function renderHistory(session, draft) {
    dom.historyBox.innerHTML = `
      <div class="history-item">
        <strong>前回メモ</strong>
        <span>${escapeHtml(session.previousNote)}</span>
      </div>
      ${draft.exercises.slice(0, 4).map((exercise) => `
        <div class="history-item">
          <strong>${escapeHtml(exercise.name)}</strong>
          <span>${escapeHtml(exercise.previous)}</span>
        </div>
      `).join("")}
      <div class="history-item">
        <strong>最新評価</strong>
        <span>${escapeHtml(session.latestAssessment)}</span>
      </div>
    `;
  }

  function renderMemo(draft) {
    dom.trainerMemo.value = draft.memo;
    dom.structuredMemo.innerHTML = draft.structuredMemo.length
      ? draft.structuredMemo.map((line) => `
        <div class="structured-line">
          <strong>${escapeHtml(line.title)}</strong>
          ${escapeHtml(line.text)}
        </div>
      `).join("")
      : "";
  }

  function openSession(sessionId) {
    if (!state.openTabs.includes(sessionId)) state.openTabs.push(sessionId);
    activateSession(sessionId);
  }

  function activateSession(sessionId) {
    state.activeSessionId = sessionId;
    ensureDraft(sessionId);
    persist();
    renderAll();
  }

  function closeTab(sessionId) {
    const draft = state.drafts[sessionId];
    if (draft?.dirty && !window.confirm("未保存の下書きがあります。タブを閉じますか？")) return;
    state.openTabs = state.openTabs.filter((id) => id !== sessionId);
    if (state.activeSessionId === sessionId) {
      state.activeSessionId = state.openTabs[0] || null;
    }
    persist();
    renderAll();
  }

  function openNextSession() {
    const next = state.sessions.find((session) => session.status !== "done" && !state.openTabs.includes(session.id)) ||
      state.sessions.find((session) => session.status !== "done");
    if (!next) {
      toast("未完了セッションはありません");
      return;
    }
    openSession(next.id);
  }

  function copyPreviousWorkout() {
    const draft = getActiveDraft();
    if (!draft) return;
    draft.exercises = templates.map(copyExercise);
    draft.prepared = true;
    markDirty();
    renderWorkspace();
    toast("前回メニューをコピーしました");
  }

  function saveActiveDraft(showToast = false) {
    const draft = getActiveDraft();
    if (!draft) return;
    draft.dirty = false;
    draft.lastSavedAt = new Date().toISOString();
    persist();
    renderTabs();
    renderWorkspace();
    if (showToast) toast("下書きを保存しました");
  }

  function completeActiveSession() {
    const session = getActiveSession();
    const draft = getActiveDraft();
    if (!session || !draft) return;
    session.status = "done";
    draft.completedAt = new Date().toISOString();
    draft.dirty = false;
    draft.lastSavedAt = new Date().toISOString();
    structureMemo(false);
    persist();
    renderAll();
    toast(`${session.name} のセッションを完了しました`);
  }

  function handleConditionClick(event) {
    const button = event.target.closest("[data-condition]");
    if (!button) return;
    const draft = getActiveDraft();
    if (!draft) return;
    draft.condition[button.dataset.condition] = button.dataset.value;
    markDirty();
    renderWorkspace();
  }

  function updatePain() {
    const draft = getActiveDraft();
    if (!draft) return;
    draft.pain.bodyPart = dom.painPart.value;
    draft.pain.severity = Number(dom.painSeverity.value);
    draft.pain.note = dom.painNote.value;
    markDirty();
    renderGoalChain(getActiveSession(), draft);
  }

  function addExercise() {
    const draft = getActiveDraft();
    if (!draft) return;
    draft.exercises.push({
      ...copyExercise(templates[draft.exercises.length % templates.length]),
      name: `追加種目 ${draft.exercises.length + 1}`,
      previous: "新規",
      recommendation: "負荷 / 回数 / セットを入力",
      decision: "modify",
    });
    markDirty();
    renderWorkspace();
  }

  function resetWorkout() {
    const draft = getActiveDraft();
    if (!draft) return;
    draft.exercises = templates.map(copyExercise);
    markDirty();
    renderWorkspace();
    toast("推奨メニューに戻しました");
  }

  function handleExerciseInput(event) {
    const input = event.target.closest("[data-exercise]");
    if (!input) return;
    const draft = getActiveDraft();
    if (!draft) return;
    const exercise = draft.exercises[Number(input.dataset.exercise)];
    if (!exercise) return;
    const field = input.dataset.field;
    if (["load", "reps", "sets", "rpe", "rir"].includes(field)) {
      exercise.actual[field] = input.value;
      markDirty();
      renderGoalChain(getActiveSession(), draft);
    }
  }

  function handleExerciseDecision(event) {
    const button = event.target.closest("[data-decision]");
    if (!button) return;
    const draft = getActiveDraft();
    if (!draft) return;
    const exercise = draft.exercises[Number(button.dataset.exercise)];
    if (!exercise) return;
    exercise.decision = button.dataset.decision;
    markDirty();
    renderWorkspace();
  }

  function handleMemoInput() {
    const draft = getActiveDraft();
    if (!draft) return;
    draft.memo = dom.trainerMemo.value;
    markDirty();
  }

  function structureMemo(showToast = true) {
    const session = getActiveSession();
    const draft = getActiveDraft();
    if (!session || !draft) return;
    const conditionText = conditions.map((condition) => (
      `${condition.label}: ${condition.ja[draft.condition[condition.key]]}`
    )).join(" / ");
    const painText = draft.pain.severity ? `${draft.pain.bodyPart || "部位未記入"} ${draft.pain.severity}/5 ${draft.pain.note}` : "痛みなし";
    const topResult = draft.exercises
      .filter((exercise) => exercise.decision !== "reject")
      .slice(0, 2)
      .map((exercise) => `${exercise.name} ${exercise.actual.load} x ${exercise.actual.reps} x ${exercise.actual.sets} RPE${exercise.actual.rpe}/RIR${exercise.actual.rir}`)
      .join("、");
    draft.structuredMemo = [
      { title: "本日のヒアリング", text: `${conditionText}。${painText}。` },
      { title: "目標への進捗", text: `${session.goal} に対して、${session.policy} を継続。` },
      { title: "実施結果", text: topResult || "実施種目なし" },
      { title: "次回接続", text: nextRecommendation(draft) },
      { title: "原文メモ", text: draft.memo || "メモ未入力" },
    ];
    markDirty();
    saveActiveDraft(false);
    renderWorkspace();
    if (showToast) toast("メモを構造化しました");
  }

  function exportActiveSession() {
    const session = getActiveSession();
    const draft = getActiveDraft();
    if (!session || !draft) return;
    const payload = {
      session_id: session.id,
      customer_id: session.customerId,
      trainer_id: "trainer-ogane",
      date: seed.date,
      time: session.time,
      customer: session.name,
      current_goal: {
        goal_id: `goal-${session.customerId}`,
        purpose: session.purpose,
        goal: session.goal,
        confirmed_at: session.confirmedAt,
      },
      condition: draft.condition,
      pain_records: draft.pain.severity ? [draft.pain] : [],
      session_policy: session.policy,
      session_exercises: draft.exercises.map((exercise, index) => ({
        session_exercise_id: `${session.id}-ex-${index + 1}`,
        exercise_id: canonicalId(exercise.name),
        exercise_name: exercise.name,
        rationale: exercise.reason,
        expected_effect: exercise.effect,
        recommendation: exercise.recommendation,
        trainer_decision: exercise.decision,
        exercise_sets: [{
          set_id: `${session.id}-ex-${index + 1}-set-1`,
          load: exercise.actual.load,
          reps: exercise.actual.reps,
          sets: exercise.actual.sets,
          rpe: exercise.actual.rpe,
          rir: exercise.actual.rir,
        }],
      })),
      session_notes: {
        raw: draft.memo,
        structured: draft.structuredMemo,
      },
    };
    download(`${session.customerId}-${seed.date}-training-record.json`, JSON.stringify(payload, null, 2));
    toast("構造化データを書き出しました");
  }

  function ensureDraft(sessionId) {
    if (!state.drafts[sessionId]) {
      state.drafts[sessionId] = {
        prepared: false,
        dirty: false,
        lastSavedAt: "",
        completedAt: "",
        condition: {
          sleep: "normal",
          fatigue: "normal",
          nutrition: "normal",
          general: "good",
        },
        pain: {
          bodyPart: "",
          severity: 0,
          onset: "today",
          note: "",
        },
        exercises: templates.map(copyExercise),
        memo: "",
        structuredMemo: [],
      };
    }
    return state.drafts[sessionId];
  }

  function copyExercise(exercise) {
    return {
      name: exercise.name,
      previous: exercise.previous,
      recommendation: exercise.recommendation,
      reason: exercise.reason,
      effect: exercise.effect,
      decision: "accept",
      actual: { ...exercise.actual },
    };
  }

  function markDirty() {
    const draft = getActiveDraft();
    if (!draft) return;
    draft.dirty = true;
    renderTabs();
    dom.draftState.textContent = "unsaved";
    dom.draftState.className = "state-pill dirty-pill";
    window.clearTimeout(state.saveTimer);
    state.saveTimer = window.setTimeout(() => saveActiveDraft(false), SAVE_DELAY);
  }

  function persist() {
    const statuses = Object.fromEntries(state.sessions.map((session) => [session.id, session.status]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      openTabs: state.openTabs,
      activeSessionId: state.activeSessionId,
      drafts: state.drafts,
      statuses,
    }));
  }

  function hasUnsavedDraft() {
    return Object.values(state.drafts).some((draft) => draft.dirty);
  }

  function updateCounts() {
    dom.openCount.textContent = state.openTabs.length;
    dom.doneCount.textContent = state.sessions.filter((session) => session.status === "done").length;
  }

  function getSession(sessionId) {
    return state.sessions.find((session) => session.id === sessionId);
  }

  function getActiveSession() {
    return state.activeSessionId ? getSession(state.activeSessionId) : null;
  }

  function getActiveDraft() {
    return state.activeSessionId ? ensureDraft(state.activeSessionId) : null;
  }

  function statusLabel(status) {
    return {
      "not-started": "not started",
      "in-progress": "in progress",
      done: "completed",
    }[status] || status;
  }

  function decisionLabel(decision) {
    return { accept: "採用", modify: "修正", reject: "却下" }[decision] || decision;
  }

  function nextRecommendation(draft) {
    const highRpe = draft.exercises.some((exercise) => Number(exercise.actual.rpe) >= 9);
    const pain = draft.pain.severity >= 3;
    if (pain) return "痛み部位を避け、可動域と負荷を下げて再評価";
    if (highRpe) return "次回は同負荷でフォーム安定を優先";
    return "次回は主要種目を小幅に漸進し、片脚種目の安定性を見る";
  }

  function canonicalId(name) {
    return `ex-${String(name).toLowerCase().replace(/[^a-z0-9ぁ-んァ-ン一-龥]+/g, "-").replace(/^-|-$/g, "")}`;
  }

  function formatDate(iso) {
    const date = new Date(`${iso}T00:00:00`);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${weekdays[date.getDay()]}`;
  }

  function formatTime(iso) {
    const date = new Date(iso);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  let toastTimer = null;
  function toast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => dom.toast.classList.remove("show"), 2600);
  }
})();
