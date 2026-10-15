/* ============================================================
   Vocabulary Mini App — practice.js
   Phase 3a: Practice Mode (setup + session + result)
   Depends on: main.js (window.VocabMain)
   ============================================================ */

(function () {
  "use strict";

  var M = window.VocabMain;
  if (!M) {
    console.error("practice.js: VocabMain not available");
    return;
  }

  var t = M.t;
  var esc = M.esc;
  var uid = M.uid;
  var toast = M.toast;
  var confirmDialog = M.confirmDialog;

  /* ---------- State ---------- */
  var setup = {
    mode: "bn_en",
    count: 10,
    source: "all"
  };

  var session = null;

  /* ---------- Setup screen ---------- */
  function renderSetup() {
    var total = M.words.filter(function (w) { return !w.deleted; }).length;
    var notEnough = total < 4;

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
    h += '</div>';
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
  }

  /* ---------- Session ---------- */
  function startSession() {
    var pool = M.words.filter(function (w) { return !w.deleted; });
    if (setup.source === "new") {
      pool = pool.filter(function (w) { return !w.practiced; });
    } else if (setup.source === "wrong") {
      pool = pool.filter(function (w) { return w.wrongCount && w.wrongCount > 0; });
    }

    if (pool.length < 4) {
      toast(t("notEnoughWords"));
      return;
    }

    var shuffled = pool.slice().sort(function () { return Math.random() - 0.5; });
    var picked = shuffled.slice(0, Math.min(setup.count, shuffled.length));

    session = {
      mode: setup.mode,
      questions: picked,
      current: 0,
      answers: [],
      answered: false,
      userAnswer: ""
    };

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
      // User types English word
      return normalize(word.en) === user;
    } else {
      // User types Bengali meaning(s) — loose match
      var userParts = user.split(/[,;،]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      for (var i = 0; i < userParts.length; i++) {
        var up = userParts[i];
        for (var j = 0; j < word.bn.length; j++) {
          var wp = normalize(word.bn[j]);
          if (wp === up) return true;
        }
      }
      // Also accept if user typed entire joined string
      var joined = word.bn.map(normalize).join(", ");
      if (joined === user) return true;
      return false;
    }
  }

  function getCorrectAnswerText(word) {
    if (session.mode === "bn_en") {
      return word.en;
    } else {
      return word.bn.join(", ");
    }
  }

  function getQuestionText(word) {
    if (session.mode === "bn_en") {
      return word.bn.join(", ");
    } else {
      return word.en;
    }
  }

  function getQuestionLabel() {
    return session.mode === "bn_en" ? "বাংলা" : "English";
  }

  function renderQuestion() {
    var word = currentWord();
    if (!word) return renderResult();

    var total = session.questions.length;
    var n = session.current + 1;
    var pct = ((session.current) / total) * 100;

    var h = '<section class="view practice-session">';

    // Progress
    h += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
    h += '<div class="q-counter"><span>' + t("questionOf", { n: n, total: total }) + '</span></div>';

    // Question card
    h += '<div class="question-card">';
    h += '<div class="question-prompt">' + esc(getQuestionLabel()) + '</div>';
    h += '<div class="question-text' + (session.mode === "bn_en" ? " bengali" : "") + '">' + esc(getQuestionText(word)) + '</div>';
    h += '</div>';

    // Answer input
    h += '<div class="answer-area">';
    var inputClass = "answer-input";
    if (session.answered) {
      inputClass += session.answers[session.current].correct ? " correct" : " wrong";
    }
    h += '<input id="answer" type="text" class="' + inputClass + '" placeholder="' + esc(t("typeYourAnswer")) + '" value="' + esc(session.userAnswer) + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (session.answered ? " readonly" : "") + '>';
    h += '</div>';

    // Feedback
    if (session.answered) {
      var ans = session.answers[session.current];
      if (ans.correct) {
        h += '<div class="feedback correct">✓ ' + t("correctLabel") + '</div>';
      } else {
        h += '<div class="feedback wrong">✗ ' + t("wrongLabel") + '<span class="correct-answer">' + t("correctAnswerWas") + ' <b>' + esc(getCorrectAnswerText(word)) + '</b></span></div>';
      }
    }

    // Actions
    h += '<div class="practice-actions">';
    if (!session.answered) {
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

    // Focus input
    if (!session.answered) {
      var inp = document.getElementById("answer");
      if (inp) {
        setTimeout(function () { inp.focus(); }, 100);
        inp.addEventListener("input", function () {
          session.userAnswer = inp.value;
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
    if (session.answered) return;
    var word = currentWord();
    var ans = session.userAnswer;
    var correct = checkAnswer(word, ans);

    session.answers[session.current] = {
      id: word.id,
      correct: correct,
      userAnswer: ans
    };
    session.answered = true;
    renderQuestion();
  }

  function doNext() {
    session.answered = false;
    session.userAnswer = "";
    session.current++;

    if (session.current >= session.questions.length) {
      finishSession();
    } else {
      renderQuestion();
    }
  }

  function finishSession() {
    var correct = session.answers.filter(function (a) { return a.correct; }).length;
    var total = session.questions.length;
    var pct = Math.round((correct / total) * 100);

    var h = '<section class="view">';
    h += '<div class="result-card">';

    var emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
    var title = pct >= 80 ? t("resultGreat") : pct >= 50 ? t("resultGood") : t("resultOk");

    h += '<div class="result-emoji">' + emoji + '</div>';
    h += '<h2 class="result-title">' + title + '</h2>';
    h += '<p class="result-sub">' + t("youGot", { c: correct, t: total }) + '</p>';

    h += '<div class="result-score">';
    h += '<div class="correct"><span class="num">' + correct + '</span><span class="lbl">' + t("correctLabel") + '</span></div>';
    h += '<div class="wrong"><span class="num">' + (total - correct) + '</span><span class="lbl">' + t("wrongLabel") + '</span></div>';
    h += '<div><span class="num">' + pct + '%</span><span class="lbl">' + t("accuracy") + '</span></div>';
    h += '</div>';

    h += '<div class="practice-actions" style="margin-top:24px">';
    h += '<button type="button" class="btn-next" data-act="practice-again">' + t("tryAgain") + '</button>';
    h += '<button type="button" class="btn-check" data-act="practice-done">' + t("done") + '</button>';
    h += '</div>';

    h += '</div>';
    h += '</section>';

    M.getAppEl().innerHTML = h;
    M.setTitle(t("practice"));
    M.setActiveNav("practice");
    M.showFab(false);
    M.showBack(false);

    // Save attempt stats to each word
    saveSessionStats();
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

  /* ---------- Public API ---------- */
  function open() {
    session = null;
    renderSetup();
  }

  function handleClick(e) {
    var setBtn = e.target.closest("[data-set]");
    if (setBtn && !session) {
      var key = setBtn.dataset.set;
      var val = setBtn.dataset.val;
      if (key === "count") val = parseInt(val, 10);
      setup[key] = val;
      renderSetup();
      return true;
    }

    var act = e.target.closest("[data-act]");
    if (!act) return false;

    var a = act.dataset.act;

    if (a === "practice-start") {
      startSession();
      return true;
    }
    if (a === "practice-check") {
      doCheck();
      return true;
    }
    if (a === "practice-next") {
      doNext();
      return true;
    }
    if (a === "practice-again") {
      session = null;
      renderSetup();
      return true;
    }
    if (a === "practice-done") {
      session = null;
      // go back to words
      if (window.VocabMain && document.querySelector('[data-nav="words"]')) {
        document.querySelector('[data-nav="words"]').click();
      }
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

})();