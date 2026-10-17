(function () {
  "use strict";

  var M = window.VocabMain;
  if (!M) { console.error("practice.js: VocabMain not available"); return; }

  var t = M.t;
  var esc = M.esc;
  var uid = M.uid;
  var toast = M.toast;

  var setup = { mode: "bn_en", count: 10, source: "all", rangeFrom: null, rangeTo: null };

  var session = null;
  var timerHandle = null;
  var idleHandle = null;
  var showDetails = false;
  var hintVisible = false;

  var IDLE_MS = 2 * 60 * 1000;

  function getActiveWords() { return M.words.filter(function (w) { return !w.deleted; }); }

  function getSourceWords() {
    var pool = getActiveWords();
    if (setup.source === "new") pool = pool.filter(function (w) { return !w.practiced; });
    else if (setup.source === "wrong") pool = pool.filter(function (w) { return w.wrongCount && w.wrongCount > 0; });
    else if (setup.source === "due") pool = pool.filter(function (w) { return M.isDueToday(w.id); });
    else if (setup.source === "range") {
      var from = setup.rangeFrom || 1;
      var to = setup.rangeTo || 99999;
      pool = pool.filter(function (w) { return w.no >= from && w.no <= to; });
    }
    return pool;
  }

  function getRangeButtons() {
    var active = getActiveWords();
    if (!active.length) return [];
    var maxNo = active.reduce(function (a, w) { return Math.max(a, w.no || 0); }, 0);
    if (maxNo < 1) return [];
    var buttons = [];
    var step = 20;
    for (var start = 1; start <= maxNo; start += step) {
      var end = Math.min(start + step - 1, maxNo);
      buttons.push({ from: start, to: end, label: start + "-" + end });
    }
    return buttons;
  }

  function fmtTime(ms) {
    var total = Math.floor(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function renderSetup() {
    var total = getActiveWords().length;
    var notEnough = total < 4;
    var sourceWords = getSourceWords();
    var dueCount = getActiveWords().filter(function (w) { return M.isDueToday(w.id); }).length;

    var h = '<section class="view">';
    h += '<div class="practice-setup">';

    h += '<div class="setup-section">';
    h += '<p class="setup-label">' + t("mode") + '</p>';
    h += '<div class="setup-options">';
    h += '<button type="button" class="opt-btn' + (setup.mode === "bn_en" ? " on" : "") + '" data-set="mode" data-val="bn_en">' + t("mode_bn_en") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.mode === "en_bn" ? " on" : "") + '" data-set="mode" data-val="en_bn">' + t("mode_en_bn") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.mode === "fill" ? " on" : "") + '" data-set="mode" data-val="fill">' + t("mode_fill") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.mode === "quiz" ? " on" : "") + '" data-set="mode" data-val="quiz">' + t("mode_quiz") + '</button>';
    h += '</div></div>';

    h += '<div class="setup-section">';
    h += '<p class="setup-label">' + t("questionCount") + '</p>';
    h += '<div class="setup-options">';
    [5, 10, 20].forEach(function (n) {
      h += '<button type="button" class="opt-btn' + (setup.count === n ? " on" : "") + '" data-set="count" data-val="' + n + '">' + n + '</button>';
    });
    h += '</div></div>';

    h += '<div class="setup-section">';
    h += '<p class="setup-label">' + t("wordSource") + '</p>';
    h += '<div class="setup-options">';
    h += '<button type="button" class="opt-btn' + (setup.source === "all" ? " on" : "") + '" data-set="source" data-val="all">' + t("source_all") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.source === "new" ? " on" : "") + '" data-set="source" data-val="new">' + t("source_new") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.source === "wrong" ? " on" : "") + '" data-set="source" data-val="wrong">' + t("source_wrong") + '</button>';
    if (dueCount > 0) h += '<button type="button" class="opt-btn' + (setup.source === "due" ? " on" : "") + '" data-set="source" data-val="due">' + t("source_due") + ' (' + dueCount + ')</button>';
    h += '<button type="button" class="opt-btn' + (setup.source === "range" ? " on" : "") + '" data-set="source" data-val="range">' + t("source_range") + '</button>';
    h += '</div>';

    if (setup.source === "range") {
      var rangeBtns = getRangeButtons();
      h += '<div style="margin-top:12px">';
      h += '<p class="setup-label" style="margin-bottom:8px">' + t("rangeLabel") + '</p>';
      h += '<div class="setup-options">';
      rangeBtns.forEach(function (r) {
        var on = setup.rangeFrom === r.from && setup.rangeTo === r.to;
        h += '<button type="button" class="opt-btn' + (on ? " on" : "") + '" data-range-from="' + r.from + '" data-range-to="' + r.to + '">' + r.label + '</button>';
      });
      h += '</div>';
      h += '<div style="display:flex;gap:10px;margin-top:12px">';
      h += '<div style="flex:1"><label style="display:block;font-size:0.75rem;color:var(--text-muted);margin-bottom:4px">' + t("rangeFrom") + '</label>';
      h += '<input id="range-from" type="number" min="1" value="' + (setup.rangeFrom || 1) + '" class="answer-input" style="text-align:center;padding:10px 12px;font-size:1rem"></div>';
      h += '<div style="flex:1"><label style="display:block;font-size:0.75rem;color:var(--text-muted);margin-bottom:4px">' + t("rangeTo") + '</label>';
      h += '<input id="range-to" type="number" min="1" value="' + (setup.rangeTo || 20) + '" class="answer-input" style="text-align:center;padding:10px 12px;font-size:1rem"></div>';
      h += '</div>';
      h += '<p style="font-size:0.85rem;color:var(--text-muted);margin:10px 0 0;text-align:center">' + sourceWords.length + ' ' + t("rangeWordsFound") + '</p>';
      h += '</div>';
    }

    h += '</div>';
    h += '<button type="button" class="practice-start" ' + (notEnough ? "disabled" : "") + ' data-act="practice-start">' + t("startPractice") + '</button>';
    if (notEnough) h += '<p class="muted center" style="margin-top:12px">' + t("practiceNoWords") + '</p>';

    h += '</div></section>';

    M.getAppEl().innerHTML = h;
    M.setTitle(t("practice"));
    M.setActiveNav("practice");
    M.showFab(false);
    M.showBack(false);

    var fromInp = document.getElementById("range-from");
    var toInp = document.getElementById("range-to");
    if (fromInp) {
      fromInp.addEventListener("input", function () { setup.rangeFrom = parseInt(fromInp.value, 10) || 1; });
      fromInp.addEventListener("change", function () {
        setup.rangeFrom = parseInt(fromInp.value, 10) || 1;
        if (setup.rangeTo && setup.rangeFrom > setup.rangeTo) setup.rangeTo = setup.rangeFrom;
        renderSetup();
      });
    }
    if (toInp) {
      toInp.addEventListener("input", function () { setup.rangeTo = parseInt(toInp.value, 10) || 1; });
      toInp.addEventListener("change", function () {
        setup.rangeTo = parseInt(toInp.value, 10) || 1;
        if (setup.rangeFrom && setup.rangeTo < setup.rangeFrom) setup.rangeFrom = setup.rangeTo;
        renderSetup();
      });
    }
  }

  async function startSession(customQuestions) {
    var pool;
    if (customQuestions && customQuestions.length) pool = customQuestions;
    else pool = getSourceWords();
    if (pool.length < 1) { toast(t("notEnoughWords")); return; }

    var picked = customQuestions ? pool.slice() : pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, Math.min(setup.count, pool.length));

    var sentences = null;
    if (setup.mode === "fill") sentences = await fetchBatchSentences(picked);

    var now = Date.now();
    session = {
      mode: setup.mode,
      questions: picked,
      sentences: sentences || {},
      current: 0,
      answers: [],
      answered: false,
      userAnswer: "",
      startedAt: now,
      questionStartAt: now,
      elapsedMs: 0,
      paused: false,
      pauseStartedAt: 0,
      totalPausedMs: 0
    };

    showDetails = false;
    hintVisible = false;
    startTimer();
    renderQuestion();
  }

  async function fetchBatchSentences(words) {
    if (!window.VocabAI || !window.VocabAI.batchSentences) return {};
    M.getAppEl().innerHTML = '<section class="view"><div class="empty"><div class="skeleton" style="height:80px;margin-bottom:10px"></div><div class="skeleton" style="height:80px;margin-bottom:10px"></div><p class="title" style="margin-top:20px">' + t("aiGeneratingSentences") + '</p><p>' + t("aiPleaseWait") + '</p></div></section>';
    M.setTitle(t("practice"));

    var result = await window.VocabAI.batchSentences(words);
    var map = {};
    if (result.ok && result.data && Array.isArray(result.data.sentences)) {
      result.data.sentences.forEach(function (s, idx) {
        var w = words[parseInt(s.id, 10) - 1] || words[idx];
        if (!w) return;
        map[w.id] = { sentence: s.sentence || "", blanked: s.blanked || s.sentence || "" };
      });
    }
    words.forEach(function (w) {
      if (!map[w.id]) {
        map[w.id] = {
          sentence: "The word \"___\" means " + (w.bn || []).join(", ") + ".",
          blanked: "The word \"_____\" means " + (w.bn || []).join(", ") + ".",
          isFallback: true
        };
      }
    });
    return map;
  }

  function startTimer() {
    stopTimer();
    if (!session) return;
    session.lastTickAt = Date.now();
    timerHandle = setInterval(function () {
      if (!session || session.paused) return;
      var now = Date.now();
      var delta = now - session.lastTickAt;
      session.lastTickAt = now;
      session.elapsedMs += delta;
      updateTimerDisplay();
    }, 250);
    resetIdle();
  }

  function stopTimer() {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    if (idleHandle) { clearTimeout(idleHandle); idleHandle = null; }
  }

  function resetIdle() {
    if (idleHandle) clearTimeout(idleHandle);
    idleHandle = setTimeout(function () {
      if (session && !session.paused && !session.answered) doPause(true);
    }, IDLE_MS);
  }

  function updateTimerDisplay() {
    var el = document.getElementById("timer");
    if (el && session) el.textContent = fmtTime(session.elapsedMs);
  }

  function doPause(auto) {
    if (!session || session.paused || session.answered) return;
    session.paused = true;
    session.pauseStartedAt = Date.now();
    toast(auto ? t("pausedAuto") : t("paused"));
    renderQuestion();
  }

  function doResume() {
    if (!session || !session.paused) return;
    session.totalPausedMs += Date.now() - session.pauseStartedAt;
    session.paused = false;
    session.pauseStartedAt = 0;
    session.lastTickAt = Date.now();
    resetIdle();
    toast(t("resumed"));
    renderQuestion();
  }

  function currentWord() { return session.questions[session.current]; }
  function normalize(s) { return String(s || "").trim().toLowerCase().replace(/\s+/g, " "); }

  function checkAnswer(word, userInput) {
    var user = normalize(userInput);
    if (!user) return false;
    if (session.mode === "bn_en" || session.mode === "fill") return normalize(word.en) === user;
    var userParts = user.split(/[,;،]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    for (var i = 0; i < userParts.length; i++) {
      var up = userParts[i];
      for (var j = 0; j < word.bn.length; j++) {
        var wp = normalize(word.bn[j]);
        if (wp === up) return true;
        if (wp.indexOf(up) > -1 && up.length >= 2) return true;
      }
    }
    return word.bn.map(normalize).join(", ") === user;
  }

  function getCorrectAnswerText(word) {
    if (session.mode === "en_bn") return word.bn.join(", ");
    return word.en;
  }

  function getQuestionText(word) {
    if (session.mode === "bn_en") return word.bn.join(", ");
    if (session.mode === "en_bn") return word.en;
    var s = session.sentences[word.id];
    if (s && s.blanked) return s.blanked;
    return "The word \"_____\" means " + (word.bn || []).join(", ") + ".";
  }

  function getQuestionLabel() {
    if (session.mode === "bn_en") return "বাংলা";
    if (session.mode === "en_bn") return "English";
    return t("fillInBlank");
  }
