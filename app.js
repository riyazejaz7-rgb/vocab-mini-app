(function () {
  "use strict";

  var tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    try { tg.ready(); tg.expand(); } catch (e) { /* ignore */ }
  }

  var list = document.getElementById("checks");
  var again = document.getElementById("again");
  var BADGE = { ok: "OK", warn: "Check", fail: "Problem", info: "Look" };

  function add(label, status, detail) {
    var li = document.createElement("li");
    li.className = "check " + status;
    var head = document.createElement("div");
    head.className = "head";
    var name = document.createElement("span");
    name.className = "name";
    name.textContent = label;
    var badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = BADGE[status];
    head.appendChild(name);
    head.appendChild(badge);
    var d = document.createElement("p");
    d.className = "detail";
    d.textContent = detail;
    li.appendChild(head);
    li.appendChild(d);
    list.appendChild(li);
  }

  function checkTelegram() {
    if (!tg) {
      add("Telegram", "warn", "The Telegram script did not load. Check your internet connection.");
    } else if (!tg.initData) {
      add("Telegram", "warn", "This looks like a normal browser. Open the app from your bot inside Telegram to test it properly.");
    } else {
      var u = tg.initDataUnsafe && tg.initDataUnsafe.user;
      var who = u && u.first_name ? " as " + u.first_name : "";
      var plat = tg.platform ? " (" + tg.platform + ")" : "";
      add("Telegram", "ok", "Opened inside Telegram" + plat + who + ". This name is for display only. It is not verified until login is built.");
    }
  }

  function checkConfig() {
    var c = window.APP_CONFIG;
    if (!c || !c.SUPABASE_URL || !c.SUPABASE_PUBLISHABLE_KEY) {
      add("Settings file", "fail", "config.js is missing or incomplete.");
      return null;
    }
    add("Settings file", "ok", "config.js loaded. Time zone: " + c.TIME_ZONE + ".");
    return c;
  }

  function checkSupabase(c) {
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 8000);
    return fetch(c.SUPABASE_URL + "/auth/v1/health", {
      headers: { apikey: c.SUPABASE_PUBLISHABLE_KEY },
      signal: ctl.signal
    }).then(function (r) {
      if (r.ok) {
        add("Supabase", "ok", "The project answered. Nothing is stored there yet.");
      } else {
        add("Supabase", "warn", "The server answered with status " + r.status + ". If the project is paused, restore it in the Supabase dashboard.");
      }
    }).catch(function () {
      add("Supabase", "fail", "Could not reach Supabase. You may be offline, or the project may be paused. Restore it in the Supabase dashboard.");
    }).then(function () { clearTimeout(timer); });
  }

  function checkIndexedDB() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) {
        add("Offline storage", "fail", "This browser has no IndexedDB, so offline use would not work.");
        return resolve();
      }
      var req;
      try { req = indexedDB.open("vocab_probe", 1); } catch (e) {
        add("Offline storage", "fail", "IndexedDB is blocked in this browser.");
        return resolve();
      }
      req.onupgradeneeded = function () { req.result.createObjectStore("t"); };
      req.onsuccess = function () {
        req.result.close();
        indexedDB.deleteDatabase("vocab_probe");
        add("Offline storage", "ok", "IndexedDB works.");
        resolve();
      };
      req.onerror = function () {
        add("Offline storage", "fail", "IndexedDB could not be opened.");
        resolve();
      };
    });
  }

  function checkPersist() {
    if (!(navigator.storage && navigator.storage.persist)) {
      add("Storage protection", "warn", "This browser cannot protect stored data from being cleared. Regular backups matter.");
      return Promise.resolve();
    }
    return navigator.storage.persisted().then(function (already) {
      return already || navigator.storage.persist();
    }).then(function (granted) {
      if (granted) {
        add("Storage protection", "ok", "Stored data is marked as protected from automatic clearing.");
      } else {
        add("Storage protection", "warn", "The browser did not protect stored data. It could be cleared, so regular backups matter.");
      }
    }).catch(function () {
      add("Storage protection", "warn", "Could not check storage protection.");
    });
  }

  function checkBengali() {
    add("Bengali text", "info", "বাংলা লেখা ঠিকভাবে দেখা যাচ্ছে? If you see boxes or broken letters, tell me.");
  }

  function run() {
    list.textContent = "";
    checkTelegram();
    var c = checkConfig();
    checkBengali();
    var jobs = [checkIndexedDB(), checkPersist()];
    if (c) jobs.push(checkSupabase(c));
    return Promise.all(jobs);
  }

  document.getElementById("build").textContent = "Build: phase-1 shell";
  again.addEventListener("click", run);
  run();
})();
