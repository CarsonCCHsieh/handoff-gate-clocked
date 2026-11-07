"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const CASE_ORDER = ["routine", "injection", "unsafe-script", "uncertain", "unavailable"];
  const COPY = {
    zh: {
      skip: "跳至工作區", brand: "交接閘門", localOnly: "本機 · 合成案例",
      headline: "安全交接，先過閘門。", intro: "把有用的事件資訊留下，把個資、越權指令與危險腳本攔下。三道檢查，一個清楚的交接決定。",
      privacyShort: "遮蔽個資", guardShort: "辨識指令", scriptShort: "檢視腳本",
      chooseCase: "挑選合成案例", caseIntro: "五種情境，觀察同一份交接如何通過、待審，或被攔下。",
      fixtureNote: "所有姓名、聯絡方式與事件內容皆為合成資料；只接受固定案例。",
      reviewEyebrow: "REVIEW, THEN HAND OFF", startReview: "檢視這次交接", replayMode: "人工重播", noKey: "無需金鑰", liveMode: "真實 API",
      liveConsent: "我確認僅傳送所選合成案例；這會呼叫三個外部 API，可能消耗服務額度。",
      gateDecision: "交接決定", download: "下載已遮蔽交接", privacyTitle: "個資遮蔽", guardTitle: "指令邊界", scriptTitle: "腳本意圖",
      comparison: "原文與遮蔽對照", comparisonHelp: "原文僅供本機比較。指令辨識接收遮蔽後的內容；只有通過閘門的交接摘要可下載。",
      original: "合成原文", localCompare: "僅供對照", sanitized: "遮蔽後內容", evidenceTitle: "檢視依據與腳本原始碼",
      scriptCaution: "腳本只作靜態檢視，永不執行。", approvedScope: "固定授權範圍", proposedScript: "合成建議腳本", guardEvidence: "指令辨識依據", scriptEvidence: "腳本檢視依據",
      footer: "交接閘門提供檢視輔助，無法保證安全。所有指令與腳本皆不會被執行。",
      replayNoticeTitle: "人工重播預覽", replayNotice: "人工編寫的合成示例，並非真實 API 回應、錄製回放或實測證據。",
      liveNoticeTitle: "真實 API 模式", liveNotice: "需伺服器已有金鑰與下方確認；僅傳送固定合成案例。真實結果將明確標示。",
      replayHelp: "可以完整體驗五種閘門結果。畫面中的結果是人工編寫示例，不消耗 API 額度。",
      liveHelp: "已偵測到伺服器端金鑰。確認資料範圍後，才會實際呼叫 API；金鑰不會傳到瀏覽器。",
      liveUnavailable: "真實 API 未啟用。你仍可使用完整的人工重播預覽。", liveLockedHelp: "上次真實請求狀態未知，這一頁已停止重送。請由操作者先核對伺服器的請求狀態。",
      checking: "連線中", connected: "本機已連線", disconnected: "本機未連線", liveAvailable: "伺服器已備金鑰", notEnabled: "未啟用", liveLocked: "需核對狀態",
      selected: "已選：", inspect: "檢查合成案例", inspectLive: "傳送合成案例至 API", analyzing: "檢查中…",
      replayWorking: "正在讀取人工編寫示例；不會呼叫外部 API。", liveWorking: "正在依序檢查合成資料，最多約六分鐘。請勿重複送出。",
      idleTitle: "先選一個案例", idleDescription: "檢查完成後，這裡會顯示可交接、需要覆核或停止交接。",
      readyTitle: "可以交接", readyDescription: "三道檢查皆通過低風險門檻。可下載已遮蔽的交接摘要；仍須遵守實際授權範圍。",
      reviewTitle: "需要人工覆核", reviewDescription: "資訊不完整、結果不確定或服務不可用。交接摘要已鎖定，請先核對依據。",
      blockedTitle: "停止這次交接", blockedDescription: "偵測到高風險指令或腳本。保留資訊供覆核，交接摘要不可下載。",
      clear: "通過", needsReview: "待覆核", blocked: "已攔下", pending: "待檢查", noResponse: "無有效回應",
      noInput: "選擇案例並開始檢查。", noRedaction: "通過有效遮蔽後顯示。", unavailableRedaction: "遮蔽結果不可用；不提供交接下載。", notYet: "尚無結果", transformed: "已轉換", noEvidence: "沒有提供證據片段。", noScope: "沒有提供有效的授權範圍。",
      privacyIdle: "先確認個資轉換有效。", guardIdle: "僅檢查遮蔽後的文字。", scriptIdle: "靜態分類，永不執行。",
      piiCount: (n) => n + " 處", piiDescription: "已回傳個資範圍；內容僅以類型呈現。", piiMissing: "缺少有效遮蔽結果。", piiInvalid: "資料格式或字元範圍需覆核。",
      guardDescription: "越權指令分數，愈低愈好。", inspectDescription: (a, b) => "惡意 " + a + " · 可疑 " + b,
      replayResult: "人工合成 · 非 API 實測", liveResult: "真實 API 結果", providerFailure: "服務未完成，沒有成功結果替代。",
      backendUnknownReason: "未識別的結果訊息已隱藏，請依閘門狀態覆核。", backendUnknownWarning: "未識別的服務訊息已隱藏。", backendUnknownProvenance: "來源說明未通過已知訊息核對。",
      invalidResult: "回應資料不完整或與所選案例不一致，已保留為覆核並停用下載。", inconsistentReady: "閘門標示與檢查資料不一致，下載已鎖定。",
      unsafeExport: "交接摘要仍含原始敏感片段或腳本，已鎖定下載。", unknownLive: "真實請求的結果未知；這一頁不會重送。請先核對伺服器請求狀態。",
      loadError: "無法取得本機預覽。請確認以 127.0.0.1 開啟已啟動的服務，再重新載入。未呼叫任何外部 API。",
      requestError: "本機請求未完成或回應格式無效，已停止交接。", requestTimeout: "等候結果逾時，已停止交接。", localOnlyError: "僅可在 127.0.0.1 的本機服務使用。",
      requests: (n) => n + " 次請求", creditsUnknown: "額度：未回報", credits: (n) => "額度：" + n,
      cpOffset: (a, b) => "字元 " + a + "–" + b + "（Unicode 碼點）", endpointUnavailable: "檢查未完成。", zeroEntities: "沒有回報個資範圍。",
      cases: {
        routine: ["一般服務事件", "保留事件事實，遮蔽虛構聯絡資訊。", "低風險示例"],
        injection: ["夾帶越權指令", "交接文字要求略過批准、揭露秘密。", "指令攔截示例"],
        "unsafe-script": ["危險修復腳本", "事件看似正常，腳本卻要停用端點防護。", "腳本攔截示例"],
        uncertain: ["資訊與意圖未明", "不完整語意與中間分數，需要人工判讀。", "覆核示例"],
        unavailable: ["檢查服務不可用", "模擬供應商錯誤，驗證無法判定時會關閘。", "失敗關閘示例"]
      },
      entities: { person: "姓名", email: "Email", phone: "電話", address: "地址", bank_account: "銀行帳號" }
    },
    en: {
      skip: "Skip to workbench", brand: "Handoff Gate", localOnly: "LOCAL · SYNTHETIC CASES",
      headline: "A safer handoff starts at the gate.", intro: "Keep the incident facts. Catch personal data, untrusted instructions and unsafe scripts before the next person takes over. Three checks. One clear decision.",
      privacyShort: "Redact", guardShort: "Guard", scriptShort: "Inspect", chooseCase: "Choose a synthetic case", caseIntro: "Five situations. See what makes a handoff ready, uncertain, or blocked.",
      fixtureNote: "Names, contact details and incidents are fictional. Only these fixed synthetic cases can be sent.",
      reviewEyebrow: "REVIEW, THEN HAND OFF", startReview: "Review this handoff", replayMode: "Authored replay", noKey: "No key needed", liveMode: "Live API",
      liveConsent: "I confirm that only the selected synthetic case will be sent. This calls three external APIs and may consume service credits.",
      gateDecision: "Handoff decision", download: "Download sanitized handoff", privacyTitle: "Privacy", guardTitle: "Instruction boundary", scriptTitle: "Script intent",
      comparison: "Before & after redaction", comparisonHelp: "The original stays here for local comparison. The instruction check receives redacted text. Only a ready handoff summary can be downloaded.",
      original: "Synthetic original", localCompare: "LOCAL COMPARISON", sanitized: "Redacted text", evidenceTitle: "Review evidence & script source", scriptCaution: "Scripts are classified as source text only. They are never executed.",
      approvedScope: "Fixed approved scope", proposedScript: "Synthetic proposed script", guardEvidence: "Instruction evidence", scriptEvidence: "Script evidence", footer: "Handoff Gate supports human review; it cannot guarantee safety. No instructions or scripts are executed.",
      replayNoticeTitle: "Authored replay preview", replayNotice: "An authored synthetic illustration. This is not a real API response, recorded API replay, or evidence of live validation.",
      liveNoticeTitle: "Live API mode", liveNotice: "Requires a server-side key and confirmation below. Only fixed synthetic cases are sent. Live results are explicitly labeled.",
      replayHelp: "Explore all five gate outcomes with authored examples. No external API calls or credits are used.",
      liveHelp: "A server-side key is available. Confirm the synthetic-only scope before making real API calls. The browser never receives the key.",
      liveUnavailable: "Live API is not enabled. The complete authored replay preview remains available.", liveLockedHelp: "The previous live request has an unknown outcome. Resending is disabled on this page until the operator checks its server-side request state.",
      checking: "CONNECTING", connected: "LOCAL CONNECTED", disconnected: "LOCAL OFFLINE", liveAvailable: "Server key available", notEnabled: "Not enabled", liveLocked: "Check request state",
      selected: "Selected: ", inspect: "Inspect synthetic case", inspectLive: "Send synthetic case to API", analyzing: "Checking…", replayWorking: "Loading an authored illustration. No external API calls are made.", liveWorking: "Checking synthetic data sequentially. This may take up to six minutes. Please do not submit again.",
      idleTitle: "Start with a case", idleDescription: "A completed review will show whether this handoff is ready, needs review, or must be blocked.",
      readyTitle: "Ready to hand off", readyDescription: "All three checks pass the low-risk threshold. Download the sanitized summary and continue within the actual approved scope.",
      reviewTitle: "Human review needed", reviewDescription: "A result is uncertain, incomplete, or unavailable. Export is locked until the evidence has been reviewed.",
      blockedTitle: "Block this handoff", blockedDescription: "High-risk instructions or script behavior were detected. Keep the evidence for review; handoff export is locked.",
      clear: "Clear", needsReview: "Review", blocked: "Blocked", pending: "Pending", noResponse: "Unavailable", noInput: "Choose a case and start its review.", noRedaction: "Valid redaction will appear here.", unavailableRedaction: "Redaction is unavailable. Handoff export is locked.", notYet: "NO RESULT", transformed: "TRANSFORMED", noEvidence: "No evidence excerpts were provided.", noScope: "No valid approved scope was provided.",
      privacyIdle: "Validate the privacy transformation first.", guardIdle: "Receives redacted text only.", scriptIdle: "Static classification. Never executed.",
      piiCount: (n) => n + " span" + (n === 1 ? "" : "s"), piiDescription: "Reported entity spans. Only entity types are listed.", piiMissing: "No valid redaction is available.", piiInvalid: "Response structure or character offsets need review.", guardDescription: "Instruction-risk score. Lower is better.", inspectDescription: (a, b) => "Malicious " + a + " · suspicious " + b,
      replayResult: "AUTHORED SYNTHETIC · NOT LIVE", liveResult: "LIVE API RESULT", providerFailure: "The service did not complete. No success fallback was substituted.",
      backendUnknownReason: "An unrecognized result message was withheld. Review the gate decision.", backendUnknownWarning: "An unrecognized service message was withheld.", backendUnknownProvenance: "The provenance message did not match a known authored message.",
      invalidResult: "The response is incomplete or does not match this case. Export has been locked for review.", inconsistentReady: "The gate label and check data disagree. Export is locked.", unsafeExport: "The summary still contains an original sensitive span or script. Export is locked.", unknownLive: "The live request outcome is unknown. This page will not resend it. Check the server-side request state first.",
      loadError: "The local preview is unavailable. Open the running service at 127.0.0.1, then reload. No external API was called.", requestError: "The local request did not complete or returned an invalid response. The handoff is locked.", requestTimeout: "The response timed out. The handoff is locked.", localOnlyError: "Use the local service at 127.0.0.1 only.",
      requests: (n) => n + " request" + (n === 1 ? "" : "s"), creditsUnknown: "Credits: not reported", credits: (n) => "Credits: " + n,
      cpOffset: (a, b) => "Characters " + a + "–" + b + " (Unicode code points)", endpointUnavailable: "This check did not complete.", zeroEntities: "No entity spans were reported.",
      cases: {
        routine: ["Routine service incident", "Keep incident facts; redact fictional contact details.", "LOW-RISK EXAMPLE"],
        injection: ["Untrusted instructions", "Ticket text asks to bypass approval and reveal secrets.", "INSTRUCTION BLOCK"],
        "unsafe-script": ["Unsafe recovery script", "An ordinary incident proposes disabling endpoint protection.", "SCRIPT BLOCK"],
        uncertain: ["Uncertain intent", "Incomplete language and intermediate scores need human judgment.", "REVIEW EXAMPLE"],
        unavailable: ["Provider unavailable", "An authored provider failure demonstrates a closed gate.", "FAIL-CLOSED EXAMPLE"]
      },
      entities: { person: "Person", email: "Email", phone: "Phone", address: "Address", bank_account: "Bank account" }
    }
  };
  // Only exact, authored backend messages are displayed. Never echo unknown provider text.
  const BACKEND_MESSAGES = new Map([
  [
    "Authored synthetic simulation, not recorded API data. No provider API requests were made.",
    {
      "zh": "人工編寫的合成模擬，並非錄製的 API 資料；未呼叫供應商 API。",
      "en": "Authored synthetic simulation, not recorded API data. No provider API requests were made."
    }
  ],
  [
    "Live mode requested for bundled synthetic input. No provider result has been accepted yet.",
    {
      "zh": "已為內建合成案例請求真實 API 模式；目前尚未取得通過驗證的供應商結果。",
      "en": "Live mode requested for bundled synthetic input. No provider result has been accepted yet."
    }
  ],
  [
    "Three live Clocked API responses were received and locally validated for bundled synthetic input. This is not a security guarantee.",
    {
      "zh": "已取得三個真實 Clocked API 回應，並以內建合成案例完成本機驗證；這不代表安全保證。",
      "en": "Three live Clocked API responses were received and locally validated for bundled synthetic input. This is not a security guarantee."
    }
  ],
  [
    "Analysis is incomplete; export is disabled.",
    {
      "zh": "檢查尚未完成，交接下載已停用。",
      "en": "Analysis is incomplete; export is disabled."
    }
  ],
  [
    "Bundled fictional examples only. This is a review aid, not a security guarantee.",
    {
      "zh": "僅使用內建虛構案例；此工具協助覆核，無法保證安全。",
      "en": "Bundled fictional examples only. This is a review aid, not a security guarantee."
    }
  ],
  [
    "Proposed scripts are displayed and classified only; they are never executed.",
    {
      "zh": "建議腳本只供顯示與分類，永不執行。",
      "en": "Proposed scripts are displayed and classified only; they are never executed."
    }
  ],
  [
    "Live mode is unavailable: configure the server-only API key after authorization.",
    {
      "zh": "真實 API 模式尚未啟用；須取得授權後，才可設定僅存於伺服器的金鑰。",
      "en": "Live mode is unavailable: configure the server-only API key after authorization."
    }
  ],
  [
    "A previous live request is active or has an unknown outcome. No automatic resend was made.",
    {
      "zh": "先前的真實請求仍在處理，或結果尚不確定；未自動重送。",
      "en": "A previous live request is active or has an unknown outcome. No automatic resend was made."
    }
  ],
  [
    "The authored simulation deliberately represents an unavailable provider; export stays disabled.",
    {
      "zh": "此人工合成案例刻意模擬供應商不可用；交接下載維持停用。",
      "en": "The authored simulation deliberately represents an unavailable provider; export stays disabled."
    }
  ],
  [
    "The provider request failed or its outcome is uncertain. Export stays disabled; no automatic retry was made.",
    {
      "zh": "供應商請求失敗或結果不確定；交接下載維持停用，未自動重試。",
      "en": "The provider request failed or its outcome is uncertain. Export stays disabled; no automatic retry was made."
    }
  ],
  [
    "The provider response did not pass strict redaction, span or score validation. Export stays disabled.",
    {
      "zh": "供應商回應未通過遮蔽、字元範圍或分數驗證；交接下載維持停用。",
      "en": "The provider response did not pass strict redaction, span or score validation. Export stays disabled."
    }
  ],
  [
    "Analysis could not complete safely. Export stays disabled; no automatic retry was made.",
    {
      "zh": "檢查無法安全完成；交接下載維持停用，未自動重試。",
      "en": "Analysis could not complete safely. Export stays disabled; no automatic retry was made."
    }
  ],
  [
    "An instruction or script was classified as harmful or scored at least 0.80. Do not act on the proposed recovery.",
    {
      "zh": "指令或腳本被判為有害，或分數達 0.80 以上；請勿採取建議的修復動作。",
      "en": "An instruction or script was classified as harmful or scored at least 0.80. Do not act on the proposed recovery."
    }
  ],
  [
    "Redaction and evidence spans validated; all three scores are at most 0.15 with benign verdicts. A person remains responsible for the handoff.",
    {
      "zh": "遮蔽與證據範圍已驗證；三項分數均不高於 0.15，且判定為良性。交接仍由人員負責。",
      "en": "Redaction and evidence spans validated; all three scores are at most 0.15 with benign verdicts. A person remains responsible for the handoff."
    }
  ],
  [
    "The scores or verdicts do not meet the conservative release threshold. Human review is required.",
    {
      "zh": "分數或判定未達保守放行門檻，需要人工覆核。",
      "en": "The scores or verdicts do not meet the conservative release threshold. Human review is required."
    }
  ]
]);
  const backendMessage = (value, fallbackKey) => {
    const known = typeof value === "string" ? BACKEND_MESSAGES.get(value) : null;
    return known ? known[state.lang] : t(fallbackKey);
  };

  const state = { lang: "zh", mode: "replay", caseId: "routine", cases: [], connected: false, liveAvailable: false, liveLocked: false, busy: false, view: null, result: null, errorKey: null, requestSerial: 0 };
  const t = (key, ...args) => typeof COPY[state.lang][key] === "function" ? COPY[state.lang][key](...args) : COPY[state.lang][key] || key;
  const text = (id, value) => { $(id).textContent = value; };
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const isScore = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
  const finiteInt = (value, low, high) => Number.isInteger(value) && value >= low && value <= high;
  const points = (value) => Array.from(value);
  const validSpan = (span, source) => isObject(span) && typeof source === "string" && finiteInt(span.start, 0, points(source).length) && finiteInt(span.end, 0, points(source).length) && span.end > span.start;
  const benignVerdict = (value) => typeof value === "string" && ["benign", "safe", "clean", "harmless", "no_injection", "not_injected", "non-malicious", "not_malicious"].includes(value.trim().toLowerCase());
  const harmfulVerdict = (value) => typeof value === "string" && ["malicious", "harmful", "unsafe", "injection", "injected", "blocked", "dangerous"].includes(value.trim().toLowerCase());
  const strings = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 20) : [];
  const percentage = (value) => isScore(value) ? new Intl.NumberFormat(state.lang === "zh" ? "zh-TW" : "en", { style: "percent", maximumFractionDigits: 1 }).format(value) : "—";

  async function request(path, options = {}, timeout = 8000) {
    if (window.location.hostname !== "127.0.0.1") throw new Error("localOnlyError");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(path, { cache: "no-store", credentials: "same-origin", redirect: "error", ...options, signal: controller.signal });
      if (!response.ok) throw new Error("requestError");
      const type = response.headers.get("content-type") || "";
      if (!type.toLowerCase().includes("application/json")) throw new Error("requestError");
      return await response.json();
    } catch (error) {
      if (error && error.name === "AbortError") throw new Error("requestTimeout");
      if (error && ["requestError", "localOnlyError"].includes(error.message)) throw error;
      throw new Error("requestError");
    } finally { window.clearTimeout(timer); }
  }

  function assess(view, expectedCase, expectedMode) {
    const issues = [];
    if (!isObject(view)) return { status: "review", canExport: false, issues: ["invalidResult"], piiValid: false, findings: [] };
    const input = isObject(view.input) ? view.input : {};
    const inputValid = typeof input.text === "string" && typeof input.script === "string" && typeof input.scope === "string";
    const gate = isObject(view.gate) ? view.gate : {};
    const findings = Array.isArray(view.findings) ? view.findings : [];
    const findingsValid = Array.isArray(view.findings) && inputValid && findings.every((item) => validSpan(item, input.text) && typeof item.kind === "string" && isScore(item.confidence));
    const piiValid = inputValid && findingsValid && typeof view.redactedText === "string" && view.redactedText.trim().length > 0 && findings.every((item) => !view.redactedText.includes(points(input.text).slice(item.start, item.end).join("")));
    const guard = isObject(view.guard) ? view.guard : {};
    const inspect = isObject(view.inspect) ? view.inspect : {};
    const guardEvidenceValid = Array.isArray(guard.evidence) && guard.evidence.every((item) => validSpan(item, view.redactedText) && typeof item.quote === "string" && points(view.redactedText).slice(item.start, item.end).join("") === item.quote);
    const inspectEvidenceValid = Array.isArray(inspect.evidence) && inspect.evidence.every((item) => validSpan(item, input.script) && typeof item.line === "string" && points(input.script).slice(item.start, item.end).join("") === item.line);
    const guardValid = isScore(guard.score) && typeof guard.verdict === "string" && guardEvidenceValid;
    const inspectValid = isScore(inspect.malicious) && isScore(inspect.suspicious) && typeof inspect.verdict === "string" && inspectEvidenceValid;
    const identityValid = view.caseId === expectedCase && view.mode === expectedMode && typeof view.provenance === "string" && view.provenance.trim().length > 0;
    const gateValid = ["ready", "review", "blocked"].includes(gate.status) && Array.isArray(gate.reasons) && gate.reasons.every((reason) => typeof reason === "string") && typeof gate.exportAllowed === "boolean";
    if (!identityValid || !inputValid || !gateValid || !findingsValid) issues.push("invalidResult");
    let status = gate.status === "blocked" ? "blocked" : "review";
    const harmful = [guard.score, inspect.malicious, inspect.suspicious].some((value) => isScore(value) && value >= 0.8) || harmfulVerdict(guard.verdict) || harmfulVerdict(inspect.verdict);
    if (harmful) status = "blocked";
    const allLow = guardValid && inspectValid && guard.score <= 0.15 && inspect.malicious <= 0.15 && inspect.suspicious <= 0.15 && benignVerdict(guard.verdict) && benignVerdict(inspect.verdict);
    const complete = identityValid && inputValid && gateValid && piiValid && allLow && !view.error;
    if (gate.status === "ready" && complete && gate.exportAllowed === true && typeof view.shareText === "string" && view.shareText.trim().length > 0 && !harmful) status = "ready";
    else if (gate.status === "ready") issues.push("inconsistentReady");
    let canExport = status === "ready";
    if (canExport) {
      const originalPoints = points(input.text);
      const leaked = findings.some((item) => view.shareText.includes(originalPoints.slice(item.start, item.end).join("")));
      const script = input.script.trim();
      if (leaked || (script && view.shareText.includes(script))) {
        status = "review"; canExport = false; issues.push("unsafeExport");
      }
    }
    return { status, canExport, issues: Array.from(new Set(issues)), piiValid, findings: findingsValid ? findings : [], guardValid, inspectValid };
  }

  function renderCases() {
    const list = $("case-list");
    list.replaceChildren();
    const allowed = new Set(state.cases.map((item) => item.id));
    CASE_ORDER.forEach((id, index) => {
      const copy = COPY[state.lang].cases[id];
      const button = document.createElement("button");
      button.type = "button"; button.className = "case-button";
      button.setAttribute("aria-pressed", String(state.caseId === id));
      button.disabled = state.busy || !allowed.has(id);
      const number = document.createElement("span"); number.className = "case-number"; number.textContent = String(index + 1).padStart(2, "0");
      const body = document.createElement("span");
      const title = document.createElement("span"); title.className = "case-title"; title.textContent = copy[0];
      const description = document.createElement("span"); description.className = "case-description"; description.textContent = copy[1];
      const outcome = document.createElement("span"); outcome.className = "case-outcome"; outcome.textContent = copy[2];
      body.append(title, description, outcome); button.append(number, body);
      button.addEventListener("click", () => { if (state.busy) return; state.caseId = id; clearResult(); render(); });
      list.append(button);
    });
  }

  function renderMode() {
    const live = state.mode === "live";
    $("mode-replay").setAttribute("aria-pressed", String(!live));
    $("mode-live").setAttribute("aria-pressed", String(live));
    $("mode-replay").disabled = state.busy;
    $("mode-live").disabled = state.busy || !state.connected || !state.liveAvailable || state.liveLocked;
    $("live-consent-wrap").hidden = !live;
    $("live-consent").disabled = state.busy || state.liveLocked;
    $("mode-notice").classList.toggle("is-live", live);
    text("mode-notice-title", t(live ? "liveNoticeTitle" : "replayNoticeTitle"));
    text("mode-notice-copy", t(live ? "liveNotice" : "replayNotice"));
    text("mode-tag", live ? "LIVE API" : "AUTHORED REPLAY");
    text("live-caption", t(state.liveLocked ? "liveLocked" : state.liveAvailable ? "liveAvailable" : "notEnabled"));
    text("mode-help", t(state.liveLocked ? "liveLockedHelp" : live ? "liveHelp" : state.liveAvailable ? "replayHelp" : "liveUnavailable"));
    text("connection-status", t(state.connected ? "connected" : state.errorKey === "loadError" ? "disconnected" : "checking"));
    $("connection-status").className = "connection-pill" + (state.connected ? " is-connected" : state.errorKey ? " is-error" : "");
    const caseCopy = COPY[state.lang].cases[state.caseId];
    text("selected-summary", t("selected") + caseCopy[0] + " · " + caseCopy[1]);
    text("analyze-label", t(state.busy ? "analyzing" : live ? "inspectLive" : "inspect"));
    $("analyze-button").disabled = state.busy || !state.connected || !state.cases.some((item) => item.id === state.caseId) || (live && (!state.liveAvailable || state.liveLocked || !$("live-consent").checked));
    $("working-status").hidden = !state.busy;
    text("working-copy", t(live ? "liveWorking" : "replayWorking"));
    $("request-error").hidden = !state.errorKey;
    text("request-error", state.errorKey ? t(state.errorKey) + (state.liveLocked && state.errorKey !== "unknownLive" ? " " + t("unknownLive") : "") : "");
    document.body.classList.toggle("is-busy", state.busy);
  }

  function setEndpoint(prefix, status, value, description) {
    $(prefix + "-card").className = "endpoint-card" + (status ? " is-" + status : "");
    text(prefix + "-state", t(status === "ready" ? "clear" : status === "blocked" ? "blocked" : status === "review" ? "needsReview" : "pending"));
    text(prefix + "-value", value);
    text(prefix + "-description", description);
  }

  function renderHighlighted(target, source, spans) {
    target.replaceChildren();
    const chars = points(source);
    // Offsets are Unicode code points, not UTF-16 code units. Merge overlaps.
    const merged = [];
    spans.filter((span) => validSpan(span, source)).map((span) => ({ start: span.start, end: span.end, kinds: [span.kind] })).sort((a, b) => a.start - b.start || a.end - b.end).forEach((span) => {
      const previous = merged[merged.length - 1];
      if (previous && span.start < previous.end) { previous.end = Math.max(previous.end, span.end); previous.kinds.push(...span.kinds); }
      else merged.push(span);
    });
    let cursor = 0;
    merged.forEach((span) => {
      if (span.start > cursor) { const before = document.createElement("span"); before.textContent = chars.slice(cursor, span.start).join(""); target.append(before); }
      const mark = document.createElement("mark"); mark.textContent = chars.slice(span.start, span.end).join("");
      mark.title = span.kinds.map((kind) => COPY[state.lang].entities[kind] || kind).join(", "); target.append(mark); cursor = span.end;
    });
    if (cursor < chars.length) { const after = document.createElement("span"); after.textContent = chars.slice(cursor).join(""); target.append(after); }
  }

  function renderEvidence(id, items, source, field) {
    const list = $(id); list.replaceChildren();
    const valid = Array.isArray(items) ? items.filter((item) => validSpan(item, source) && typeof item[field] === "string" && points(source).slice(item.start, item.end).join("") === item[field]).slice(0, 20) : [];
    if (!valid.length) { const li = document.createElement("li"); li.textContent = t("noEvidence"); list.append(li); return; }
    valid.forEach((item) => { const li = document.createElement("li"); const label = document.createElement("small"); label.textContent = t("cpOffset", item.start, item.end); const quote = document.createElement("span"); quote.textContent = item[field]; li.append(label, quote); list.append(li); });
  }

  function renderList(id, values) {
    const list = $(id); list.replaceChildren(); list.hidden = values.length === 0;
    values.forEach((value) => { const li = document.createElement("li"); li.textContent = value; list.append(li); });
  }

  function renderResult() {
    const view = state.view;
    const result = state.result;
    let status = result ? result.status : state.errorKey && state.errorKey !== "loadError" ? "review" : "idle";
    $("gate-banner").className = "gate-banner gate-" + status;
    text("gate-icon", status === "ready" ? "✓" : status === "blocked" ? "×" : status === "review" ? "!" : "—");
    text("gate-kicker", status === "ready" ? "READY TO HAND OFF" : status === "blocked" ? "HANDOFF BLOCKED" : status === "review" ? "HUMAN REVIEW REQUIRED" : "AWAITING REVIEW");
    text("gate-title", t(status + "Title")); text("gate-description", t(status + "Description"));
    $("download-button").hidden = !result || !result.canExport || state.busy;
    $("result-mode-tag").hidden = !view; text("result-mode-tag", t(view && view.mode === "live" ? "liveResult" : "replayResult"));
    if (!view || !result) {
      ["pii", "guard", "inspect"].forEach((name) => setEndpoint(name, null, "—", t(name === "pii" ? "privacyIdle" : name === "guard" ? "guardIdle" : "scriptIdle")));
      text("original-text", t("noInput")); text("redacted-text", t("noRedaction"));
      $("original-text").className = "case-text empty-text"; $("redacted-text").className = "case-text empty-text";
      text("redacted-label", t("notYet")); text("scope-text", "—"); text("script-text", "—");
      $("finding-row").replaceChildren(); $("finding-row").hidden = true;
      renderList("reason-list", []); renderList("warning-list", []); $("result-meta").hidden = true;
      renderEvidence("guard-evidence", [], "", "quote"); renderEvidence("inspect-evidence", [], "", "line"); return;
    }
    const input = isObject(view.input) ? view.input : {};
    const guard = isObject(view.guard) ? view.guard : {};
    const inspect = isObject(view.inspect) ? view.inspect : {};
    const guardStatus = result.guardValid ? guard.score >= 0.8 || harmfulVerdict(guard.verdict) ? "blocked" : guard.score <= 0.15 && benignVerdict(guard.verdict) ? "ready" : "review" : "review";
    const inspectStatus = result.inspectValid ? Math.max(inspect.malicious, inspect.suspicious) >= 0.8 || harmfulVerdict(inspect.verdict) ? "blocked" : Math.max(inspect.malicious, inspect.suspicious) <= 0.15 && benignVerdict(inspect.verdict) ? "ready" : "review" : "review";
    setEndpoint("pii", result.piiValid ? "ready" : "review", result.piiValid ? t("piiCount", result.findings.length) : "—", t(result.piiValid ? "piiDescription" : "piiMissing"));
    setEndpoint("guard", guardStatus, percentage(guard.score), t(result.guardValid ? "guardDescription" : "endpointUnavailable"));
    setEndpoint("inspect", inspectStatus, isScore(inspect.malicious) && isScore(inspect.suspicious) ? percentage(Math.max(inspect.malicious, inspect.suspicious)) : "—", result.inspectValid ? t("inspectDescription", percentage(inspect.malicious), percentage(inspect.suspicious)) : t("endpointUnavailable"));
    if (typeof input.text === "string") { renderHighlighted($("original-text"), input.text, result.findings); $("original-text").className = "case-text"; }
    else { text("original-text", t("noInput")); $("original-text").className = "case-text empty-text"; }
    text("redacted-text", result.piiValid ? view.redactedText : t("unavailableRedaction"));
    $("redacted-text").className = "case-text" + (result.piiValid ? "" : " empty-text"); text("redacted-label", t(result.piiValid ? "transformed" : "noResponse"));
    text("scope-text", typeof input.scope === "string" && input.scope ? input.scope : t("noScope")); text("script-text", typeof input.script === "string" ? input.script : "—");
    const counts = new Map(); result.findings.forEach((item) => counts.set(item.kind, (counts.get(item.kind) || 0) + 1));
    $("finding-row").replaceChildren(); $("finding-row").hidden = counts.size === 0;
    counts.forEach((count, kind) => { const chip = document.createElement("span"); chip.className = "finding-chip"; chip.textContent = (COPY[state.lang].entities[kind] || kind) + " × " + count; $("finding-row").append(chip); });
    renderList("reason-list", [...strings(view.gate && view.gate.reasons).map((message) => backendMessage(message, "backendUnknownReason")), ...result.issues.map((key) => t(key))]);
    renderList("warning-list", [...strings(view.warnings).map((message) => backendMessage(message, "backendUnknownWarning")), ...(view.error ? [backendMessage(view.error, "providerFailure")] : [])]);
    $("result-meta").hidden = false;
    text("provenance", t(view.mode === "live" ? "liveResult" : "replayResult") + " · " + backendMessage(view.provenance, "backendUnknownProvenance"));
    const usage = isObject(view.usage) ? view.usage : {};
    text("usage", (finiteInt(usage.requests, 0, 3) ? t("requests", usage.requests) : t("noResponse")) + " · " + (typeof usage.credits === "number" && Number.isFinite(usage.credits) && usage.credits >= 0 ? t("credits", usage.credits) : t("creditsUnknown")));
    renderEvidence("guard-evidence", guard.evidence, typeof view.redactedText === "string" ? view.redactedText : "", "quote");
    renderEvidence("inspect-evidence", inspect.evidence, typeof input.script === "string" ? input.script : "", "line");
  }

  function render() {
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
    document.title = state.lang === "zh" ? "交接閘門 · Handoff Gate" : "Handoff Gate · Synthetic review workbench";
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    $("lang-zh").setAttribute("aria-pressed", String(state.lang === "zh")); $("lang-en").setAttribute("aria-pressed", String(state.lang === "en"));
    renderCases(); renderMode(); renderResult();
  }

  function clearResult() { state.view = null; state.result = null; state.errorKey = null; $("evidence-details").open = false; }
  function chooseMode(mode) {
    if (state.busy || (mode === "live" && (!state.liveAvailable || state.liveLocked))) return;
    state.mode = mode; $("live-consent").checked = false; clearResult(); render();
  }

  async function analyze() {
    if (state.busy || !state.connected || (state.mode === "live" && (!state.liveAvailable || state.liveLocked || !$("live-consent").checked))) return;
    const caseId = state.caseId, mode = state.mode, serial = ++state.requestSerial;
    clearResult(); state.busy = true; render();
    try {
      const view = await request("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId, mode }) }, mode === "live" ? 370000 : 10000);
      if (serial !== state.requestSerial) return;
      state.view = isObject(view) ? view : {};
      state.result = assess(state.view, caseId, mode);
      // A safely structured provider failure is still a known review result.
      // A mismatched/malformed live envelope could hide a completed remote call.
      if (mode === "live" && (state.view.caseId !== caseId || state.view.mode !== mode || typeof state.view.provenance !== "string")) { state.liveLocked = true; state.errorKey = "unknownLive"; }
    } catch (error) {
      if (serial !== state.requestSerial) return;
      state.errorKey = error && ["requestTimeout", "localOnlyError"].includes(error.message) ? error.message : "requestError";
      if (mode === "live") state.liveLocked = true;
    } finally {
      if (serial === state.requestSerial) { state.busy = false; render(); }
    }
  }

  function download() {
    if (state.busy || !state.view || !state.result || !state.result.canExport) return;
    // Re-assess immediately before download; never export raw input or API objects.
    const result = assess(state.view, state.caseId, state.mode);
    if (!result.canExport) { state.result = result; render(); return; }
    const blob = new Blob([state.view.shareText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "handoff-gate-" + state.caseId + "-sanitized.txt"; link.hidden = true;
    document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function initialize() {
    render();
    try {
      const [health, data] = await Promise.all([request("/api/health"), request("/api/cases")]);
      if (!isObject(health) || health.project !== "Handoff Gate" || health.mode !== "synthetic-only" || typeof health.liveAvailable !== "boolean" || !isObject(data) || !Array.isArray(data.cases)) throw new Error("loadError");
      const cases = data.cases.filter((item) => isObject(item) && CASE_ORDER.includes(item.id) && typeof item.title === "string" && typeof item.summary === "string");
      if (cases.length !== CASE_ORDER.length || new Set(cases.map((item) => item.id)).size !== CASE_ORDER.length) throw new Error("loadError");
      state.cases = cases; state.connected = true; state.liveAvailable = health.liveAvailable; state.errorKey = null;
    } catch (_) { state.connected = false; state.liveAvailable = false; state.errorKey = "loadError"; }
    render();
  }

  $("lang-zh").addEventListener("click", () => { state.lang = "zh"; render(); });
  $("lang-en").addEventListener("click", () => { state.lang = "en"; render(); });
  $("mode-replay").addEventListener("click", () => chooseMode("replay"));
  $("mode-live").addEventListener("click", () => chooseMode("live"));
  $("live-consent").addEventListener("change", renderMode);
  $("analyze-button").addEventListener("click", analyze);
  $("download-button").addEventListener("click", download);
  initialize();
})();
