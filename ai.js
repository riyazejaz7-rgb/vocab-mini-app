/* ============================================================
   Vocabulary Mini App — ai.js
   Phase 6: AI client (via Supabase Edge Function proxy)
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.APP_CONFIG || {};
  var SUPABASE_URL = CFG.SUPABASE_URL;
  var SUPABASE_KEY = CFG.SUPABASE_PUBLISHABLE_KEY;
  var FN_URL = SUPABASE_URL + "/functions/v1/ai-proxy";

  var state = {
    lastUsage: 0,
    lastLimit: 100,
    loading: false,
    lastError: ""
  };

  function emit() {
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("vocab-ai-state", { detail: state }));
    }
  }

  function getToken() {
    if (!window.VocabSync) return null;
    return window.VocabSync.getState().accessToken;
  }

  async function call(action, payload) {
    var token = getToken();
    if (!token) {
      return { ok: false, error: "not_logged_in", message: "Cloud sync login required for AI" };
    }

    state.loading = true;
    state.lastError = "";
    emit();

    try {
      var res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify(Object.assign({ action: action }, payload || {}))
      });

      var data = await res.json().catch(function () { return null; });

      if (!res.ok) {
        var msg = (data && (data.message || data.error)) || ("HTTP " + res.status);
        state.lastError = msg;
        state.loading = false;
        emit();

        if (res.status === 429) {
          return { ok: false, error: "quota_exceeded", message: msg, used: data.used, limit: data.limit };
        }
        return { ok: false, error: "server", message: msg };
      }

      state.lastUsage = data.used || 0;
      state.lastLimit = data.limit || 100;
      state.loading = false;
      emit();

      return { ok: true, data: data.data || {}, used: state.lastUsage, limit: state.lastLimit };

    } catch (e) {
      state.loading = false;
      state.lastError = String(e.message || e);
      emit();
      return { ok: false, error: "network", message: state.lastError };
    }
  }

  window.VocabAI = {
    getState: function () { return state; },

    fillWord: function (en) {
      return call("word", { en: en });
    },

    makeSentence: function (en, bn) {
      return call("sentence", { en: en, bn: bn });
    },

    getFeedback: function (en, correct, userAnswer, question) {
      return call("feedback", { en: en, correct: correct, userAnswer: userAnswer, question: question });
    }
  };

})();
