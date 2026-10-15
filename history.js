(function () {
  "use strict";

  var M = window.VocabMain;
  if (!M) { console.error("history.js: VocabMain not available"); return; }

  var t = M.t;
  var esc = M.esc;
  var toast = M.toast;
  var confirmDialog = M.confirmDialog;

  function fmtTime(ms) {
    var total = Math.floor(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var yyyy = d.getFullYear();
    var hh = d.getHours();
    var mn = d.getMinutes();
    var ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return dd + "/" + mm + "/" + yyyy + " " + (hh < 10 ? "0" : "") + hh + ":" + (mn < 10 ? "0" : "") + mn + " " + ampm;
  }

  function getDayLabel(ts) {
    var days = M.daysSince(ts);
    if (days < 1) return t("historyToday");
    if (days < 2) return t("historyYesterday");
    return fmtDate(ts).split(" ")[0];
  }

  function modeLabel(m) {
    if (m === "bn_en") return t("mode_bn_en");
    if (m === "en_bn") return t("mode_en_bn");
    return m;
  }

  function render() {
    var sessions = M.sessions || [];

    var h = '<section class="view">';

    if (!sessions.length) {
      h += '<div class="empty">';
      h += '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">';
      h += '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
      h += '<p class="title">' + t("historyEmpty") + '</p>';
      h += '<p>' + t("historyEmptySub") + '</p>';
      h += '</div>';
    } else {
      // Stats summary
      var today = 0, week = 0, totalCorrect = 0, totalQs = 0;
      var now = Date.now();
      sessions.forEach(function (s) {
        var d = (now - s.date) / 86400000;
        if (d < 1) today++;
        if (d < 7) week++;
        totalCorrect += s.correct;
        totalQs += s.total;
      });
      var acc = totalQs ? Math.round((totalCorrect / totalQs) * 100) : 0;

      h += '<div class="stats">';
      h += '<div class="stat"><span class="n">' + today + '</span><span class="l">' + t("today") + '</span></div>';
      h += '<div class="stat"><span class="n">' + week + '</span><span class="l">7d</span></div>';
      h += '<div class="stat"><span class="n">' + acc + '%</span><span class="l">' + t("accuracy") + '</span></div>';
      h += '</div>';

      // Sessions list
      h += '<div style="margin-top:14px">';
      sessions.forEach(function (s) {
        var pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
        var emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
        h += '<article class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">';
        h += '<div style="flex:1;min-width:0">';
        h += '<div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">' + esc(getDayLabel(s.date)) + '</div>';
        h += '<div style="font-weight:600;margin-top:2px;font-size:0.92rem">' + esc(modeLabel(s.mode)) + '</div>';
        h += '<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">' + fmtDate(s.date) + ' · ' + fmtTime(s.durationMs) + '</div>';
        h += '</div>';
        h += '<div style="text-align:right">';
        h += '<div style="font-size:1.4rem;line-height:1">' + emoji + '</div>';
        h += '<div style="font-size:1rem;font-weight:700;color:var(--accent);margin-top:4px">' + s.correct + '/' + s.total + '</div>';
        h += '<div style="font-size:0.75rem;color:var(--text-muted)">' + pct + '%</div>';
        h += '</div>';
        h += '</div>';
        h += '</article>';
      });
      h += '</div>';

      // Clear button
      h += '<div style="margin-top:20px">';
      h += '<button type="button" data-act="history-clear" class="btn-secondary" style="width:100%;padding:14px;border-radius:14px;font-weight:700;color:var(--danger);border-color:var(--danger-soft)">' + t("historyClear") + '</button>';
      h += '</div>';
    }

    h += '</section>';

    M.getAppEl().innerHTML = h;
    M.setTitle(t("historyTitle"));
    M.setActiveNav("tools");
    M.showFab(false);
    M.showBack(true);
  }

  async function clearHistory() {
    var ok = await confirmDialog(t("historyClearConfirm"));
    if (!ok) return;
    try {
      await M.dbClearSessions();
      if (M.sessions && Array.isArray(M.sessions)) M.sessions.length = 0;
      toast(t("historyCleared"));
      render();
    } catch (e) {
      toast("Error clearing history");
    }
  }

  function handleClick(e) {
    var act = e.target.closest("[data-act]");
    if (!act) return false;
    if (act.dataset.act === "history-clear") {
      clearHistory();
      return true;
    }
    return false;
  }

  window.History = {
    open: render,
    handleClick: handleClick
  };

  document.addEventListener("click", function (e) {
    if (handleClick(e)) {
      e.stopPropagation();
    }
  }, true);

})();