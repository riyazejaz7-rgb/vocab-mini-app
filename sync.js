/* ============================================================
   Vocabulary Mini App — sync.js
   Phase 5: Telegram login + cloud sync
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.APP_CONFIG || {};
  var SUPABASE_URL = CFG.SUPABASE_URL;
  var SUPABASE_KEY = CFG.SUPABASE_PUBLISHABLE_KEY;
  var FN_URL = SUPABASE_URL + "/functions/v1/telegram-login";
  var REST_URL = SUPABASE_URL + "/rest/v1";

  var state = {
    userId: null,
    accessToken: null,
    refreshToken: null,
    email: null,
    status: "idle", // idle | syncing | ok | error | offline
    lastSyncAt: 0,
    errorMsg: ""
  };

  var listeners = [];
  function emit() {
    listeners.forEach(function (fn) { try { fn(state); } catch (e) {} });
  }
  function subscribe(fn) {
    listeners.push(fn);
    fn(state);
    return function () {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  /* ---------- Storage for session ---------- */
  function saveSession() {
    try {
      localStorage.setItem("vocab_sync_session", JSON.stringify({
        userId: state.userId,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        email: state.email,
        lastSyncAt: state.lastSyncAt
      }));
    } catch (e) {}
  }
  function loadSession() {
    try {
      var raw = localStorage.getItem("vocab_sync_session");
      if (!raw) return;
      var s = JSON.parse(raw);
      state.userId = s.userId || null;
      state.accessToken = s.accessToken || null;
      state.refreshToken = s.refreshToken || null;
      state.email = s.email || null;
      state.lastSyncAt = s.lastSyncAt || 0;
    } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem("vocab_sync_session"); } catch (e) {}
    state.userId = null;
    state.accessToken = null;
    state.refreshToken = null;
    state.email = null;
    state.lastSyncAt = 0;
    emit();
  }

  /* ---------- Telegram initData ---------- */
  function getInitData() {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (!tg || !tg.initData) return null;
    return tg.initData;
  }

  /* ---------- Login via Edge Function ---------- */
  async function login() {
    var initData = getInitData();
    if (!initData) {
      state.status = "error";
      state.errorMsg = "Not in Telegram";
      emit();
      return false;
    }

    state.status = "syncing";
    emit();

    try {
      var res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + SUPABASE_KEY
        },
        body: JSON.stringify({ initData: initData })
      });
      var data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Login failed");
      }

      state.userId = data.user_id;
      state.email = data.email;

      // Exchange magic link token_hash for actual session
      var verifyRes = await fetch(SUPABASE_URL + "/auth/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
          type: "magiclink",
          token_hash: data.token_hash
        })
      });
      var verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.access_token) {
        throw new Error("Session exchange failed");
      }

      state.accessToken = verifyData.access_token;
      state.refreshToken = verifyData.refresh_token;
      state.status = "ok";
      state.errorMsg = "";
      saveSession();
      emit();
      return true;
    } catch (e) {
      console.error("Login error", e);
      state.status = "error";
      state.errorMsg = String(e.message || e);
      emit();
      return false;
    }
  }

  /* ---------- Refresh token ---------- */
  async function refreshSession() {
    if (!state.refreshToken) return false;
    try {
      var res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({ refresh_token: state.refreshToken })
      });
      var d = await res.json();
      if (d.access_token) {
        state.accessToken = d.access_token;
        state.refreshToken = d.refresh_token || state.refreshToken;
        saveSession();
        return true;
      }
    } catch (e) {}
    return false;
  }

  /* ---------- Authenticated fetch to REST ---------- */
  async function api(method, path, body) {
    if (!state.accessToken) return { ok: false, status: 401, data: null };

    var doFetch = async function () {
      return fetch(REST_URL + path, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + state.accessToken,
          "Prefer": method === "POST" ? "return=representation,resolution=merge-duplicates" : "return=representation"
        },
        body: body ? JSON.stringify(body) : undefined
      });
    };

    var res = await doFetch();
    if (res.status === 401) {
      var refreshed = await refreshSession();
      if (refreshed) res = await doFetch();
    }
    if (!res.ok) {
      var txt = await res.text();
      console.error("API error", res.status, txt);
      return { ok: false, status: res.status, data: null };
    }
    var data = null;
    try { data = await res.json(); } catch (e) {}
    return { ok: true, status: res.status, data: data };
  }

  /* ---------- Push local words to cloud ---------- */
  async function pushWords(words) {
    if (!state.accessToken || !words.length) return { pushed: 0, error: null };

    var rows = words.map(function (w) {
      return {
        id: w.id,
        user_id: state.userId,
        no: w.no,
        en: w.en,
        bn: w.bn || [],
        syn: w.syn || [],
        ant: w.ant || [],
        pos: w.pos || "",
        ex: w.ex || "",
        note: w.note || "",
        practiced: !!w.practiced,
        correct_count: w.correctCount || 0,
        wrong_count: w.wrongCount || 0,
        last_practiced: w.lastPracticed ? new Date(w.lastPracticed).toISOString() : null,
        created_at: new Date(w.created || Date.now()).toISOString(),
        updated_at: new Date(w.updated || Date.now()).toISOString(),
        deleted_at: w.deleted ? new Date(w.deleted).toISOString() : null
      };
    });

    var res = await api("POST", "/words", rows);
    if (!res.ok) return { pushed: 0, error: "Push failed " + res.status };
    return { pushed: rows.length, error: null };
  }

  /* ---------- Pull cloud words ---------- */
  async function pullWords() {
    if (!state.accessToken) return { words: [], error: "Not logged in" };
    var res = await api("GET", "/words?select=*&order=no.asc");
    if (!res.ok) return { words: [], error: "Pull failed " + res.status };
    var rows = res.data || [];
    var words = rows.map(function (r) {
      return {
        id: r.id,
        no: r.no,
        en: r.en,
        bn: r.bn || [],
        syn: r.syn || [],
        ant: r.ant || [],
        pos: r.pos || "",
        ex: r.ex || "",
        note: r.note || "",
        practiced: !!r.practiced,
        correctCount: r.correct_count || 0,
        wrongCount: r.wrong_count || 0,
        lastPracticed: r.last_practiced ? new Date(r.last_practiced).getTime() : 0,
        created: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
        updated: r.updated_at ? new Date(r.updated_at).getTime() : 0,
        deleted: r.deleted_at ? new Date(r.deleted_at).getTime() : null
      };
    });
    return { words: words, error: null };
  }

  /* ---------- Push sessions ---------- */
  async function pushSessions(sessions) {
    if (!state.accessToken || !sessions.length) return { pushed: 0, error: null };
    var rows = sessions.map(function (s) {
      return {
        id: s.id,
        user_id: state.userId,
        date: new Date(s.date).toISOString(),
        mode: s.mode,
        total: s.total,
        correct: s.correct,
        duration_ms: s.durationMs || 0,
        answers: s.answers || []
      };
    });
    var res = await api("POST", "/sessions", rows);
    if (!res.ok) return { pushed: 0, error: "Sessions push failed " + res.status };
    return { pushed: rows.length, error: null };
  }

  async function pullSessions() {
    if (!state.accessToken) return { sessions: [], error: "Not logged in" };
    var res = await api("GET", "/sessions?select=*&order=date.desc&limit=500");
    if (!res.ok) return { sessions: [], error: "Sessions pull failed " + res.status };
    return { sessions: res.data || [], error: null };
  }

  /* ---------- Push reviews ---------- */
  async function pushReviews(reviews) {
    if (!state.accessToken) return { pushed: 0, error: null };
    var list = Object.keys(reviews || {}).map(function (k) { return reviews[k]; });
    if (!list.length) return { pushed: 0, error: null };
    var rows = list.map(function (r) {
      return {
        word_id: r.wordId,
        user_id: state.userId,
        box: r.box || 0,
        last_review: r.lastReview ? new Date(r.lastReview).toISOString() : null,
        next_review: r.nextReview ? new Date(r.nextReview).toISOString() : null,
        correct_streak: r.correctStreak || 0,
        days: r.days || {},
        updated_at: new Date().toISOString()
      };
    });
    var res = await api("POST", "/reviews", rows);
    if (!res.ok) return { pushed: 0, error: "Reviews push failed " + res.status };
    return { pushed: rows.length, error: null };
  }

  async function pullReviews() {
    if (!state.accessToken) return { reviews: {}, error: "Not logged in" };
    var res = await api("GET", "/reviews?select=*");
    if (!res.ok) return { reviews: {}, error: "Reviews pull failed " + res.status };
    var map = {};
    (res.data || []).forEach(function (r) {
      map[r.word_id] = {
        wordId: r.word_id,
        box: r.box || 0,
        lastReview: r.last_review ? new Date(r.last_review).getTime() : 0,
        nextReview: r.next_review ? new Date(r.next_review).getTime() : 0,
        correctStreak: r.correct_streak || 0,
        days: r.days || {}
      };
    });
    return { reviews: map, error: null };
  }

  /* ---------- Full sync ---------- */
  async function fullSync(localData) {
    if (!state.accessToken) return { error: "Not logged in" };
    state.status = "syncing";
    emit();

    try {
      // 1. Push local
      var pushWordsRes = await pushWords(localData.words || []);
      var pushSessionsRes = await pushSessions(localData.sessions || []);
      var pushReviewsRes = await pushReviews(localData.reviews || {});

      // 2. Pull cloud
      var pullWordsRes = await pullWords();
      var pullSessionsRes = await pullSessions();
      var pullReviewsRes = await pullReviews();

      state.status = "ok";
      state.lastSyncAt = Date.now();
      state.errorMsg = "";
      saveSession();
      emit();

      return {
        error: null,
        words: pullWordsRes.words,
        sessions: pullSessionsRes.sessions,
        reviews: pullReviewsRes.reviews,
        pushed: {
          words: pushWordsRes.pushed,
          sessions: pushSessionsRes.pushed,
          reviews: pushReviewsRes.pushed
        }
      };
    } catch (e) {
      console.error("Sync error", e);
      state.status = "error";
      state.errorMsg = String(e.message || e);
      emit();
      return { error: state.errorMsg };
    }
  }

  /* ---------- Auto init ---------- */
  async function init() {
    loadSession();
    if (state.userId && state.accessToken) {
      state.status = "ok";
      emit();
      return true;
    }
    return login();
  }

  /* ---------- Public API ---------- */
  window.VocabSync = {
    init: init,
    login: login,
    logout: function () {
      clearSession();
      state.status = "idle";
      emit();
    },
    fullSync: fullSync,
    subscribe: subscribe,
    getState: function () { return state; }
  };

})();
