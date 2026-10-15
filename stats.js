(function () {
  "use strict";

  var M = window.VocabMain;
  if (!M) { console.error("stats.js: VocabMain not available"); return; }

  var t = M.t;
  var esc = M.esc;
  var toast = M.toast;

  function fmtTime(ms) {
    var total = Math.floor(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function levelLabel(box) {
    if (box <= 1) return t("statsLevel1");
    if (box === 2) return t("statsLevel2");
    if (box === 3) return t("statsLevel3");
    if (box === 4) return t("statsLevel4");
    return t("statsLevel5");
  }

  function computeStats() {
    var active = M.words.filter(function (w) { return !w.deleted; });
    var now = Date.now();
    var dayMs = 86400000;

    var todaySessions = M.sessions.filter(function (s) {
      return s.date && (now - s.date) < dayMs;
    });
    var weekSessions = M.sessions.filter(function (s) {
      return s.date && (now - s.date) < 7 * dayMs;
    });

    var todayWordsPracticed = 0;
    todaySessions.forEach(function (s) {
      todayWordsPracticed += (s.answers && s.answers.length) || s.total || 0;
    });
    var weekWordsPracticed = 0;
    weekSessions.forEach(function (s) {
      weekWordsPracticed += (s.answers && s.answers.length) || s.total || 0;
    });

    var dueWords = active.filter(function (w) { return M.isDueToday(w.id); });
    var masteredCount = active.filter(function (w) { return M.isMastered(w.id); }).length;

    // Streak — consecutive days with sessions
    var daySet = {};
    M.sessions.forEach(function (s) {
      if (!s.date) return;
      var d = new Date(s.date);
      var key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      daySet[key] = true;
    });

    var streak = 0;
    var d = new Date();
    for (var i = 0; i < 365; i++) {
      var key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      if (daySet[key]) streak++;
      else {
        // If today missing, check yesterday
        if (i === 0) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
      d.setDate(d.getDate() - 1);
    }

    // Weekly chart data (last 7 days)
    var weekBars = [];
    for (var k = 6; k >= 0; k--) {
      var day = new Date();
      day.setDate(day.getDate() - k);
      var key2 = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate();
      var count = 0;
      M.sessions.forEach(function (s) {
        if (!s.date) return;
        var dd = new Date(s.date);
        var k2 = dd.getFullYear() + "-" + (dd.getMonth() + 1) + "-" + dd.getDate();
        if (k2 === key2) count += (s.correct || 0);
      });
      var label = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()];
      var dateNum = day.getDate();
      weekBars.push({ label: label, date: dateNum, count: count });
    }

    return {
      totalWords: active.length,
      todayWords: todayWordsPracticed,
      weekWords: weekWordsPracticed,
      dueWords: dueWords,
      dueCount: dueWords.length,
      masteredCount: masteredCount,
      streak: streak,
      weekBars: weekBars
    };
  }

  function render() {
    var s = computeStats();
    var lang = M.lang;

    var maxBar = s.weekBars.reduce(function (a, b) { return Math.max(a, b.count); }, 1);

    var h = '<section class="view">';

    // Top stats grid
    h += '<div class="stats" style="grid-template-columns: repeat(2, 1fr)">';
    h += '<div class="stat"><span class="n">' + s.todayWords + '</span><span class="l">' + t("statsTodayPracticed") + '</span></div>';
    h += '<div class="stat"><span class="n">' + s.weekWords + '</span><span class="l">' + t("statsWeekPracticed") + '</span></div>';
    h += '<div class="stat"><span class="n">' + s.totalWords + '</span><span class="l">' + t("statsTotalWords") + '</span></div>';
    h += '<div class="stat"><span class="n">' + s.masteredCount + '</span><span class="l">' + t("statsMastered") + '</span></div>';
    h += '</div>';

    // Streak
    h += '<div class="section" style="text-align:center;padding:20px">';
    h += '<div style="font-size:2.5rem;line-height:1">🔥</div>';
    h += '<div style="font-size:1.8rem;font-weight:800;color:var(--accent);margin-top:6px">' + s.streak + '</div>';
    h += '<div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;font-weight:600">' + t("statsStreak") + ' · ' + t("statsDays") + '</div>';
    h += '</div>';

    // Due today
    h += '<div class="section">';
    h += '<h2>' + t("statsDueToday") + '</h2>';
    if (s.dueCount === 0) {
      h += '<p class="desc" style="color:var(--ok);font-weight:600">✓ ' + t("statsDueNothing") + '</p>';
    } else {
      h += '<p class="desc">' + t("statsDueTodayDesc") + '</p>';
      h += '<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px">';
      h += '<span style="font-size:2rem;font-weight:800;color:var(--accent)">' + s.dueCount + '</span>';
      h += '<span style="color:var(--text-muted)">words</span>';
      h += '</div>';
      h += '<div class="row"><button data-act="stats-review" class="primary">' + t("statsStartReview") + '</button></div>';
    }
    h += '</div>';

    // Weekly chart
    h += '<div class="section">';
    h += '<h2>' + t("statsWeeklyChart") + '</h2>';
    h += '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;height:120px;margin-top:16px">';
    s.weekBars.forEach(function (b) {
      var pct = b.count ? Math.max(8, (b.count / maxBar) * 100) : 4;
      var color = b.count ? "var(--accent)" : "var(--border)";
      h += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%">';
      h += '<div style="flex:1;display:flex;align-items:flex-end;width:100%">';
      h += '<div style="width:100%;height:' + pct + '%;background:' + color + ';border-radius:6px 6px 0 0;min-height:4px;transition:height 0.3s"></div>';
      h += '</div>';
      h += '<div style="font-size:0.7rem;color:var(--text-muted);font-weight:600">' + esc(b.label) + '</div>';
      h += '<div style="font-size:0.65rem;color:var(--text-muted)">' + b.date + '</div>';
      h += '</div>';
    });
    h += '</div>';
    h += '</div>';

    // Mastered words
    h += '<div class="section">';
    h += '<h2>' + t("statsMasteredList") + '</h2>';
    var masteredWords = M.words.filter(function (w) { return !w.deleted && M.isMastered(w.id); });
    if (!masteredWords.length) {
      h += '<p class="desc">' + t("statsMasteredEmpty") + '</p>';
    } else {
      h += '<div style="margin-top:10px">';
      masteredWords.sort(function (a, b) { return a.no - b.no; }).forEach(function (w) {
        h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;margin-bottom:6px;background:var(--surface);border-radius:8px;border-left:3px solid var(--ok)">';
        h += '<div><span style="font-size:0.72rem;color:var(--text-muted);font-weight:700">#' + w.no + '</span> ';
        h += '<span style="font-weight:600">' + esc(w.en) + '</span></div>';
        h += '<span style="font-size:1rem">⭐</span>';
        h += '</div>';
      });
      h += '</div>';
    }
    h += '</div>';

    // Review schedule (learning words)
    var learningWords = M.words.filter(function (w) {
      return !w.deleted && !M.isMastered(w.id);
    }).sort(function (a, b) {
      var ra = M.reviews[a.id] || {};
      var rb = M.reviews[b.id] || {};
      return (ra.box || 0) - (rb.box || 0);
    });

    if (learningWords.length) {
      h += '<div class="section">';
      h += '<h2>' + t("statsReviewSchedule") + '</h2>';
      h += '<div style="margin-top:10px">';
      learningWords.slice(0, 20).forEach(function (w) {
        var r = M.reviews[w.id] || { box: 0 };
        var box = r.box || 0;
        var nextDays = r.nextReview ? Math.max(0, Math.ceil((r.nextReview - Date.now()) / 86400000)) : 0;
        var due = M.isDueToday(w.id);

        h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;margin-bottom:6px;background:var(--surface);border-radius:8px;border-left:3px solid ' + (due ? "var(--danger)" : "var(--accent)") + '">';
        h += '<div style="min-width:0;flex:1">';
        h += '<div><span style="font-size:0.72rem;color:var(--text-muted);font-weight:700">#' + w.no + '</span> ';
        h += '<span style="font-weight:600;font-size:0.92rem">' + esc(w.en) + '</span></div>';
        h += '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">' + t("statsBox", { n: box }) + ' · ' + levelLabel(box) + (due ? ' · ' + t("statsReviewNow") : (nextDays > 0 ? ' · ' + t("statsNextReview", { d: nextDays }) : '')) + '</div>';
        h += '</div>';
        h += '<div style="font-size:1rem;flex-shrink:0">' + (due ? "🔴" : box >= 4 ? "🟢" : box >= 2 ? "🟡" : "⚪") + '</div>';
        h += '</div>';
      });
      if (learningWords.length > 20) {
        h += '<p class="muted center" style="font-size:0.8rem;margin-top:8px">+ ' + (learningWords.length - 20) + ' more</p>';
      }
      h += '</div>';
      h += '</div>';
    }

    h += '</section>';

    M.getAppEl().innerHTML = h;
    M.setTitle(t("statsTitle"));
    M.setActiveNav("stats");
    M.showFab(false);
    M.showBack(false);
  }

  function handleClick(e) {
    var act = e.target.closest("[data-act]");
    if (!act) return false;
    if (act.dataset.act === "stats-review") {
      // Jump to practice with due source
      var navPractice = document.querySelector('[data-nav="practice"]');
      if (navPractice) navPractice.click();
      // Give practice.js a tick to render, then click "due"
      setTimeout(function () {
        var dueBtn = document.querySelector('[data-set="source"][data-val="due"]');
        if (dueBtn) dueBtn.click();
      }, 100);
      return true;
    }
    return false;
  }

  window.Stats = {
    open: render,
    handleClick: handleClick
  };

  document.addEventListener("click", function (e) {
    if (handleClick(e)) e.stopPropagation();
  }, true);

})();
