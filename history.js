(function () {
  "use strict";

  var M = window.VocabMain;
  if (!M) { console.error("history.js: VocabMain not available"); return; }

  var t = M.t;
  var esc = M.esc;
  var toast = M.toast;
  var confirmDialog = M.confirmDialog;

  var filterRange = "all";
  var expandedId = null;

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

  function filteredSessions() {
    var all = M.sessions || [];
    if (filterRange === "all") return all;
    var now = Date.now();
    var limit = filterRange === "today" ? 1 : filterRange === "7d" ? 7 : 30;
    return all.filter(function (s) {
      return (now - s.date) / 86400000 < limit;
    });
  }

  function render() {
    var all = M.sessions || [];
    var sessions = filteredSessions();

    var h = '<section class="view">';

    if (!all.length) {
      h += '<div class="empty">';
      h += '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">';
      h += '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
      h += '<p class="title">' + t("historyEmpty") + '</p>';
      h += '<p>' + t("historyEmptySub") + '</p>';
      h += '</div>';
    } else {
      // Stats summary (based on ALL sessions)
      var today = 0, week = 0, totalCorrect = 0, totalQs = 0;
      var now = Date.now();
      all.forEach(function (s) {
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

      // Filters
      h += '<div class="chips" style="margin-top:14px">';
      [
        { id: "all", label: t("filterAll") },
        { id: "today", label: t("filterToday") },
        { id: "7d", label: t("filter7d") },
        { id: "30d", label: t("filter30d") }
      ].forEach(function (f) {
        h += '<button type="button" data-filter="' + f.id + '" class="' + (filterRange === f.id ? "on" : "") + '">' + f.label + '</button>';
      });
      h += '</div>';

      // Sessions list
      if (!sessions.length) {
        h += '<p class="muted center" style="margin:32px 0">' + t("noMatch") + '</p>';
      } else {
        h += '<div style="margin-top:14px">';
        sessions.forEach(function (s) {
          var pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
          var emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
          var expanded = expandedId === s.id;

          h += '<article class="card" style="padding:0;overflow:hidden;cursor:pointer" data-session="' + s.id + '">';

          // Header (tap to expand)
          h += '<div style="padding:14px 16px">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">';
          h += '<div style="flex:1;min-width:0">';
          h += '<div style="font-size:0.72rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em">' + esc(getDayLabel(s.date)) + '</div>';
          h += '<div style="font-weight:600;margin-top:2px;font-size:0.95rem">' + esc(modeLabel(s.mode)) + '</div>';
          h += '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">' + fmtDate(s.date) + ' · ' + fmtTime(s.durationMs) + '</div>';
          h += '</div>';
          h += '<div style="text-align:right;flex-shrink:0">';
          h += '<div style="font-size:1.4rem;line-height:1">' + emoji + '</div>';
          h += '<div style="font-size:1rem;font-weight:700;color:var(--accent);margin-top:4px">' + s.correct + '/' + s.total + '</div>';
          h += '<div style="font-size:0.72rem;color:var(--text-muted)">' + pct + '%</div>';
          h += '</div>';
          h += '</div>';
          h += '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;display:flex;justify-content:space-between;align-items:center">';
          h += '<span>' + (expanded ? "▲ " + t("hideDetails") : "▼ " + t("viewDetails")) + '</span>';
          h += '<button type="button" data-act="delete-session" data-id="' + s.id + '" style="background:transparent;border:0;color:var(--danger);font:inherit;font-size:0.75rem;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:6px">' + t("del") + '</button>';
          h += '</div>';
          h += '</div>';

          // Expanded details
          if (expanded && s.answers) {
            h += '<div style="border-top:1px solid var(--border);padding:12px 16px;background:var(--surface)">';
            s.answers.forEach(function (a) {
              var w = M.words.find(function (x) { return x.id === a.id; });
              if (!w) return;
              var sec = Math.round((a.timeMs || 0) / 1000);
              h += '<div style="padding:8px 10px;margin-bottom:6px;background:var(--card);border-radius:8px;border-left:3px solid ' + (a.correct ? "var(--ok)" : "var(--danger)") + '">';
              h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">';
              h += '<div style="min-width:0;flex:1">';
              h += '<span style="font-weight:700;color:' + (a.correct ? "var(--ok)" : "var(--danger)") + '">' + (a.correct ? "✓" : "✗") + '</span> ';
              h += '<span style="font-size:0.72rem;color:var(--text-muted);font-weight:700">#' + w.no + '</span> ';
              h += '<span style="font-weight:600;font-size:0.92rem">' + esc(w.en) + '</span>';
              h += '</div>';
              h += '<span style="font-size:0.72rem;color:var(--text-muted);font-family:ui-monospace,monospace;flex-shrink:0">' + sec + 's</span>';
              h += '</div>';
              if (!a.correct) {
                h += '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:5px">';
                h += '<div>' + t("youWrote") + ' <b style="color:var(--danger)">' + esc(a.userAnswer || "(empty)") + '</b></div>';
                h += '<div>' + t("correctAnswer") + ' <b style="color:var(--ok)">' + esc(s.mode === "bn_en" ? w.en : w.bn.join(", ")) + '</b></div>';
                h += '</div>';
              }
              h += '</div>';
            });
            h += '</div>';
          }

          h += '</article>';
        });
        h += '</div>';
      }

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
      expandedId = null;
      toast(t("historyCleared"));
      render();
    } catch (e) {
      toast("Error clearing history");
    }
  }

  async function deleteSession(id) {
    var ok = await confirmDialog(t("deleteSession"));
    if (!ok) return;
    try {
      await M.dbDeleteSession(id);
      if (M.sessions && Array.isArray(M.sessions)) {
        var idx = M.sessions.findIndex(function (s) { return s.id === id; });
        if (idx >= 0) M.sessions.splice(idx, 1);
      }
      if (expandedId === id) expandedId = null;
      toast(t("sessionDeleted"));
      render();
    } catch (e) {
      toast("Error deleting session");
    }
  }

  function handleClick(e) {
    // Delete button — check FIRST (before session tap)
    var actEl = e.target.closest("[data-act]");
    if (actEl) {
      var a = actEl.dataset.act;
      if (a === "history-clear") { clearHistory(); return true; }
      if (a === "delete-session") {
        deleteSession(actEl.dataset.id);
        return true;
      }
    }

    // Filter chip
    var filt = e.target.closest("[data-filter]");
    if (filt) {
      filterRange = filt.dataset.filter;
      render();
      return true;
    }

    // Session card tap (expand)
    var card = e.target.closest("[data-session]");
    if (card) {
      var sid = card.dataset.session;
      expandedId = expandedId === sid ? null : sid;
      render();
      return true;
    }

    return false;
  }

  window.History = {
    open: function () {
      filterRange = "all";
      expandedId = null;
      render();
    },
    handleClick: handleClick
  };

  document.addEventListener("click", function (e) {
    if (handleClick(e)) {
      e.stopPropagation();
    }
  }, true);

})();
