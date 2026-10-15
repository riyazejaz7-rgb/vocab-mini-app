(function () {
  "use strict";

  var M = window.VocabMain;
  if (!M) { console.error("practice.js: VocabMain not available"); return; }

  var t = M.t;
  var esc = M.esc;
  var uid = M.uid;
  var toast = M.toast;

  var setup = {
    mode: "bn_en",
    count: 10,
    source: "all",
    rangeFrom: null,
    rangeTo: null
  };

  var session = null;
  var timerHandle = null;
  var idleHandle = null;
  var showDetails = false;

  var IDLE_MS = 2 * 60 * 1000;

  function getActiveWords() {
    return M.words.filter(function (w) { return !w.deleted; });
  }

  function getSourceWords() {
    var pool = getActiveWords();
    if (setup.source === "new") {
      pool = pool.filter(function (w) { return !w.practiced; });
    } else if (setup.source === "wrong") {
      pool = pool.filter(function (w) { return w.wrongCount && w.wrongCount > 0; });
    } else if (setup.source === "range") {
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

    var h = '<section class="view">';
    h += '<div class="practice-setup">';

    h += '<div class="setup-section">';
    h += '<p class="setup-label">' + t("mode") + '</p>';
    h += '<div class="setup-options">';
    h += '<button type="button" class="opt-btn' + (setup.mode === "bn_en" ? " on" : "") + '" data-set="mode" data-val="bn_en">' + t("mode_bn_en") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.mode === "en_bn" ? " on" : "") + '" data-set="mode" data-val="en_bn">' + t("mode_en_bn") + '</button>';
    h += '</div>';
    h += '</div>';

    h += '<div class="setup-section">';
    h += '<p class="setup-label">' + t("questionCount") + '</p>';
    h += '<div class="setup-options">';
    [5, 10, 20].forEach(function (n) {
      h += '<button type="button" class="opt-btn' + (setup.count === n ? " on" : "") + '" data-set="count" data-val="' + n + '">' + n + '</button>';
    });
    h += '</div>';
    h += '</div>';

    h += '<div class="setup-section">';
    h += '<p class="setup-label">' + t("wordSource") + '</p>';
    h += '<div class="setup-options">';
    h += '<button type="button" class="opt-btn' + (setup.source === "all" ? " on" : "") + '" data-set="source" data-val="all">' + t("source_all") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.source === "new" ? " on" : "") + '" data-set="source" data-val="new">' + t("source_new") + '</button>';
    h += '<button type="button" class="opt-btn' + (setup.source === "wrong" ? " on" : "") + '" data-set="source" data-val="wrong">' + t("source_wrong") + '</button>';
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

    if (notEnough) {
      h += '<p class="muted center" style="margin-top:12px">' + t("practiceNoWords") + '</p>';
    }

    h += '</div>';
    h += '</section>';

    M.getAppEl().innerHTML = h;
    M.setTitle(t("practice"));
    M.setActiveNav("practice");
    M.showFab(false);
    M.showBack(false);

    var fromInp = document.getElementById("range-from");
    var toInp = document.getElementById("range-to");
    if (fromInp) {
      fromInp.addEventListener("input", function () {
        setup.rangeFrom = parseInt(fromInp.value, 10) || 1;
      });
      fromInp.addEventListener("change", function () {
        setup.rangeFrom = parseInt(fromInp.value, 10) || 1;
        if (setup.rangeTo && setup.rangeFrom > setup.rangeTo) setup.rangeTo = setup.rangeFrom;
        renderSetup();
      });
    }
    if (toInp) {
      toInp.addEventListener("input", function () {
        setup.rangeTo = parseInt(toInp.value, 10) || 1;
      });
      toInp.addEventListener("change", function () {
        setup.rangeTo = parseInt(toInp.value, 10) || 1;
        if (setup.rangeFrom && setup.rangeTo < setup.rangeFrom) setup.rangeFrom = setup.rangeTo;
        renderSetup();
      });
    }
  }

  function startSession(customQuestions) {
    var pool;
    if (customQuestions && customQuestions.length) {
      pool = customQuestions;
    } else {
      pool = getSourceWords();
    }
    if (pool.length < 1) { toast(t("notEnoughWords")); return; }

    var picked = customQuestions ? pool.slice() : pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, Math.min(setup.count, pool.length));
    var now = Date.now();

    session = {
      mode: setup.mode,
      questions: picked,
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
    startTimer();
    renderQuestion();
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
      if (session && !session.paused && !session.answered) {
        doPause(true);
      }
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
    if (auto) toast(t("pausedAuto"));
    else toast(t("paused"));
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

  function currentWord() {
    return session.questions[session.current];
  }

  function normalize(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function checkAnswer(word, userInput) {
    var user = normalize(userInput);
    if (!user) return false;

    if (session.mode === "bn_en") {
      return normalize(word.en) === user;
    } else {
      var userParts = user.split(/[,;،]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      for (var i = 0; i < userParts.length; i++) {
        var up = userParts[i];
        for (var j = 0; j < word.bn.length; j++) {
          var wp = normalize(word.bn[j]);
          if (wp === up) return true;
          if (wp.indexOf(up) > -1 && up.length >= 2) return true;
        }
      }
      var joined = word.bn.map(normalize).join(", ");
      if (joined === user) return true;
      return false;
    }
  }

  function getCorrectAnswerText(word) {
    if (session.mode === "bn_en") return word.en;
    return word.bn.join(", ");
  }

  function getQuestionText(word) {
    if (session.mode === "bn_en") return word.bn.join(", ");
    return word.en;
  }

  function getQuestionLabel() {
    return session.mode === "bn_en" ? "বাংলা" : "English";
  }

  function renderQuestion() {
    var word = currentWord();
    if (!word) return finishSession();

    var total = session.questions.length;
    var n = session.current + 1;
    var pct = ((session.current) / total) * 100;

    var h = '<section class="view practice-session">';

    h += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';

    h += '<div class="q-counter">';
    h += '<span>' + t("questionOf", { n: n, total: total }) + '</span>';
    h += '<span style="display:flex;align-items:center;gap:8px">';
    h += '<span id="timer" style="font-family:ui-monospace,monospace;font-weight:700;color:var(--accent)">' + fmtTime(session.elapsedMs) + '</span>';
    if (!session.answered) {
      h += '<button type="button" data-act="practice-pause" style="background:transparent;border:1.5px solid var(--border);color:var(--text-soft);border-radius:8px;padding:4px 10px;font-size:0.75rem;font-weight:600;cursor:pointer">' + (session.paused ? "▶" : "⏸") + '</button>';
    }
    h += '</span>';
    h += '</div>';

    if (session.paused) {
      h += '<div class="feedback" style="background:var(--warn-soft);color:var(--warn);border:1px solid rgba(217,119,6,0.25);text-align:center;font-weight:600">⏸ ' + t("pausedLabel") + '</div>';
    }

    h += '<div class="question-card">';
    h += '<div class="question-prompt">' + esc(getQuestionLabel()) + '</div>';
    h += '<div class="question-text' + (session.mode === "bn_en" ? " bengali" : "") + '">' + esc(getQuestionText(word)) + '</div>';
    h += '</div>';

    h += '<div class="answer-area">';
    var inputClass = "answer-input";
    if (session.answered) {
      inputClass += session.answers[session.current].correct ? " correct" : " wrong";
    }
    h += '<input id="answer" type="text" class="' + inputClass + '" placeholder="' + esc(t("typeYourAnswer")) + '" value="' + esc(session.userAnswer) + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (session.answered || session.paused ? " readonly" : "") + '>';
    h += '</div>';

    if (session.answered) {
      var ans = session.answers[session.current];
      if (ans.correct) {
        h += '<div class="feedback correct">✓ ' + t("correctLabel") + '</div>';
      } else {
        h += '<div class="feedback wrong">✗ ' + t("wrongLabel") + '<span class="correct-answer">' + t("correctAnswerWas") + ' <b>' + esc(getCorrectAnswerText(word)) + '</b></span></div>';
      }
    }

    h += '<div class="practice-actions">';
    if (session.paused) {
      h += '<button type="button" class="btn-check" data-act="practice-resume">' + t("resume") + '</button>';
    } else if (!session.answered) {
      h += '<button type="button" class="btn-check" data-act="practice-check">' + t("check") + '</button>';
    } else {
      var isLast = session.current === session.questions.length - 1;
      h += '<button type="button" class="btn-next" data-act="practice-next">' + (isLast ? t("finish") : t("next")) + '</button>';
    }
    h += '</div>';

    h += '</section>';

    M.getAppEl().innerHTML = h;
    M.setTitle(t("practice"));
    M.setActiveNav("practice");
    M.showFab(false);
    M.showBack(false);

    if (!session.answered && !session.paused) {
      var inp = document.getElementById("answer");
      if (inp) {
        setTimeout(function () { inp.focus(); }, 100);
        inp.addEventListener("input", function () {
          session.userAnswer = inp.value;
          resetIdle();
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            doCheck();
          }
        });
      }
    }
  }

  function doCheck() {
    if (session.answered || session.paused) return;
    var word = currentWord();
    var ans = session.userAnswer;
    var correct = checkAnswer(word, ans);
    var now = Date.now();

    session.answers[session.current] = {
      id: word.id,
      correct: correct,
      userAnswer: ans,
      timeMs: now - session.questionStartAt
    };
    session.answered = true;
    renderQuestion();
  }

  function doNext() {
    session.answered = false;
    session.userAnswer = "";
    session.current++;
    session.questionStartAt = Date.now();

    if (session.current >= session.questions.length) {
      finishSession();
    } else {
      resetIdle();
      renderQuestion();
    }
  }

  async function finishSession() {
    stopTimer();

    var correct = session.answers.filter(function (a) { return a.correct; }).length;
    var total = session.questions.length;
    var pct = Math.round((correct / total) * 100);
    var totalMs = session.elapsedMs;
    var avgMs = Math.round(totalMs / total);

    // Save session
    try {
      var se = {
        id: uid(),
        date: session.startedAt,
        mode: session.mode,
        total: total,
        correct: correct,
        durationMs: totalMs,
        answers: session.answers.map(function (a) {
          return { id: a.id, correct: a.correct, userAnswer: a.userAnswer, timeMs: a.timeMs };
        })
      };
      await M.dbPutSession(se);
      if (M.sessions && Array.isArray(M.sessions)) M.sessions.unshift(se);
    } catch (e) { console.error(e); }

    renderResult(correct, total, pct, totalMs, avgMs);
    saveSessionStats();
  }

  function renderResult(correct, total, pct, totalMs, avgMs) {
    var emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
    var title = pct >= 80 ? t("resultGreat") : pct >= 50 ? t("resultGood") : t("resultOk");

    var h = '<section class="view">';
    h += '<div class="result-card">';

    h += '<div class="result-emoji">' + emoji + '</div>';
    h += '<h2 class="result-title">' + title + '</h2>';
    h += '<p class="result-sub">' + t("youGot", { c: correct, t: total }) + '</p>';

    h += '<div class="result-score">';
    h += '<div class="correct"><span class="num">' + correct + '</span><span class="lbl">' + t("correctLabel") + '</span></div>';
    h += '<div class="wrong"><span class="num">' + (total - correct) + '</span><span class="lbl">' + t("wrongLabel") + '</span></div>';
    h += '<div><span class="num">' + pct + '%</span><span class="lbl">' + t("accuracy") + '</span></div>';
    h += '</div>';

    h += '<div class="result-score" style="margin-top:6px">';
    h += '<div><span class="num" style="font-size:1.3rem">' + fmtTime(totalMs) + '</span><span class="lbl">' + t("totalTime") + '</span></div>';
    h += '<div><span class="num" style="font-size:1.3rem">' + fmtTime(avgMs) + '</span><span class="lbl">' + t("avgTime") + '</span></div>';
    h += '</div>';

    // Details toggle button
    h += '<div style="margin-top:16px"><button type="button" data-act="toggle-details" style="width:100%;padding:12px;border:1.5px solid var(--border);background:var(--card);color:var(--text-soft);border-radius:12px;font:inherit;font-weight:600;font-size:0.9rem;cursor:pointer">' + (showDetails ? "▲ " + t("hideDetails") : "▼ " + t("viewDetails")) + '</button></div>';

    // Details content
    if (showDetails) {
      h += '<div style="margin-top:12px;text-align:left">';
      session.answers.forEach(function (a, i) {
        var w = M.words.find(function (x) { return x.id === a.id; });
        if (!w) return;
        var sec = Math.round(a.timeMs / 1000);
        h += '<div style="padding:10px 12px;margin-bottom:6px;background:var(--surface);border-radius:10px;border-left:3px solid ' + (a.correct ? "var(--ok)" : "var(--danger)") + '">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">';
        h += '<div><span style="font-weight:700;color:' + (a.correct ? "var(--ok)" : "var(--danger)") + '">' + (a.correct ? "✓" : "✗") + '</span> ';
        h += '<span style="font-size:0.75rem;color:var(--text-muted);font-weight:700">#' + w.no + '</span> ';
        h += '<span style="font-weight:600">' + esc(w.en) + '</span></div>';
        h += '<span style="font-size:0.75rem;color:var(--text-muted);font-family:ui-monospace,monospace">' + sec + 's</span>';
        h += '</div>';
        if (!a.correct) {
          h += '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:6px">';
          h += '<span>' + t("youWrote") + ' <b style="color:var(--danger)">' + esc(a.userAnswer || "(empty)") + '</b></span><br>';
          h += '<span>' + t("correctAnswer") + ' <b style="color:var(--ok)">' + esc(getCorrectAnswerText(w)) + '</b></span>';
          h += '</div>';
        }
        h += '</div>';
      });
      h += '</div>';
    }

    h += '<div class="practice-actions" style="margin-top:20px">';
    h += '<button type="button" class="btn-next" data-act="practice-again">' + t("tryAgain") + '</button>';
    if (correct < total) {
      h += '<button type="button" class="btn-check" data-act="practice-wrong">' + t("practiceWrong") + '</button>';
    }
    h += '</div>';

    h += '<div class="practice-actions" style="margin-top:10px">';
    h += '<button type="button" class="btn-check" data-act="practice-done" style="background:var(--surface);color:var(--text);border:1.5px solid var(--border)">' + t("done") + '</button>';
    h += '</div>';

    h += '</div>';
    h += '</section>';

    M.getAppEl().innerHTML = h;
    M.setTitle(t("practice"));
    M.setActiveNav("practice");
    M.showFab(false);
    M.showBack(false);
  }

  async function saveSessionStats() {
    for (var i = 0; i < session.answers.length; i++) {
      var a = session.answers[i];
      var w = M.words.find(function (x) { return x.id === a.id; });
      if (!w) continue;
      w.practiced = true;
      if (a.correct) {
        w.correctCount = (w.correctCount || 0) + 1;
      } else {
        w.wrongCount = (w.wrongCount || 0) + 1;
      }
      w.lastPracticed = Date.now();
      w.updated = Date.now();
      try { await M.dbPutWord(w); } catch (e) {}
    }
  }

  function open() {
    stopTimer();
    session = null;
    showDetails = false;
    renderSetup();
  }

  function handleClick(e) {
    var setBtn = e.target.closest("[data-set]");
    if (setBtn && !session) {
      var key = setBtn.dataset.set;
      var val = setBtn.dataset.val;
      if (key === "count") val = parseInt(val, 10);
      setup[key] = val;
      if (key === "source" && val !== "range") {
        setup.rangeFrom = null;
        setup.rangeTo = null;
      }
      renderSetup();
      return true;
    }

    var rangeBtn = e.target.closest("[data-range-from]");
    if (rangeBtn && !session) {
      setup.rangeFrom = parseInt(rangeBtn.dataset.rangeFrom, 10);
      setup.rangeTo = parseInt(rangeBtn.dataset.rangeTo, 10);
      renderSetup();
      return true;
    }

    var act = e.target.closest("[data-act]");
    if (!act) return false;

    var a = act.dataset.act;

    if (a === "practice-start") { startSession(); return true; }
    if (a === "practice-check") { doCheck(); return true; }
    if (a === "practice-next") { doNext(); return true; }
    if (a === "practice-pause") {
      if (session && session.paused) doResume();
      else doPause(false);
      return true;
    }
    if (a === "practice-resume") { doResume(); return true; }
    if (a === "toggle-details") {
      showDetails = !showDetails;
      if (session) {
        var correct = session.answers.filter(function (x) { return x.correct; }).length;
        var total = session.questions.length;
        var pct = Math.round((correct / total) * 100);
        var totalMs = session.elapsedMs;
        var avgMs = Math.round(totalMs / total);
        renderResult(correct, total, pct, totalMs, avgMs);
      }
      return true;
    }
    if (a === "practice-again") {
      stopTimer(); session = null; showDetails = false; renderSetup(); return true;
    }
    if (a === "practice-wrong") {
      var wrongIds = session.answers.filter(function (x) { return !x.correct; }).map(function (x) { return x.id; });
      var wrongWords = M.words.filter(function (w) {
        return wrongIds.indexOf(w.id) > -1;
      });
      stopTimer();
      session = null;
      showDetails = false;
      if (wrongWords.length) startSession(wrongWords);
      return true;
    }
    if (a === "practice-done") {
      stopTimer(); session = null; showDetails = false;
      var navWords = document.querySelector('[data-nav="words"]');
      if (navWords) navWords.click();
      return true;
    }

    return false;
  }

  window.Practice = {
    open: open,
    handleClick: handleClick
  };

  document.addEventListener("click", function (e) {
    if (handleClick(e)) {
      e.stopPropagation();
    }
  }, true);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && session && !session.paused && !session.answered) {
      doPause(true);
    }
  });

})();