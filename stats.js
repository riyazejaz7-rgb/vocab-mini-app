(function () {
  "use strict";

  var M = window.VocabMain;
  if (!M) { console.error("stats.js: VocabMain not available"); return; }

  var t = M.t;
  var esc = M.esc;

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
    var masteredCount = active.filter(function (w) {
      var r = M.reviews[w.id];
      return r && r.box >= 5;
    }).length;

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
        if (i === 0) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
      d.setDate(d.getDate() - 1);
    }

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
    var maxBar = s.weekBars.reduce(function (a, b) { return Math.max(a, b.count); }, 1);

    var h = '<section class="view">';

    h += '<div class="stats" style="grid-template-columns: repeat(2, 1fr)">';
    h += '<div class="stat"><span class="n">' + s.todayWords + '</span><span class="l">' + t("statsTodayPracticed") + '</span></div>';
    h += '<div class="stat"><span class="n">' + s.weekWords + '</span><span class="l">' + t("statsWeekPracticed") + '</span></div>';
    h += '<div class="stat"><span class="n">' + s.totalWords + '</span><span class="l">' + t("statsTotalWords") + '</span></div>';
    h += '<div class="stat"><span class="n">' + s.masteredCount + '</span><span class="l">' + t("statsMastered") + '</span></div>';
    h += '</div>';

    h += '<div class="section" style="text-align:center;padding:20px">';
    h += '<div style="font-size:2.5rem;line-height:1">🔥</div>';
    h += '<div style="font-size:1.8rem;font-weight:800;color:var(--accent);margin-top:6px">' + s.streak + '</div>';
    h += '<div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;font-weight:600">' + t("statsStreak") + ' · ' + t("statsDays") + '</div>';
    h += '</div>';

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

    // AI Coach section
    h += '<div class="section" style="background:linear-gradient(135deg,var(--accent-soft) 0%,var(--card) 100%);border-color:var(--accent)">';
    h += '<h2>🤖 ' + t("coachTitle") + '</h2>';
    h += '<p class="desc">' + t("coachDesc") + '</p>';
    if (window._coachCache) {
      h += '<div style="background:var(--card);padding:14px;border-radius:10px;font-size:0.92rem;line-height:1.6;white-space:pre-wrap;margin-top:8px">' + esc(window._coachCache) + '</div>';
      h += '<div style="margin-top:10px"><button type="button" data-act="coach-refresh" style="background:transparent;border:1.5px solid var(--border);color:var(--text-soft);border-radius:10px;padding:8px 14px;font:inherit;font-size:0.85rem;font-weight:600;cursor:pointer">🔄 ' + t("coachRefresh") + '</button></div>';
    } else {
      h += '<div class="row" style="margin-top:10px"><button type="button" data-act="coach-ask" class="primary" style="width:100%;padding:14px;border-radius:12px;font-weight:700">💡 ' + t("coachAsk") + '</button></div>';
    }
    h += '</div>';

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

    h += '<div class="section">';
    h += '<h2>' + t("statsMasteredList") + '</h2>';
    var masteredWords = M.words.filter(function (w) { 
      var r = M.reviews[w.id];
      return !w.deleted && r && r.box >= 5;
    });
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

    var learningWords = M.words.filter(function (w) {
      var r = M.reviews[w.id];
      return !w.deleted && (!r || r.box < 5);
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

  async function askCoach() {
    if (!window.VocabAI || !window.VocabAI.getCoach) {
      alert("AI not available. Check login.");
      return;
    }

    var sessions = M.sessions.slice(0, 20);
    var activeWords = M.words.filter(function (w) { return !w.deleted; });

    var historyLines = ["Recent practice sessions:"];
    sessions.forEach(function (s) {
      var modeName = s.mode === "bn_en" ? "বাংলা → English" : s.mode === "en_bn" ? "English → বাংলা" : s.mode === "fill" ? "Fill blank" : "AI Quiz";
      historyLines.push("- " + new Date(s.date).toLocaleDateString() + ": " + s.correct + "/" + s.total + " (" + modeName + ")");
    });

    historyLines.push("");
    historyLines.push("Weak words (most wrong):");
    var weak = activeWords.filter(function (w) { return w.wrongCount && w.wrongCount > 0; })
      .sort(function (a, b) { return (b.wrongCount || 0) - (a.wrongCount || 0); })
      .slice(0, 5);
    weak.forEach(function (w) {
      historyLines.push("- " + w.en + " (" + (w.bn || []).join(", ") + ") — " + w.wrongCount + " wrongs");
    });
    if (!weak.length) historyLines.push("- (none yet)");

    historyLines.push("");
    historyLines.push("Total words: " + activeWords.length);
    var mastered = activeWords.filter(function (w) {
       var r = M.reviews[w.id];
       return r && r.box >= 5;
    }).length;
    historyLines.push("Mastered: " + mastered);

    var history = historyLines.join("\n");

    M.getAppEl().innerHTML = '<section class="view"><div class="empty"><div class="skeleton" style="height:80px;margin-bottom:10px"></div><p class="title" style="margin-top:20px">' + t("coachThinking") + '</p></div></section>';

    var result = await window.VocabAI.getCoach(history);

    if (!result.ok) {
      alert("AI failed: " + (result.message || result.error));
      render();
      return;
    }

    var coach = (result.data && result.data.coach) || "";
    if (!coach) {
      alert("No coach response");
      render();
      return;
    }

    window._coachCache = coach;
    render();
  }

  function handleClick(e) {
    var act = e.target.closest("[data-act]");
    if (!act) return false;

    if (act.dataset.act === "stats-review") {
      var navPractice = document.querySelector('[data-nav="practice"]');
      if (navPractice) navPractice.click();
      setTimeout(function () {
        var dueBtn = document.querySelector('[data-set="source"][data-val="due"]');
        if (dueBtn) dueBtn.click();
      }, 100);
      return true;
    }

    if (act.dataset.act === "coach-ask") {
      askCoach();
      return true;
    }

    if (act.dataset.act === "coach-refresh") {
      window._coachCache = null;
      render();
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
