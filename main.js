/* ============================================================
   Vocabulary Mini App — main.js
   Local-first word manager with IndexedDB
   Phase 3a: Recent/New/Wrong filters + Practice tab handle
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Telegram WebApp ---------- */
  var tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor("#0d9488");
      if (tg.setBackgroundColor) tg.setBackgroundColor("#ffffff");
    } catch (e) {}
  }

  var CFG = window.APP_CONFIG || {};
  var TZ = CFG.TIME_ZONE || "Asia/Dhaka";

  /* ---------- Translations ---------- */
  var L = {
    en: {
      words: "Words", trash: "Trash", tools: "Tools", practice: "Practice",
      add: "Add word", edit: "Edit word",
      search: "Search words…", all: "All",
      recent: "Recent", new_words: "New", wrong_words: "Wrong",
      noWords: "No words yet", noWordsSub: "Tap + to add your first word.",
      noMatch: "No matches found",
      emptyTrash: "Trash is empty", emptyTrashSub: "Deleted words appear here.",
      trashHint: "Items stay here until you empty the trash.",
      en_word: "English word", bn_meaning: "Bengali meaning(s)",
      bn_hint: "Separate multiple meanings with commas",
      synonyms: "Synonyms", antonyms: "Antonyms",
      pos: "Part of speech", example: "Example sentence", notes: "Notes",
      optional: "optional",
      save: "Save", cancel: "Cancel", saveChanges: "Save changes",
      del: "Delete", delForever: "Delete forever", restore: "Restore",
      confirmDel: "Move this word to Trash?",
      confirmDelForever: "Delete this word forever? This cannot be undone.",
      confirmEmptyTrash: "Delete everything in Trash forever?",
      saved: "Saved", restored: "Restored", deleted: "Moved to trash",
      permDeleted: "Deleted permanently", trashEmptied: "Trash emptied",
      needEn: "Enter the English word",
      needBn: "Enter at least one Bengali meaning",
      dupTitle: "Already exists",
      dup: "This word is already saved as #{no}.",
      dupTrash: "This word is in Trash (#{no}). Restore it from there.",
      total: "Total", today: "Today",
      exportTitle: "Backup & export",
      exportDesc: "Save a copy of your words. Keep it safe.",
      backupJson: "Backup (JSON)", exportCsv: "Export (CSV)",
      copy: "Copy", download: "Download", copied: "Copied",
      importTitle: "Import & restore",
      importDesc: "Paste lines like: english - bengali. Or a backup JSON.",
      importPlaceholder: "abandon - পরিত্যাগ করা\nreluctant - অনিচ্ছুক, দ্বিধান্বিত",
      chooseFile: "Choose file", replaceAll: "Replace everything",
      importBtn: "Import",
      importResult: "Added: {a}. Skipped: {s}.",
      restoreResult: "Added: {a}. Updated: {u}. Skipped: {s}.",
      badInput: "Could not read that input",
      backupNever: "You haven't backed up yet",
      backupNeverSub: "Export now to protect your words.",
      backupOld: "Last backup: {n} days ago",
      backupToday: "Last backup: today",
      backupNow: "Backup now",
      confirmReplace1: "Replace ALL words with this backup? Your current words will be removed.",
      confirmReplace2: "Are you sure? This cannot be undone.",
      pos_none: "(none)", pos_noun: "noun", pos_verb: "verb",
      pos_adjective: "adjective", pos_adverb: "adverb",
      pos_preposition: "preposition", pos_conjunction: "conjunction",
      pos_pronoun: "pronoun", pos_interjection: "interjection", pos_other: "other",
      practiceComingSoon: "Practice coming soon",
      practiceComingSoonSub: "Refresh the app to load practice mode.",
      practiceNoWords: "Add at least 4 words to start practicing.",
      practiceNoWordsSub: "Tap + on the Words tab.",
      practiceSetup: "Practice setup",
      mode: "Mode", mode_bn_en: "বাংলা → English", mode_en_bn: "English → বাংলা", mode_fill: "Fill blanks",
      questionCount: "Number of questions",
      wordSource: "Which words",
      source_all: "All words", source_new: "New words", source_wrong: "Wrong words",
      startPractice: "Start practice",
      check: "Check", next: "Next", finish: "Finish",
      correctLabel: "Correct!", wrongLabel: "Not quite",
      correctAnswerWas: "Correct answer:",
      yourAnswer: "Your answer",
      typeYourAnswer: "Type your answer…",
      questionOf: "Question {n} of {total}",
      resultGreat: "Excellent!", resultGood: "Good job!", resultOk: "Keep practicing",
      youGot: "You got {c} out of {t} correct",
      accuracy: "Accuracy",
      tryAgain: "Try again", done: "Done",
      notEnoughWords: "Need at least 4 words to practice"
    },
    bn: {
      words: "শব্দ", trash: "ট্র্যাশ", tools: "টুলস", practice: "প্র্যাকটিস",
      add: "শব্দ যোগ", edit: "শব্দ সম্পাদনা",
      search: "শব্দ খুঁজুন…", all: "সব",
      recent: "সাম্প্রতিক", new_words: "নতুন", wrong_words: "ভুল",
      noWords: "এখনো কোনো শব্দ নেই", noWordsSub: "+ চাপুন প্রথম শব্দ যোগ করতে।",
      noMatch: "কোনো মিল পাওয়া যায়নি",
      emptyTrash: "ট্র্যাশ খালি", emptyTrashSub: "মুছে ফেলা শব্দ এখানে আসবে।",
      trashHint: "ট্র্যাশ খালি না করা পর্যন্ত শব্দ এখানে থাকবে।",
      en_word: "ইংরেজি শব্দ", bn_meaning: "বাংলা অর্থ",
      bn_hint: "একাধিক অর্থ কমা দিয়ে আলাদা করুন",
      synonyms: "সমার্থক শব্দ", antonyms: "বিপরীত শব্দ",
      pos: "পদ", example: "উদাহরণ বাক্য", notes: "নোট",
      optional: "ঐচ্ছিক",
      save: "সংরক্ষণ", cancel: "বাতিল", saveChanges: "পরিবর্তন সংরক্ষণ",
      del: "মুছুন", delForever: "চিরতরে মুছুন", restore: "ফিরিয়ে আনুন",
      confirmDel: "এই শব্দ ট্র্যাশে পাঠাবেন?",
      confirmDelForever: "এই শব্দ চিরতরে মুছবেন? ফেরানো যাবে না।",
      confirmEmptyTrash: "ট্র্যাশের সব শব্দ চিরতরে মুছবেন?",
      saved: "সংরক্ষিত", restored: "ফিরিয়ে আনা হয়েছে", deleted: "ট্র্যাশে পাঠানো হয়েছে",
      permDeleted: "চিরতরে মুছে ফেলা হয়েছে", trashEmptied: "ট্র্যাশ খালি করা হয়েছে",
      needEn: "ইংরেজি শব্দ লিখুন",
      needBn: "অন্তত একটি বাংলা অর্থ লিখুন",
      dupTitle: "আগে থেকেই আছে",
      dup: "এই শব্দ আগেই সংরক্ষিত আছে #{no} হিসেবে।",
      dupTrash: "এই শব্দ ট্র্যাশে আছে (#{no})। সেখান থেকে ফিরিয়ে আনুন।",
      total: "মোট", today: "আজ",
      exportTitle: "ব্যাকআপ ও এক্সপোর্ট",
      exportDesc: "আপনার শব্দের একটি কপি সংরক্ষণ করুন।",
      backupJson: "ব্যাকআপ (JSON)", exportCsv: "এক্সপোর্ট (CSV)",
      copy: "কপি", download: "ডাউনলোড", copied: "কপি হয়েছে",
      importTitle: "ইমপোর্ট ও রিস্টোর",
      importDesc: "লিখুন: english - বাংলা অর্থ। অথবা ব্যাকআপ JSON পেস্ট করুন।",
      importPlaceholder: "abandon - পরিত্যাগ করা\nreluctant - অনিচ্ছুক, দ্বিধান্বিত",
      chooseFile: "ফাইল বেছে নিন", replaceAll: "সব বদলে দিন",
      importBtn: "ইমপোর্ট",
      importResult: "যোগ: {a}। বাদ: {s}।",
      restoreResult: "যোগ: {a}। হালনাগাদ: {u}। বাদ: {s}।",
      badInput: "ইনপুট পড়া যায়নি",
      backupNever: "এখনো ব্যাকআপ নেননি",
      backupNeverSub: "শব্দ রক্ষা করতে এখনই এক্সপোর্ট করুন।",
      backupOld: "শেষ ব্যাকআপ: {n} দিন আগে",
      backupToday: "শেষ ব্যাকআপ: আজ",
      backupNow: "ব্যাকআপ নিন",
      confirmReplace1: "সব শব্দ এই ব্যাকআপ দিয়ে বদলাবেন? বর্তমান শব্দ মুছে যাবে।",
      confirmReplace2: "নিশ্চিত? এটি ফেরানো যাবে না।",
      pos_none: "(নেই)", pos_noun: "বিশেষ্য", pos_verb: "ক্রিয়া",
      pos_adjective: "বিশেষণ", pos_adverb: "ক্রিয়া-বিশেষণ",
      pos_preposition: "পূর্বসর্গ", pos_conjunction: "সংযোজক",
      pos_pronoun: "সর্বনাম", pos_interjection: "আবেগসূচক", pos_other: "অন্যান্য",
      practiceComingSoon: "প্র্যাকটিস শীঘ্রই আসছে",
      practiceComingSoonSub: "অ্যাপ রিফ্রেশ করুন প্র্যাকটিস মোড লোড করতে।",
      practiceNoWords: "অন্তত ৪টি শব্দ যোগ করুন প্র্যাকটিস শুরু করতে।",
      practiceNoWordsSub: "শব্দ ট্যাবে + চাপুন।",
      practiceSetup: "প্র্যাকটিস সেটআপ",
      mode: "মোড", mode_bn_en: "বাংলা → English", mode_en_bn: "English → বাংলা", mode_fill: "ফাঁকা পূরণ",
      questionCount: "প্রশ্ন সংখ্যা",
      wordSource: "কোন শব্দ",
      source_all: "সব শব্দ", source_new: "নতুন শব্দ", source_wrong: "ভুল শব্দ",
      startPractice: "প্র্যাকটিস শুরু",
      check: "যাচাই", next: "পরবর্তী", finish: "শেষ",
      correctLabel: "সঠিক!", wrongLabel: "সঠিক হয়নি",
      correctAnswerWas: "সঠিক উত্তর:",
      yourAnswer: "আপনার উত্তর",
      typeYourAnswer: "উত্তর লিখুন…",
      questionOf: "প্রশ্ন {n} / {total}",
      resultGreat: "অসাধারণ!", resultGood: "ভালো করেছ!", resultOk: "আরো প্র্যাকটিস কর",
      youGot: "{t}টির মধ্যে {c}টি সঠিক",
      accuracy: "নির্ভুলতা",
      tryAgain: "আবার চেষ্টা", done: "সম্পন্ন",
      notEnoughWords: "প্র্যাকটিসের জন্য অন্তত ৪টি শব্দ দরকার"
    }
  };

  var POS = ["", "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "interjection", "other"];

  /* ---------- State ---------- */
  var lang = localStorage.getItem("vocab_lang") === "bn" ? "bn" : "en";
  var words = [];
  var db = null;
  var view = "words";
  var editingId = null;
  var query = "";
  var filterPos = "";
  var filterSource = localStorage.getItem("vocab_filter_source") || "";
  var lastBackup = 0;
  var exportBuf = { text: "", kind: "" };

  /* ---------- Helpers ---------- */
  function t(key, args) {
    var s = (L[lang] && L[lang][key]) || L.en[key] || key;
    if (args) s = s.replace(/\{(\w+)\}/g, function (_, k) { return args[k] != null ? args[k] : ""; });
    return s;
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }
  function splitList(s) {
    return String(s || "").split(/[,;،]+/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function uid() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() :
      "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }
  function daysSince(ts) {
    return Math.floor((Date.now() - ts) / 86400000);
  }
  function toast(msg, ms) {
    var el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, ms || 2200);
  }
  function confirmDialog(msg) {
    return new Promise(function (resolve) {
      var dlg = $("dialog");
      var msgEl = $("dialog-msg");
      var okBtn = $("dialog-ok");
      var cancelBtn = $("dialog-cancel");
      msgEl.textContent = msg;
      dlg.classList.remove("hidden");
      function cleanup() {
        dlg.classList.add("hidden");
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
      }
      function onOk() { cleanup(); resolve(true); }
      function onCancel() { cleanup(); resolve(false); }
      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
    });
  }

  /* ---------- IndexedDB ---------- */
  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open("vocab_db", 1);
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains("words")) {
          d.createObjectStore("words", { keyPath: "id" });
        }
        if (!d.objectStoreNames.contains("meta")) {
          d.createObjectStore("meta", { keyPath: "k" });
        }
      };
      req.onsuccess = function () { db = req.result; resolve(); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function txStore(name, mode, fn) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(name, mode);
      var store = tx.objectStore(name);
      var result = fn(store);
      tx.oncomplete = function () { resolve(result && result.result); };
      tx.onerror = tx.onabort = function () { reject(tx.error); };
    });
  }
  function dbGetAllWords() {
    return txStore("words", "readonly", function (s) { return s.getAll(); });
  }
  function dbPutWord(w) {
    return txStore("words", "readwrite", function (s) { s.put(w); });
  }
  function dbPutWords(ws) {
    return txStore("words", "readwrite", function (s) {
      ws.forEach(function (w) { s.put(w); });
    });
  }
  function dbDeleteWord(id) {
    return txStore("words", "readwrite", function (s) { s.delete(id); });
  }
  function dbClearWords() {
    return txStore("words", "readwrite", function (s) { s.clear(); });
  }
  function metaGet(k) {
    return txStore("meta", "readonly", function (s) { return s.get(k); })
      .then(function (r) { return r ? r.v : undefined; });
  }
  function metaSet(k, v) {
    return txStore("meta", "readwrite", function (s) { s.put({ k: k, v: v }); });
  }
  async function getNextNo() {
    var n = (await metaGet("nextNo")) || 1;
    await metaSet("nextNo", n + 1);
    return n;
  }
  async function fixNextNo() {
    var max = words.reduce(function (a, w) { return Math.max(a, w.no || 0); }, 0);
    var cur = (await metaGet("nextNo")) || 1;
    if (cur <= max) await metaSet("nextNo", max + 1);
  }
  function findDuplicate(en, exceptId) {
    var n = norm(en);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.id !== exceptId && norm(w.en) === n) return w;
    }
    return null;
  }
  function getWord(id) {
    for (var i = 0; i < words.length; i++) if (words[i].id === id) return words[i];
    return null;
  }

  /* ---------- Expose for practice.js ---------- */
  window.VocabMain = {
    get words() { return words; },
    get lang() { return lang; },
    t: t,
    esc: esc,
    uid: uid,
    toast: toast,
    confirmDialog: confirmDialog,
    dbPutWord: dbPutWord,
    metaGet: metaGet,
    metaSet: metaSet,
    setTitle: function (s) { var el = $("title"); if (el) el.textContent = s; },
    setActiveNav: function (k) {
      document.querySelectorAll(".navbtn").forEach(function (b) {
        b.classList.toggle("active", b.dataset.nav === k);
      });
    },
    showFab: function (show) {
      var f = $("fab"); if (f) f.classList.toggle("hidden", !show);
    },
    showBack: function (show) {
      var b = $("back"); if (b) b.classList.toggle("hidden", !show);
    },
    getAppEl: function () { return $("app"); },
    getFilterSource: function () { return filterSource; }
  };
/* ---------- Rendering — Words list ---------- */
function activeWords() {
  return words.filter(function (w) { return !w.deleted; });
}
function trashWords() {
  return words.filter(function (w) { return w.deleted; })
    .sort(function (a, b) { return a.deleted - b.deleted; });
}
function matches(w) {
  if (filterPos && w.pos !== filterPos) return false;
  if (filterSource === "recent") {
    if (!w.created) return false;
    var daysOld = (Date.now() - w.created) / 86400000;
    if (daysOld > 7) return false;
  } else if (filterSource === "new") {
    if (w.practiced) return false;
  } else if (filterSource === "wrong") {
    if (!w.wrongCount || w.wrongCount < 1) return false;
  }
  if (!query) return true;
  var q = query.toLowerCase();
  return (w.en && w.en.toLowerCase().indexOf(q) > -1) ||
    (w.bn && w.bn.join(" ").toLowerCase().indexOf(q) > -1) ||
    (w.syn && w.syn.join(" ").toLowerCase().indexOf(q) > -1) ||
    (w.ant && w.ant.join(" ").toLowerCase().indexOf(q) > -1) ||
    (w.note && w.note.toLowerCase().indexOf(q) > -1);
}
function posLabel(p) {
  return p ? t("pos_" + p) : "";
}

function renderWords() {
  var list = activeWords().filter(matches).sort(function (a, b) { return a.no - b.no; });
  var total = activeWords().length;
  var today = activeWords().filter(function (w) {
    return w.created && daysSince(w.created) < 1;
  }).length;
  var recentCount = activeWords().filter(function (w) {
    return w.created && (Date.now() - w.created) / 86400000 <= 7;
  }).length;
  var newCount = activeWords().filter(function (w) { return !w.practiced; }).length;
  var wrongCount = activeWords().filter(function (w) { return w.wrongCount && w.wrongCount > 0; }).length;

  var html = "";

  html += '<div class="stats">';
  html += '<div class="stat"><span class="n">' + total + '</span><span class="l">' + t("total") + '</span></div>';
  html += '<div class="stat"><span class="n">' + today + '</span><span class="l">' + t("today") + '</span></div>';
  html += '</div>';

  if (total > 0) {
    var b = lastBackup;
    if (!b) {
      html += '<div class="banner warn"><span>' + t("backupNever") + ' — ' + t("backupNeverSub") + '</span><button data-act="backup-now">' + t("backupNow") + '</button></div>';
    } else if (daysSince(b) > 7) {
      html += '<div class="banner warn"><span>' + t("backupOld", { n: daysSince(b) }) + '</span><button data-act="backup-now">' + t("backupNow") + '</button></div>';
    }
  }

  html += '<div class="searchbar"><input id="search" type="search" placeholder="' + esc(t("search")) + '" value="' + esc(query) + '" autocomplete="off"></div>';

  if (total > 0) {
    html += '<div class="chips">';
    html += '<button data-source="" class="' + (filterSource === "" ? "on" : "") + '">' + t("all") + '</button>';
    if (recentCount > 0) {
      html += '<button data-source="recent" class="' + (filterSource === "recent" ? "on" : "") + '">' + t("recent") + ' (' + recentCount + ')</button>';
    }
    if (newCount > 0) {
      html += '<button data-source="new" class="' + (filterSource === "new" ? "on" : "") + '">' + t("new_words") + ' (' + newCount + ')</button>';
    }
    if (wrongCount > 0) {
      html += '<button data-source="wrong" class="' + (filterSource === "wrong" ? "on" : "") + '">' + t("wrong_words") + ' (' + wrongCount + ')</button>';
    }
    if (filterPos || recentCount > 0 || newCount > 0 || wrongCount > 0) {
      html += '<span style="width:1px;background:var(--border);margin:6px 2px;flex-shrink:0"></span>';
    }
    POS.slice(1).forEach(function (p) {
      var count = activeWords().filter(function (w) { return w.pos === p; }).length;
      if (count === 0) return;
      html += '<button data-filter="' + p + '" class="' + (filterPos === p ? "on" : "") + '">' + posLabel(p) + ' (' + count + ')</button>';
    });
    html += '</div>';
  }

  if (!total) {
    html += emptyState("noWords", "noWordsSub");
  } else if (!list.length) {
    html += emptyState("noMatch", "");
  } else {
    html += list.map(renderWordCard).join("");
  }

  $("app").innerHTML = '<section class="view">' + html + '</section>';
  setTitle(t("words"));
  setActiveNav("words");
  showFab(true);
  showBack(false);
}

function renderWordCard(w) {
  var h = '<article class="card">';
  h += '<div class="card-head">';
  h += '<div>';
  h += '<span class="card-num">#' + w.no + '</span>';
  h += '<span class="card-en">' + esc(w.en) + '</span>';
  h += '</div>';
  if (w.pos) h += '<span class="card-pos">' + esc(posLabel(w.pos)) + '</span>';
  h += '</div>';
  if (w.bn && w.bn.length) {
    h += '<div class="card-bn">' + esc(w.bn.join(", ")) + '</div>';
  }
  if (w.syn && w.syn.length) {
    h += '<div class="card-meta"><b>' + t("synonyms") + ':</b> ' + esc(w.syn.join(", ")) + '</div>';
  }
  if (w.ant && w.ant.length) {
    h += '<div class="card-meta"><b>' + t("antonyms") + ':</b> ' + esc(w.ant.join(", ")) + '</div>';
  }
  if (w.ex) {
    h += '<div class="card-ex">' + esc(w.ex) + '</div>';
  }
  if (w.note) {
    h += '<div class="card-meta"><b>' + t("notes") + ':</b> ' + esc(w.note) + '</div>';
  }
  h += '<div class="card-actions">';
  h += '<button data-act="edit" data-id="' + w.id + '">' + t("edit") + '</button>';
  h += '<button data-act="del" data-id="' + w.id + '" class="danger">' + t("del") + '</button>';
  h += '</div>';
  h += '</article>';
  return h;
}

function emptyState(titleKey, subKey) {
  return '<div class="empty">' +
    '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">' +
    '<path d="M4 4h16v16H4z"/><path d="M8 10h8M8 14h5"/></svg>' +
    '<p class="title">' + t(titleKey) + '</p>' +
    (subKey ? '<p>' + t(subKey) + '</p>' : '') +
    '</div>';
}

/* ---------- Rendering — Add/Edit form ---------- */
function renderForm() {
  var w = editingId ? getWord(editingId) : null;
  var isEdit = !!w;
  var data = w || { en: "", bn: [], syn: [], ant: [], pos: "", ex: "", note: "" };

  var h = '<section class="view form">';

  h += '<label for="f_en">' + t("en_word") + '</label>';
  h += '<input id="f_en" type="text" value="' + esc(data.en) + '" autocomplete="off" autocapitalize="off" spellcheck="false">';

  h += '<label for="f_bn">' + t("bn_meaning") + '</label>';
  h += '<input id="f_bn" type="text" value="' + esc(data.bn.join(", ")) + '" autocomplete="off">';
  h += '<div class="hint">' + t("bn_hint") + '</div>';

  h += '<label for="f_pos">' + t("pos") + ' <span class="muted">(' + t("optional") + ')</span></label>';
  h += '<select id="f_pos">';
  POS.forEach(function (p) {
    h += '<option value="' + p + '"' + (p === data.pos ? " selected" : "") + '>' + (p ? posLabel(p) : t("pos_none")) + '</option>';
  });
  h += '</select>';

  h += '<label for="f_syn">' + t("synonyms") + ' <span class="muted">(' + t("optional") + ')</span></label>';
  h += '<input id="f_syn" type="text" value="' + esc(data.syn.join(", ")) + '" autocomplete="off">';

  h += '<label for="f_ant">' + t("antonyms") + ' <span class="muted">(' + t("optional") + ')</span></label>';
  h += '<input id="f_ant" type="text" value="' + esc(data.ant.join(", ")) + '" autocomplete="off">';

  h += '<label for="f_ex">' + t("example") + ' <span class="muted">(' + t("optional") + ')</span></label>';
  h += '<textarea id="f_ex" rows="2">' + esc(data.ex) + '</textarea>';

  h += '<label for="f_note">' + t("notes") + ' <span class="muted">(' + t("optional") + ')</span></label>';
  h += '<textarea id="f_note" rows="2">' + esc(data.note) + '</textarea>';

  h += '<div class="form-actions">';
  h += '<button type="button" data-act="form-cancel" class="btn-secondary">' + t("cancel") + '</button>';
  h += '<button type="button" data-act="form-save" class="btn-primary">' + (isEdit ? t("saveChanges") : t("save")) + '</button>';
  h += '</div>';

  h += '</section>';

  $("app").innerHTML = h;
  setTitle(isEdit ? t("edit") : t("add"));
  showFab(false);
  showBack(true);

  var first = $("f_en");
  if (first) setTimeout(function () { first.focus(); }, 100);
}

/* ---------- Rendering — Trash ---------- */
function renderTrash() {
  var list = trashWords();

  var h = '<section class="view">';

  if (!list.length) {
    h += emptyState("emptyTrash", "emptyTrashSub");
  } else {
    h += '<p class="muted" style="margin:0 0 14px;font-size:0.85rem">' + t("trashHint") + '</p>';
    h += list.map(function (w) {
      var d = daysSince(w.deleted);
      var label = d < 1 ? t("today") : t("backupOld", { n: d }).replace(/^.*?: /, "");
      return '<article class="card">' +
        '<div class="card-head"><div>' +
        '<span class="card-num">#' + w.no + '</span>' +
        '<span class="card-en">' + esc(w.en) + '</span>' +
        '</div></div>' +
        '<div class="card-bn">' + esc(w.bn.join(", ")) + '</div>' +
        '<div class="card-meta"><b>' + t("del") + ':</b> ' + esc(label) + '</div>' +
        '<div class="card-actions">' +
        '<button data-act="restore" data-id="' + w.id + '">' + t("restore") + '</button>' +
        '<button data-act="del-forever" data-id="' + w.id + '" class="danger">' + t("delForever") + '</button>' +
        '</div></article>';
    }).join("");
    h += '<div style="margin-top:20px"><button type="button" data-act="empty-trash" class="btn-secondary" style="width:100%;padding:14px;border-radius:14px;font-weight:700">' + t("confirmEmptyTrash").replace(/\?.*/, "") + '</button></div>';
  }
  h += '</section>';

  $("app").innerHTML = h;
  setTitle(t("trash"));
  setActiveNav("trash");
  showFab(false);
  showBack(false);
}

/* ---------- Rendering — Tools ---------- */
function renderTools() {
  var h = '<section class="view">';

  h += '<div class="section">';
  h += '<h2>' + t("exportTitle") + '</h2>';
  h += '<p class="desc">' + t("exportDesc") + '</p>';
  h += '<div class="row">';
  h += '<button data-act="export-json">' + t("backupJson") + '</button>';
  h += '<button data-act="export-csv">' + t("exportCsv") + '</button>';
  h += '</div>';
  if (exportBuf.text) {
    h += '<textarea id="export-out" readonly rows="6">' + esc(exportBuf.text) + '</textarea>';
    h += '<div class="row" style="margin-top:10px">';
    h += '<button data-act="copy-export" class="primary">' + t("copy") + '</button>';
    h += '<button data-act="download-export">' + t("download") + '</button>';
    h += '</div>';
  }
  h += '</div>';

  h += '<div class="section">';
  h += '<h2>' + t("importTitle") + '</h2>';
  h += '<p class="desc">' + t("importDesc") + '</p>';
  h += '<textarea id="import-in" rows="5" placeholder="' + esc(t("importPlaceholder")) + '"></textarea>';
  h += '<label style="display:block;margin:10px 0 6px;font-size:0.85rem">';
  h += '<input type="file" id="file-in" accept=".json,.csv,.txt" style="width:100%;padding:8px;font-size:0.85rem">';
  h += '</label>';
  h += '<label style="display:flex;align-items:center;gap:8px;font-size:0.9rem;margin:10px 0">';
  h += '<input type="checkbox" id="replace-in" style="width:auto"> ' + t("replaceAll");
  h += '</label>';
  h += '<div class="row">';
  h += '<button data-act="import-do" class="primary">' + t("importBtn") + '</button>';
  h += '</div>';
  h += '</div>';

  h += '</section>';

  $("app").innerHTML = h;
  setTitle(t("tools"));
  setActiveNav("tools");
  showFab(false);
  showBack(false);

  var fileInput = $("file-in");
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { $("import-in").value = r.result; };
      r.readAsText(f);
    });
  }
}

/* ---------- UI helpers ---------- */
function setTitle(s) { var el = $("title"); if (el) el.textContent = s; }
function setActiveNav(k) {
  document.querySelectorAll(".navbtn").forEach(function (b) {
    b.classList.toggle("active", b.dataset.nav === k);
  });
}
function showFab(show) {
  var f = $("fab"); if (f) f.classList.toggle("hidden", !show);
}
function showBack(show) {
  var b = $("back"); if (b) b.classList.toggle("hidden", !show);
}
function updateLangChip() {
  var c = $("lang-toggle");
  if (c) c.textContent = lang === "bn" ? "EN" : "বাং";
}
  /* ---------- Actions ---------- */
  async function saveWord() {
    var en = ($("f_en").value || "").trim();
    var bn = splitList($("f_bn").value);
    var pos = $("f_pos").value;
    var syn = splitList($("f_syn").value);
    var ant = splitList($("f_ant").value);
    var ex = ($("f_ex").value || "").trim();
    var note = ($("f_note").value || "").trim();

    if (!en) return toast(t("needEn"));
    if (!bn.length) return toast(t("needBn"));

    var dup = findDuplicate(en, editingId);
    if (dup) {
      return toast(dup.deleted ? t("dupTrash", { no: dup.no }) : t("dup", { no: dup.no }));
    }

    var w;
    if (editingId) {
      w = getWord(editingId);
      if (!w) return;
      w.en = en; w.bn = bn; w.pos = pos; w.syn = syn; w.ant = ant;
      w.ex = ex; w.note = note; w.updated = Date.now();
    } else {
      w = {
        id: uid(),
        no: await getNextNo(),
        en: en, bn: bn, pos: pos, syn: syn, ant: ant,
        ex: ex, note: note,
        created: Date.now(), updated: Date.now(), deleted: null,
        practiced: false, correctCount: 0, wrongCount: 0
      };
      words.push(w);
    }
    await dbPutWord(w);
    editingId = null;
    toast(t("saved"));
    go("words");
  }

  async function deleteWord(id) {
    var ok = await confirmDialog(t("confirmDel"));
    if (!ok) return;
    var w = getWord(id);
    if (!w) return;
    w.deleted = Date.now();
    w.updated = Date.now();
    await dbPutWord(w);
    toast(t("deleted"));
    go("words");
  }

  async function restoreWord(id) {
    var w = getWord(id);
    if (!w) return;
    var dup = findDuplicate(w.en, id);
    if (dup && !dup.deleted) return toast(t("dup", { no: dup.no }));
    w.deleted = null;
    w.updated = Date.now();
    await dbPutWord(w);
    toast(t("restored"));
    go("words");
  }

  async function deleteForever(id) {
    var ok = await confirmDialog(t("confirmDelForever"));
    if (!ok) return;
    await dbDeleteWord(id);
    words = words.filter(function (w) { return w.id !== id; });
    toast(t("permDeleted"));
    render();
  }

  async function emptyTrash() {
    var ok = await confirmDialog(t("confirmEmptyTrash"));
    if (!ok) return;
    var trash = trashWords();
    for (var i = 0; i < trash.length; i++) {
      await dbDeleteWord(trash[i].id);
    }
    words = words.filter(function (w) { return !w.deleted; });
    toast(t("trashEmptied"));
    render();
  }

  /* ---------- Export / Import ---------- */
  function exportJson() {
    var payload = {
      app: "vocab-mini-app",
      version: 1,
      exported: new Date().toISOString(),
      words: words
    };
    exportBuf = { kind: "json", text: JSON.stringify(payload, null, 2) };
    renderTools();
  }
  function exportCsv() {
    function q(x) { return '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"'; }
    var rows = ["english,bengali,synonyms,antonyms,pos,example,note"];
    activeWords().sort(function (a, b) { return a.no - b.no; }).forEach(function (w) {
      rows.push([w.en, w.bn.join("; "), w.syn.join("; "), w.ant.join("; "), w.pos, w.ex, w.note].map(q).join(","));
    });
    exportBuf = { kind: "csv", text: rows.join("\n") };
    renderTools();
  }
  async function copyExport() {
    if (!exportBuf.text) return;
    try {
      await navigator.clipboard.writeText(exportBuf.text);
      markBackup();
      toast(t("copied"));
    } catch (e) {
      var ta = $("export-out");
      if (ta) { ta.select(); document.execCommand("copy"); markBackup(); toast(t("copied")); }
    }
  }
  function downloadExport() {
    if (!exportBuf.text) return;
    var ext = exportBuf.kind === "json" ? "json" : "csv";
    var mime = exportBuf.kind === "json" ? "application/json" : "text/csv";
    var name = "vocab-" + new Date().toISOString().slice(0, 10) + "." + ext;
    try {
      var blob = new Blob([exportBuf.text], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);
      markBackup();
    } catch (e) {
      copyExport();
    }
  }
  async function markBackup() {
    lastBackup = Date.now();
    await metaSet("lastBackup", lastBackup);
  }

  async function doImport() {
    var text = ($("import-in").value || "").trim();
    if (!text) return;
    var replace = $("replace-in").checked;

    if (text.charAt(0) === "{") {
      try {
        var obj = JSON.parse(text);
        await restoreFromJson(obj, replace);
      } catch (e) {
        toast(t("badInput"));
      }
    } else {
      await importLines(text);
    }
    go("words");
  }

  async function importLines(text) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length && /^(english|en|word)\b/i.test(lines[0]) && lines[0].indexOf(",") > -1) {
      lines.shift();
    }
    var added = 0, skipped = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m = line.match(/^(.+?)\s*[-–—]\s*(.+)$/);
      var en, bnText;
      if (m) {
        en = m[1].trim();
        bnText = m[2].trim();
      } else {
        var parts = parseCsvLine(line);
        en = (parts[0] || "").trim();
        bnText = parts[1] || "";
      }
      var bn = splitList(bnText);
      if (!en || !bn.length || findDuplicate(en)) { skipped++; continue; }
      var w = {
        id: uid(),
        no: await getNextNo(),
        en: en, bn: bn,
        syn: [], ant: [], pos: "", ex: "", note: "",
        created: Date.now(), updated: Date.now(), deleted: null,
        practiced: false, correctCount: 0, wrongCount: 0
      };
      words.push(w);
      await dbPutWord(w);
      added++;
    }
    await fixNextNo();
    toast(t("importResult", { a: added, s: skipped }));
  }

  function parseCsvLine(line) {
    var out = [], cur = "", inQ = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (inQ) {
        if (c === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else inQ = false;
        } else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }

  async function restoreFromJson(obj, replace) {
    if (!obj || !Array.isArray(obj.words)) return toast(t("badInput"));

    var incoming = obj.words.filter(function (w) {
      return w && w.id && w.en && Array.isArray(w.bn);
    }).map(function (w) {
      return Object.assign({
        syn: [], ant: [], pos: "", ex: "", note: "",
        created: Date.now(), updated: 0, deleted: null,
        practiced: false, correctCount: 0, wrongCount: 0
      }, w);
    });

    if (replace) {
      var c1 = await confirmDialog(t("confirmReplace1"));
      if (!c1) return;
      var c2 = await confirmDialog(t("confirmReplace2"));
      if (!c2) return;
      await dbClearWords();
      words = incoming;
      await dbPutWords(words);
      await fixNextNo();
      toast(t("restoreResult", { a: incoming.length, u: 0, s: 0 }));
      return;
    }

    var added = 0, updated = 0, skipped = 0;
    var usedNo = {};
    words.forEach(function (w) { if (w.no) usedNo[w.no] = true; });

    for (var i = 0; i < incoming.length; i++) {
      var inc = incoming[i];
      var cur = getWord(inc.id);
      if (cur) {
        if ((inc.updated || 0) > (cur.updated || 0)) {
          inc.no = cur.no;
          Object.assign(cur, inc);
          await dbPutWord(cur);
          updated++;
        } else skipped++;
        continue;
      }
      if (findDuplicate(inc.en)) { skipped++; continue; }
      if (!inc.no || usedNo[inc.no]) inc.no = await getNextNo();
      usedNo[inc.no] = true;
      words.push(inc);
      await dbPutWord(inc);
      added++;
    }
    await fixNextNo();
    toast(t("restoreResult", { a: added, u: updated, s: skipped }));
  }

  /* ---------- Navigation ---------- */
  function go(v) {
    view = v;
    editingId = null;
    query = "";
    if (v === "words") renderWords();
    else if (v === "practice") {
      if (window.Practice && window.Practice.open) {
        window.Practice.open();
      } else {
        $("app").innerHTML = '<section class="view"><div class="empty"><p class="title">' + t("practiceComingSoon") + '</p><p>' + t("practiceComingSoonSub") + '</p></div></section>';
        setTitle(t("practice"));
        setActiveNav("practice");
        showFab(false);
        showBack(false);
      }
    }
    else if (v === "trash") renderTrash();
    else if (v === "tools") renderTools();
    else if (v === "add") renderForm();
  }

  function render() {
    if (view === "words") renderWords();
    else if (view === "practice") go("practice");
    else if (view === "trash") renderTrash();
    else if (view === "tools") renderTools();
    else if (view === "add") renderForm();
  }

  /* ---------- Event handlers ---------- */
  document.addEventListener("click", function (e) {
    var nav = e.target.closest("[data-nav]");
    if (nav) return go(nav.dataset.nav);

    var filt = e.target.closest("[data-filter]");
    if (filt) {
      filterPos = filt.dataset.filter;
      renderWords();
      return;
    }

    var src = e.target.closest("[data-source]");
    if (src) {
      filterSource = src.dataset.source;
      try { localStorage.setItem("vocab_filter_source", filterSource); } catch (x) {}
      renderWords();
      return;
    }

    var actEl = e.target.closest("[data-act]");
    if (!actEl) return;
    var act = actEl.dataset.act;
    var id = actEl.dataset.id;

    if (act === "edit") { editingId = id; view = "add"; renderForm(); }
    else if (act === "del") deleteWord(id);
    else if (act === "restore") restoreWord(id);
    else if (act === "del-forever") deleteForever(id);
    else if (act === "empty-trash") emptyTrash();
    else if (act === "form-save") saveWord();
    else if (act === "form-cancel") go("words");
    else if (act === "export-json") exportJson();
    else if (act === "export-csv") exportCsv();
    else if (act === "copy-export") copyExport();
    else if (act === "download-export") downloadExport();
    else if (act === "import-do") doImport();
    else if (act === "backup-now") go("tools");
  });

  document.addEventListener("input", function (e) {
    if (e.target.id === "search") {
      query = e.target.value;
      var focus = document.activeElement === e.target;
      var pos = e.target.selectionStart;
      var list = activeWords().filter(matches).sort(function (a, b) { return a.no - b.no; });
      var container = e.target.parentElement.parentElement;
      var cardsHtml = list.length
        ? list.map(renderWordCard).join("")
        : emptyState("noMatch", "");
      var oldCards = container.querySelectorAll(".card, .empty");
      oldCards.forEach(function (el) { el.remove(); });
      container.insertAdjacentHTML("beforeend", cardsHtml);
      if (focus) {
        e.target.focus();
        try { e.target.setSelectionRange(pos, pos); } catch (x) {}
      }
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("#fab")) { editingId = null; view = "add"; renderForm(); }
    if (e.target.closest("#back")) { go("words"); }
    if (e.target.closest("#lang-toggle")) {
      lang = lang === "bn" ? "en" : "bn";
      localStorage.setItem("vocab_lang", lang);
      updateLangChip();
      render();
    }
  });

  /* ---------- Init ---------- */
  async function init() {
    try {
      await openDB();
      var all = await dbGetAllWords();
      words = all || [];
      lastBackup = (await metaGet("lastBackup")) || 0;

      if (!words.length && (await metaGet("nextNo")) === undefined) {
        await metaSet("nextNo", 1);
      } else {
        await fixNextNo();
      }

      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(function () {});
      }

      updateLangChip();
      go("words");
    } catch (err) {
      $("app").innerHTML = '<section class="view"><div class="empty"><p class="title">Storage error</p><p>IndexedDB is not available in this browser.</p></div></section>';
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();