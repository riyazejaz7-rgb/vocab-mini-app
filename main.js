(function () {
  "use strict";

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
  var MASTERY = CFG.MASTERY || { MIN_CORRECT: 5, MIN_DAYS: 3 };
  var LEITNER_DAYS = [1, 3, 7, 14, 30];

  var L = {
    en: {
      words: "Words", trash: "Trash", tools: "Tools", practice: "Practice", stats: "Stats",
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
      dup: "This word is already saved as #{no}.",
      dupTrash: "This word is in Trash (#{no}). Restore it from there.",
      total: "Total", today: "Today",
      exportTitle: "Backup & export", exportDesc: "Save a copy of your words. Keep it safe.",
      backupJson: "Backup (JSON)", exportCsv: "Export (CSV)",
      copy: "Copy", download: "Download", copied: "Copied",
      importTitle: "Import & restore",
      importDesc: "Paste lines like: english - bengali. Or a backup JSON.",
      importPlaceholder: "abandon - পরিত্যাগ করা",
      chooseFile: "Choose file", replaceAll: "Replace everything",
      importBtn: "Import",
      importResult: "Added: {a}. Skipped: {s}.",
      restoreResult: "Added: {a}. Updated: {u}. Skipped: {s}.",
      badInput: "Could not read that input",
      backupNever: "You haven't backed up yet",
      backupNeverSub: "Export now to protect your words.",
      backupOld: "Last backup: {n} days ago", backupToday: "Last backup: today",
      backupNow: "Backup now",
      confirmReplace1: "Replace ALL words with this backup?",
      confirmReplace2: "Are you sure? This cannot be undone.",
      pos_none: "(none)", pos_noun: "noun", pos_verb: "verb",
      pos_adjective: "adjective", pos_adverb: "adverb",
      pos_preposition: "preposition", pos_conjunction: "conjunction",
      pos_pronoun: "pronoun", pos_interjection: "interjection", pos_other: "other",
      practice: "Practice", practiceSetup: "Practice setup",
      mode: "Mode", mode_bn_en: "বাংলা → English", mode_en_bn: "English → বাংলা", mode_fill: "Fill blanks",
      questionCount: "Number of questions", wordSource: "Which words",
      source_all: "All words", source_new: "New words", source_wrong: "Wrong words",
      source_range: "Range", source_due: "Due today",
      rangeLabel: "Pick a range", rangeFrom: "From", rangeTo: "To", rangeWordsFound: "words found",
      startPractice: "Start practice",
      check: "Check", next: "Next", finish: "Finish",
      correctLabel: "Correct!", wrongLabel: "Wrong",
      correctAnswerWas: "Correct answer:", typeYourAnswer: "Type your answer…",
      questionOf: "Question {n} of {total}",
      resultGreat: "Excellent!", resultGood: "Good job!", resultOk: "Keep practicing",
      youGot: "You got {c} out of {t} correct",
      accuracy: "Accuracy", tryAgain: "Try again", done: "Done",
      notEnoughWords: "Need at least 4 words to practice",
      practiceNoWords: "Add at least 4 words to start practicing.",
      practiceNoWordsSub: "Tap + on the Words tab.",
      practiceComingSoon: "Practice coming soon",
      practiceComingSoonSub: "Refresh the app to load practice mode.",
      paused: "Paused", pausedAuto: "Auto-paused (idle)",
      pausedLabel: "Timer paused", resumed: "Resumed", resume: "Resume",
      totalTime: "Total time", avgTime: "Avg / question",
      viewDetails: "View details", hideDetails: "Hide details",
      practiceWrong: "Practice wrong",
      youWrote: "You wrote:", correctAnswer: "Correct answer:",
      historyTitle: "Practice history", historyDesc: "Your past practice sessions.",
      historyEmpty: "No sessions yet", historyEmptySub: "Complete a practice session to see it here.",
      historyToday: "Today", historyYesterday: "Yesterday",
      historySession: "Session", historyMode: "Mode", historyScore: "Score", historyTime: "Time",
      historyClear: "Clear history", historyClearConfirm: "Delete all practice history?",
      historyCleared: "History cleared",
      filterAll: "All", filterToday: "Today", filter7d: "7 days", filter30d: "30 days",
      deleteSession: "Delete this session?", sessionDeleted: "Session deleted",
      statsTitle: "Stats", statsTodayPracticed: "Today", statsWeekPracticed: "7 days",
      statsTotalWords: "Words", statsMastered: "Mastered", statsStreak: "Streak", statsDays: "days",
      statsDueToday: "Due today", statsDueTodayDesc: "Review these words today",
      statsDueNothing: "Nothing due today — great work!", statsStartReview: "Start review",
      statsWeeklyChart: "Last 7 days", statsMasteredList: "Mastered words",
      statsMasteredEmpty: "No mastered words yet. Keep practicing!",
      statsReviewSchedule: "Review schedule", statsBox: "Box {n}",
      statsNextReview: "Next: {d} days", statsReviewNow: "Review now",
      statsLevel1: "Learning", statsLevel2: "Almost", statsLevel3: "Good",
      statsLevel4: "Strong", statsLevel5: "Mastered",
      syncTitle: "Cloud sync", syncDesc: "Sync your words to the cloud.",
      syncLogin: "Log in with Telegram", syncLogout: "Log out", syncNow: "Sync now",
      syncStatusIdle: "Not logged in", syncStatusSyncing: "Syncing…",
      syncStatusOk: "Synced", syncStatusError: "Sync error", syncStatusOffline: "Offline",
      syncLastAt: "Last sync: {t}", syncNever: "Never synced",
      syncLoginSuccess: "Logged in", syncLoginFail: "Login failed",
      syncSuccess: "Synced: +{p} words, ↓{g} words",
      syncNothing: "Already up to date",
      syncLogoutConfirm: "Log out from cloud sync?",
            syncLoggedOut: "Logged out",
      askAI: "Ask AI",
      askAILoading: "Asking AI…",
      askAISuccess: "AI filled the fields",
      askAIFail: "AI could not respond",
      aiNeedWord: "Enter the English word first",
      aiNeedLogin: "Log in to cloud sync first",
      aiQuotaExceeded: "AI daily limit reached",
      aiUsedToday: "AI used today: {n}/{max}",
      mode_quiz: "AI Quiz",
      quizPrompt: "Choose the correct English word",
      aiGeneratingQuiz: "Generating quiz…"
    },
    bn: {
      words: "শব্দ", trash: "ট্র্যাশ", tools: "টুলস", practice: "প্র্যাকটিস", stats: "স্ট্যাটস",
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
      needEn: "ইংরেজি শব্দ লিখুন", needBn: "অন্তত একটি বাংলা অর্থ লিখুন",
      dup: "এই শব্দ আগেই সংরক্ষিত আছে #{no} হিসেবে।",
      dupTrash: "এই শব্দ ট্র্যাশে আছে (#{no})। সেখান থেকে ফিরিয়ে আনুন।",
      total: "মোট", today: "আজ",
      exportTitle: "ব্যাকআপ ও এক্সপোর্ট", exportDesc: "আপনার শব্দের একটি কপি সংরক্ষণ করুন।",
      backupJson: "ব্যাকআপ (JSON)", exportCsv: "এক্সপোর্ট (CSV)",
      copy: "কপি", download: "ডাউনলোড", copied: "কপি হয়েছে",
      importTitle: "ইমপোর্ট ও রিস্টোর",
      importDesc: "লিখুন: english - বাংলা অর্থ। অথবা ব্যাকআপ JSON পেস্ট করুন।",
      importPlaceholder: "abandon - পরিত্যাগ করা",
      chooseFile: "ফাইল বেছে নিন", replaceAll: "সব বদলে দিন",
      importBtn: "ইমপোর্ট",
      importResult: "যোগ: {a}। বাদ: {s}।",
      restoreResult: "যোগ: {a}। হালনাগাদ: {u}। বাদ: {s}।",
      badInput: "ইনপুট পড়া যায়নি",
      backupNever: "এখনো ব্যাকআপ নেননি",
      backupNeverSub: "শব্দ রক্ষা করতে এখনই এক্সপোর্ট করুন।",
      backupOld: "শেষ ব্যাকআপ: {n} দিন আগে", backupToday: "শেষ ব্যাকআপ: আজ",
      backupNow: "ব্যাকআপ নিন",
      confirmReplace1: "সব শব্দ এই ব্যাকআপ দিয়ে বদলাবেন?",
      confirmReplace2: "নিশ্চিত? এটি ফেরানো যাবে না।",
      pos_none: "(নেই)", pos_noun: "বিশেষ্য", pos_verb: "ক্রিয়া",
      pos_adjective: "বিশেষণ", pos_adverb: "ক্রিয়া-বিশেষণ",
      pos_preposition: "পূর্বসর্গ", pos_conjunction: "সংযোজক",
      pos_pronoun: "সর্বনাম", pos_interjection: "আবেগসূচক", pos_other: "অন্যান্য",
      practice: "প্র্যাকটিস", practiceSetup: "প্র্যাকটিস সেটআপ",
      mode: "মোড", mode_bn_en: "বাংলা → English", mode_en_bn: "English → বাংলা", mode_fill: "ফাঁকা পূরণ",
      questionCount: "প্রশ্ন সংখ্যা", wordSource: "কোন শব্দ",
      source_all: "সব শব্দ", source_new: "নতুন শব্দ", source_wrong: "ভুল শব্দ",
      source_range: "রেঞ্জ", source_due: "আজকের রিভিউ",
      rangeLabel: "রেঞ্জ বেছে নিন", rangeFrom: "থেকে", rangeTo: "পর্যন্ত", rangeWordsFound: "শব্দ পাওয়া গেছে",
      startPractice: "প্র্যাকটিস শুরু",
      check: "যাচাই", next: "পরবর্তী", finish: "শেষ",
      correctLabel: "সঠিক!", wrongLabel: "সঠিক হয়নি",
      correctAnswerWas: "সঠিক উত্তর:", typeYourAnswer: "উত্তর লিখুন…",
      questionOf: "প্রশ্ন {n} / {total}",
      resultGreat: "অসাধারণ!", resultGood: "ভালো করেছ!", resultOk: "আরো প্র্যাকটিস কর",
      youGot: "{t}টির মধ্যে {c}টি সঠিক",
      accuracy: "নির্ভুলতা", tryAgain: "আবার চেষ্টা", done: "সম্পন্ন",
      notEnoughWords: "প্র্যাকটিসের জন্য অন্তত ৪টি শব্দ দরকার",
      practiceNoWords: "অন্তত ৪টি শব্দ যোগ করুন প্র্যাকটিস শুরু করতে।",
      practiceNoWordsSub: "শব্দ ট্যাবে + চাপুন।",
      practiceComingSoon: "প্র্যাকটিস শীঘ্রই আসছে",
      practiceComingSoonSub: "অ্যাপ রিফ্রেশ করুন প্র্যাকটিস মোড লোড করতে।",
      paused: "বিরতি", pausedAuto: "অটো বিরতি (idle)",
      pausedLabel: "টাইমার বিরতিতে", resumed: "চালু হয়েছে", resume: "চালু করুন",
      totalTime: "মোট সময়", avgTime: "গড় / প্রশ্ন",
      viewDetails: "বিস্তারিত দেখুন", hideDetails: "বিস্তারিত লুকান",
      practiceWrong: "ভুলগুলো প্র্যাকটিস",
      youWrote: "আপনি লিখেছেন:", correctAnswer: "সঠিক উত্তর:",
      historyTitle: "প্র্যাকটিস হিস্ট্রি", historyDesc: "আপনার আগের প্র্যাকটিস সেশন।",
      historyEmpty: "এখনো কোনো সেশন নেই", historyEmptySub: "একটি প্র্যাকটিস সেশন সম্পন্ন করলে এখানে দেখা যাবে।",
      historyToday: "আজ", historyYesterday: "গতকাল",
      historySession: "সেশন", historyMode: "মোড", historyScore: "স্কোর", historyTime: "সময়",
      historyClear: "হিস্ট্রি মুছুন", historyClearConfirm: "সব প্র্যাকটিস হিস্ট্রি মুছবেন?",
      historyCleared: "হিস্ট্রি মুছে ফেলা হয়েছে",
      filterAll: "সব", filterToday: "আজ", filter7d: "৭ দিন", filter30d: "৩০ দিন",
      deleteSession: "এই সেশনটি মুছবেন?", sessionDeleted: "সেশন মুছে ফেলা হয়েছে",
      statsTitle: "স্ট্যাটস", statsTodayPracticed: "আজ", statsWeekPracticed: "৭ দিন",
      statsTotalWords: "শব্দ", statsMastered: "মাস্টারড", statsStreak: "স্ট্রিক", statsDays: "দিন",
      statsDueToday: "আজকের রিভিউ", statsDueTodayDesc: "আজ এই শব্দগুলো রিভিউ করুন",
      statsDueNothing: "আজ কোনো রিভিউ নেই — দারুণ!", statsStartReview: "রিভিউ শুরু",
      statsWeeklyChart: "শেষ ৭ দিন", statsMasteredList: "মাস্টারড শব্দ",
      statsMasteredEmpty: "এখনো কোনো মাস্টারড শব্দ নেই। চালিয়ে যান!",
      statsReviewSchedule: "রিভিউ শিডিউল", statsBox: "বক্স {n}",
      statsNextReview: "পরবর্তী: {d} দিন", statsReviewNow: "এখনই রিভিউ",
      statsLevel1: "শিখছি", statsLevel2: "প্রায়", statsLevel3: "ভালো",
      statsLevel4: "শক্ত", statsLevel5: "মাস্টারড",
      syncTitle: "ক্লাউড সিঙ্ক", syncDesc: "আপনার শব্দ ক্লাউডে সিঙ্ক করুন।",
      syncLogin: "Telegram দিয়ে লগইন", syncLogout: "লগআউট", syncNow: "এখনই সিঙ্ক",
      syncStatusIdle: "লগইন নেই", syncStatusSyncing: "সিঙ্ক চলছে…",
      syncStatusOk: "সিঙ্ক হয়েছে", syncStatusError: "সিঙ্ক সমস্যা", syncStatusOffline: "অফলাইন",
      syncLastAt: "শেষ সিঙ্ক: {t}", syncNever: "এখনো সিঙ্ক হয়নি",
      syncLoginSuccess: "লগইন হয়েছে", syncLoginFail: "লগইন হয়নি",
      syncSuccess: "সিঙ্ক: +{p} শব্দ, ↓{g} শব্দ",
      syncNothing: "আগে থেকেই আপ-টু-ডেট",
      syncLogoutConfirm: "ক্লাউড সিঙ্ক থেকে লগআউট?",
            syncLoggedOut: "লগআউট হয়েছে",
      askAI: "AI দিয়ে পূরণ",
      askAILoading: "AI জিজ্ঞেস করছি…",
      askAISuccess: "AI ফিল্ড পূরণ করেছে",
      askAIFail: "AI উত্তর দিতে পারল না",
      aiNeedWord: "প্রথমে ইংরেজি শব্দ লিখুন",
      aiNeedLogin: "প্রথমে ক্লাউড সিঙ্কে লগইন করুন",
      aiQuotaExceeded: "আজকের AI সীমা শেষ",
      aiUsedToday: "আজ AI ব্যবহার: {n}/{max}",
      mode_quiz: "AI কুইজ",
      quizPrompt: "সঠিক ইংরেজি শব্দটি বেছে নিন",
      aiGeneratingQuiz: "কুইজ তৈরি হচ্ছে…"
    }
  };

  var POS = ["", "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "interjection", "other"];

  var lang = localStorage.getItem("vocab_lang") === "bn" ? "bn" : "en";
  var words = [];
  var sessions = [];
  var reviews = {};
  var db = null;
  var view = "words";
  var editingId = null;
  var query = "";
  var filterPos = "";
  var filterSource = localStorage.getItem("vocab_filter_source") || "";
  var lastBackup = 0;
  var exportBuf = { text: "", kind: "" };
  var syncUnsub = null;

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
  function norm(s) { return String(s || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function splitList(s) { return String(s || "").split(/[,;،]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function uid() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() :
      "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }
  function daysSince(ts) { return Math.floor((Date.now() - ts) / 86400000); }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
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

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open("vocab_db", 3);
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains("words")) d.createObjectStore("words", { keyPath: "id" });
        if (!d.objectStoreNames.contains("meta")) d.createObjectStore("meta", { keyPath: "k" });
        if (!d.objectStoreNames.contains("sessions")) d.createObjectStore("sessions", { keyPath: "id" });
        if (!d.objectStoreNames.contains("reviews")) d.createObjectStore("reviews", { keyPath: "wordId" });
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
  function dbGetAllWords() { return txStore("words", "readonly", function (s) { return s.getAll(); }); }
  function dbGetAllSessions() { return txStore("sessions", "readonly", function (s) { return s.getAll(); }); }
  function dbGetAllReviews() { return txStore("reviews", "readonly", function (s) { return s.getAll(); }); }
  function dbPutWord(w) { return txStore("words", "readwrite", function (s) { s.put(w); }); }
  function dbPutWords(ws) { return txStore("words", "readwrite", function (s) { ws.forEach(function (w) { s.put(w); }); }); }
  function dbPutSession(se) { return txStore("sessions", "readwrite", function (s) { s.put(se); }); }
  function dbDeleteSession(id) { return txStore("sessions", "readwrite", function (s) { s.delete(id); }); }
  function dbClearSessions() { return txStore("sessions", "readwrite", function (s) { s.clear(); }); }
  function dbPutReview(r) { return txStore("reviews", "readwrite", function (s) { s.put(r); }); }
  function dbClearReviews() { return txStore("reviews", "readwrite", function (s) { s.clear(); }); }
  function dbDeleteWord(id) { return txStore("words", "readwrite", function (s) { s.delete(id); }); }
  function dbClearWords() { return txStore("words", "readwrite", function (s) { s.clear(); }); }
  function metaGet(k) { return txStore("meta", "readonly", function (s) { return s.get(k); }).then(function (r) { return r ? r.v : undefined; }); }
  function metaSet(k, v) { return txStore("meta", "readwrite", function (s) { s.put({ k: k, v: v }); }); }
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
  function getReview(wordId) { return reviews[wordId] || null; }
  function isDueToday(wordId) {
    var r = reviews[wordId];
    if (!r) return true;
    if (!r.nextReview) return true;
    return r.nextReview <= Date.now();
  }
  function getDueWords() {
    return words.filter(function (w) { return !w.deleted && isDueToday(w.id); });
  }
  function isMastered(wordId) {
    var r = reviews[wordId];
    if (!r) return false;
    return (r.box || 0) >= 5;
  }
  function updateReviewAfterAnswer(wordId, correct) {
    var r = reviews[wordId] || { wordId: wordId, box: 0, lastReview: 0, nextReview: 0, correctStreak: 0, days: {} };
    var tk = todayKey();
    r.days = r.days || {};
    r.days[tk] = (r.days[tk] || 0) + (correct ? 1 : 0);
    if (correct) {
      r.box = Math.min(5, (r.box || 0) + 1);
      r.correctStreak = (r.correctStreak || 0) + 1;
    } else {
      r.box = 1;
      r.correctStreak = 0;
    }
    var correctDays = 0, totalCorrect = 0;
    Object.keys(r.days).forEach(function (d) {
      if (r.days[d] > 0) correctDays++;
      totalCorrect += r.days[d];
    });
    if (totalCorrect >= MASTERY.MIN_CORRECT && correctDays >= MASTERY.MIN_DAYS) r.box = 5;
    r.lastReview = Date.now();
    var interval = LEITNER_DAYS[Math.max(0, Math.min(LEITNER_DAYS.length - 1, (r.box || 1) - 1))] || 1;
    r.nextReview = Date.now() + interval * 86400000;
    reviews[wordId] = r;
    return dbPutReview(r);
  }

  /* ---------- Sync helpers ---------- */
  async function collectLocalData() {
    return { words: words, sessions: sessions, reviews: reviews };
  }
  async function applyPulledData(data) {
    if (!data) return;
    if (Array.isArray(data.words) && data.words.length) {
      // Merge: newest updated wins
      var map = {};
      words.forEach(function (w) { map[w.id] = w; });
      data.words.forEach(function (cw) {
        var lw = map[cw.id];
        if (!lw || (cw.updated || 0) > (lw.updated || 0)) {
          map[cw.id] = cw;
        }
      });
      words = Object.keys(map).map(function (k) { return map[k]; });
      await dbPutWords(words);
    }
    if (Array.isArray(data.sessions)) {
      var sMap = {};
      sessions.forEach(function (s) { sMap[s.id] = s; });
      data.sessions.forEach(function (cs) {
        if (!sMap[cs.id]) {
          sMap[cs.id] = {
            id: cs.id, date: new Date(cs.date).getTime(), mode: cs.mode,
            total: cs.total, correct: cs.correct, durationMs: cs.duration_ms,
            answers: cs.answers || []
          };
        }
      });
      sessions = Object.keys(sMap).map(function (k) { return sMap[k]; }).sort(function (a, b) { return b.date - a.date; });
      for (var i = 0; i < data.sessions.length; i++) await dbPutSession(sessions.find(function (s) { return s.id === data.sessions[i].id; }));
    }
    if (data.reviews && typeof data.reviews === "object") {
      Object.keys(data.reviews).forEach(function (k) {
        var cr = data.reviews[k];
        var lr = reviews[k];
        if (!lr || (cr.lastReview || 0) > (lr.lastReview || 0)) {
          reviews[k] = cr;
        }
      });
      var rKeys = Object.keys(reviews);
      for (var j = 0; j < rKeys.length; j++) await dbPutReview(reviews[rKeys[j]]);
    }
    await fixNextNo();
  }

  function renderSyncChip() {
    var el = $("sync-chip");
    if (!el || !window.VocabSync) return;
    var st = window.VocabSync.getState();
    var cls = "sync-chip";
    var label = "";
    if (st.status === "ok") { cls += " ok"; label = "☁"; }
    else if (st.status === "syncing") { cls += " syncing"; label = "↻"; }
    else if (st.status === "error") { cls += " error"; label = "⚠"; }
    else if (st.status === "offline") { cls += " offline"; label = "⊘"; }
    else { cls += " idle"; label = "☁"; }
    el.className = cls;
    el.textContent = label;
    el.title = st.status + (st.errorMsg ? ": " + st.errorMsg : "");
  }

  window.VocabMain = {
    get words() { return words; },
    set words(v) { words = v; },
    get sessions() { return sessions; },
    get reviews() { return reviews; },
    get lang() { return lang; },
    t: t, esc: esc, uid: uid, toast: toast, confirmDialog: confirmDialog,
    dbPutWord: dbPutWord, dbPutSession: dbPutSession, dbGetAllSessions: dbGetAllSessions,
    dbDeleteSession: dbDeleteSession, dbClearSessions: dbClearSessions,
    dbPutReview: dbPutReview, dbClearReviews: dbClearReviews,
    metaGet: metaGet, metaSet: metaSet, daysSince: daysSince,
    isDueToday: isDueToday, getDueWords: getDueWords, isMastered: isMastered,
    updateReviewAfterAnswer: updateReviewAfterAnswer,
    getLocalData: collectLocalData,
    applyPulledData: applyPulledData,
    renderSyncChip: renderSyncChip,
    setTitle: function (s) { var el = $("title"); if (el) el.textContent = s; },
    setActiveNav: function (k) {
      document.querySelectorAll(".navbtn").forEach(function (b) {
        b.classList.toggle("active", b.dataset.nav === k);
      });
    },
    showFab: function (show) { var f = $("fab"); if (f) f.classList.toggle("hidden", !show); },
    showBack: function (show) { var b = $("back"); if (b) b.classList.toggle("hidden", !show); },
    getAppEl: function () { return $("app"); },
    LEITNER_DAYS: LEITNER_DAYS,
    MASTERY: MASTERY
  };
  function activeWords() { return words.filter(function (w) { return !w.deleted; }); }
  function trashWords() {
    return words.filter(function (w) { return w.deleted; }).sort(function (a, b) { return a.deleted - b.deleted; });
  }
  function matches(w) {
    if (filterPos && w.pos !== filterPos) return false;
    if (filterSource === "recent") {
      if (!w.created) return false;
      if ((Date.now() - w.created) / 86400000 > 7) return false;
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
  function posLabel(p) { return p ? t("pos_" + p) : ""; }

  function renderWords() {
    var list = activeWords().filter(matches).sort(function (a, b) { return a.no - b.no; });
    var total = activeWords().length;
    var today = activeWords().filter(function (w) { return w.created && daysSince(w.created) < 1; }).length;
    var recentCount = activeWords().filter(function (w) { return w.created && (Date.now() - w.created) / 86400000 <= 7; }).length;
    var newCount = activeWords().filter(function (w) { return !w.practiced; }).length;
    var wrongCount = activeWords().filter(function (w) { return w.wrongCount && w.wrongCount > 0; }).length;

    var html = "";
    html += '<div class="stats">';
    html += '<div class="stat"><span class="n">' + total + '</span><span class="l">' + t("total") + '</span></div>';
    html += '<div class="stat"><span class="n">' + today + '</span><span class="l">' + t("today") + '</span></div>';
    html += '</div>';

    if (total > 0) {
      var b = lastBackup;
      if (!b) html += '<div class="banner warn"><span>' + t("backupNever") + ' — ' + t("backupNeverSub") + '</span><button data-act="backup-now">' + t("backupNow") + '</button></div>';
      else if (daysSince(b) > 7) html += '<div class="banner warn"><span>' + t("backupOld", { n: daysSince(b) }) + '</span><button data-act="backup-now">' + t("backupNow") + '</button></div>';
    }

    html += '<div class="searchbar"><input id="search" type="search" placeholder="' + esc(t("search")) + '" value="' + esc(query) + '" autocomplete="off"></div>';

    if (total > 0) {
      html += '<div class="chips">';
      html += '<button data-source="" class="' + (filterSource === "" ? "on" : "") + '">' + t("all") + '</button>';
      if (recentCount > 0) html += '<button data-source="recent" class="' + (filterSource === "recent" ? "on" : "") + '">' + t("recent") + ' (' + recentCount + ')</button>';
      if (newCount > 0) html += '<button data-source="new" class="' + (filterSource === "new" ? "on" : "") + '">' + t("new_words") + ' (' + newCount + ')</button>';
      if (wrongCount > 0) html += '<button data-source="wrong" class="' + (filterSource === "wrong" ? "on" : "") + '">' + t("wrong_words") + ' (' + wrongCount + ')</button>';
      POS.slice(1).forEach(function (p) {
        var count = activeWords().filter(function (w) { return w.pos === p; }).length;
        if (count === 0) return;
        html += '<button data-filter="' + p + '" class="' + (filterPos === p ? "on" : "") + '">' + posLabel(p) + ' (' + count + ')</button>';
      });
      html += '</div>';
    }

    if (!total) html += emptyState("noWords", "noWordsSub");
    else if (!list.length) html += emptyState("noMatch", "");
    else html += list.map(renderWordCard).join("");

    $("app").innerHTML = '<section class="view">' + html + '</section>';
    setTitle(t("words"));
    setActiveNav("words");
    showFab(true);
    showBack(false);
  }

  function renderWordCard(w) {
    var h = '<article class="card">';
    h += '<div class="card-head"><div>';
    h += '<span class="card-num">#' + w.no + '</span>';
    h += '<span class="card-en">' + esc(w.en) + '</span>';
    h += '</div>';
    if (w.pos) h += '<span class="card-pos">' + esc(posLabel(w.pos)) + '</span>';
    h += '</div>';
    if (w.bn && w.bn.length) h += '<div class="card-bn">' + esc(w.bn.join(", ")) + '</div>';
    if (w.syn && w.syn.length) h += '<div class="card-meta"><b>' + t("synonyms") + ':</b> ' + esc(w.syn.join(", ")) + '</div>';
    if (w.ant && w.ant.length) h += '<div class="card-meta"><b>' + t("antonyms") + ':</b> ' + esc(w.ant.join(", ")) + '</div>';
    if (w.ex) h += '<div class="card-ex">' + esc(w.ex) + '</div>';
    if (w.note) h += '<div class="card-meta"><b>' + t("notes") + ':</b> ' + esc(w.note) + '</div>';
    h += '<div class="card-actions">';
    h += '<button data-act="edit" data-id="' + w.id + '">' + t("edit") + '</button>';
    h += '<button data-act="del" data-id="' + w.id + '" class="danger">' + t("del") + '</button>';
    h += '</div></article>';
    return h;
  }

  function emptyState(titleKey, subKey) {
    return '<div class="empty">' +
      '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<path d="M4 4h16v16H4z"/><path d="M8 10h8M8 14h5"/></svg>' +
      '<p class="title">' + t(titleKey) + '</p>' +
      (subKey ? '<p>' + t(subKey) + '</p>' : '') + '</div>';
  }

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
      h += '<button type="button" class="btn-ai" data-act="form-askai" id="form-askai-btn">';
    h += '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px"><path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/></svg>';
    h += t("askAI");
    h += '</button>';
    h += '<div class="form-actions">';
    h += '<button type="button" data-act="form-cancel" class="btn-secondary">' + t("cancel") + '</button>';
    h += '<button type="button" data-act="form-save" class="btn-primary">' + (isEdit ? t("saveChanges") : t("save")) + '</button>';
    h += '</div></section>';

    $("app").innerHTML = h;
    setTitle(isEdit ? t("edit") : t("add"));
    showFab(false);
    showBack(true);
    var first = $("f_en");
    if (first) setTimeout(function () { first.focus(); }, 100);
  }

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
        return '<article class="card"><div class="card-head"><div>' +
          '<span class="card-num">#' + w.no + '</span>' +
          '<span class="card-en">' + esc(w.en) + '</span></div></div>' +
          '<div class="card-bn">' + esc(w.bn.join(", ")) + '</div>' +
          '<div class="card-meta"><b>' + t("del") + ':</b> ' + esc(label) + '</div>' +
          '<div class="card-actions">' +
          '<button data-act="restore" data-id="' + w.id + '">' + t("restore") + '</button>' +
          '<button data-act="del-forever" data-id="' + w.id + '" class="danger">' + t("delForever") + '</button>' +
          '</div></article>';
      }).join("");
      h += '<div style="margin-top:20px"><button type="button" data-act="empty-trash" class="btn-secondary" style="width:100%;padding:14px;border-radius:14px;font-weight:700">Empty trash</button></div>';
    }
    h += '</section>';
    $("app").innerHTML = h;
    setTitle(t("trash"));
    setActiveNav("trash");
    showFab(false);
    showBack(false);
  }

  function renderTools() {
    var h = '<section class="view">';

    // Sync section
    var syncState = window.VocabSync ? window.VocabSync.getState() : { status: "idle", lastSyncAt: 0 };
    h += '<div class="section">';
    h += '<h2>' + t("syncTitle") + '</h2>';
    h += '<p class="desc">' + t("syncDesc") + '</p>';
    if (syncState.status === "idle" && !syncState.userId) {
      h += '<div class="row"><button data-act="sync-login" class="primary">' + t("syncLogin") + '</button></div>';
    } else {
      var stLabel = syncState.status === "ok" ? t("syncStatusOk") :
        syncState.status === "syncing" ? t("syncStatusSyncing") :
        syncState.status === "error" ? (t("syncStatusError") + ": " + (syncState.errorMsg || "")) :
        t("syncStatusIdle");
      var lastLabel = syncState.lastSyncAt ? t("syncLastAt", { t: new Date(syncState.lastSyncAt).toLocaleString() }) : t("syncNever");
      h += '<p style="font-size:0.88rem;color:var(--text-soft);margin:8px 0 4px"><b>' + esc(stLabel) + '</b></p>';
      h += '<p class="desc" style="margin-top:0">' + esc(lastLabel) + '</p>';
      h += '<div class="row">';
      h += '<button data-act="sync-now" class="primary">' + t("syncNow") + '</button>';
      h += '<button data-act="sync-logout">' + t("syncLogout") + '</button>';
      h += '</div>';
    }
    h += '</div>';

    // History section
    h += '<div class="section">';
    h += '<h2>' + t("historyTitle") + '</h2>';
    h += '<p class="desc">' + t("historyDesc") + '</p>';
    h += '<div class="row"><button data-act="open-history" class="primary">' + t("historyTitle") + '</button></div>';
    h += '</div>';

    // Export
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

    // Import
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
    h += '<div class="row"><button data-act="import-do" class="primary">' + t("importBtn") + '</button></div>';
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

  function setTitle(s) { var el = $("title"); if (el) el.textContent = s; }
  function setActiveNav(k) {
    document.querySelectorAll(".navbtn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.nav === k);
    });
  }
  function showFab(show) { var f = $("fab"); if (f) f.classList.toggle("hidden", !show); }
  function showBack(show) { var b = $("back"); if (b) b.classList.toggle("hidden", !show); }
  function updateLangChip() {
    var c = $("lang-toggle");
    if (c) c.textContent = lang === "bn" ? "EN" : "বাং";
  }  async function askAI() {
    var en = ($("f_en").value || "").trim();
    if (!en) return toast(t("aiNeedWord"));

    if (!window.VocabSync || !window.VocabSync.getState().userId) {
      return toast(t("aiNeedLogin"));
    }
    if (!window.VocabAI) {
      return toast(t("askAIFail"));
    }

    var btn = $("form-askai-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = t("askAILoading");
    }

    var result = await window.VocabAI.fillWord(en);

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px"><path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/></svg>' + t("askAI");
    }

    if (!result.ok) {
      if (result.error === "quota_exceeded") return toast(t("aiQuotaExceeded"));
      if (result.error === "not_logged_in") return toast(t("aiNeedLogin"));
      return toast(t("askAIFail"));
    }

    var d = result.data || {};
    if (Array.isArray(d.bn) && d.bn.length) $("f_bn").value = d.bn.join(", ");
    if (Array.isArray(d.syn) && d.syn.length) $("f_syn").value = d.syn.join(", ");
    if (Array.isArray(d.ant) && d.ant.length) $("f_ant").value = d.ant.join(", ");
    if (typeof d.pos === "string" && d.pos) {
      var posSel = $("f_pos");
      if (posSel) posSel.value = d.pos;
    }
    if (typeof d.ex === "string" && d.ex) $("f_ex").value = d.ex;

    toast(t("askAISuccess"));
  }
  async function renumberWords() {
    // শুধু একটিভ ওয়ার্ডগুলো নাও এবং আগের নম্বর অনুযায়ী সাজাও
    var active = words.filter(function (w) { return !w.deleted; }).sort(function (a, b) { return a.no - b.no; });
    
    // ১, ২, ৩... করে নতুন নম্বর বসাও
    for (var i = 0; i < active.length; i++) {
      if (active[i].no !== i + 1) {
        active[i].no = i + 1;
        active[i].updated = Date.now();
        await dbPutWord(active[i]);
      }
    }
    
    // কাউন্টার রিসেট করো (যাতে পরের ওয়ার্ড সঠিক নাম্বার পায়)
    await metaSet("nextNo", active.length + 1);
  }
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
    if (dup) return toast(dup.deleted ? t("dupTrash", { no: dup.no }) : t("dup", { no: dup.no }));

    var w;
    if (editingId) {
      w = getWord(editingId);
      if (!w) return;
      w.en = en; w.bn = bn; w.pos = pos; w.syn = syn; w.ant = ant;
      w.ex = ex; w.note = note; w.updated = Date.now();
    } else {
      w = {
        id: uid(), no: await getNextNo(),
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
    backgroundSync();
  }

  async function deleteWord(id) {
    if (!(await confirmDialog(t("confirmDel")))) return;
    var w = getWord(id);
    if (!w) return;
    w.deleted = Date.now();
    w.updated = Date.now();
    await dbPutWord(w);
    toast(t("deleted"));
    await renumberWords(); // নতুন করে ১,২,৩ সাজানোর ফাংশন কল
    go("words");
    backgroundSync();
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
    backgroundSync();
  }

   async function deleteForever(id) {
    if (!(await confirmDialog(t("confirmDelForever")))) return;
    
    await dbDeleteWord(id);
    
    if (window.VocabSync && window.VocabSync.getState().accessToken) {
      try {
        const token = window.VocabSync.getState().accessToken;
        const url = window.APP_CONFIG.SUPABASE_URL + "/rest/v1/words?id=eq." + id;
        await fetch(url, {
          method: "DELETE",
          headers: {
            "apikey": window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY,
            "Authorization": "Bearer " + token
          }
        });
      } catch (e) { console.error("Cloud delete failed:", e); }
    }

    words = words.filter(function (w) { return w.id !== id; });
    toast(t("permDeleted"));
    await renumberWords(); // নতুন করে ১,২,৩ সাজানোর ফাংশন কল
    render();
    backgroundSync();
  }
   async function emptyTrash() {
    if (!(await confirmDialog(t("confirmEmptyTrash")))) return;
    
    var trash = trashWords();
    var idsToDelete = trash.map(function(w) { return w.id; });

    for (var i = 0; i < trash.length; i++) {
      await dbDeleteWord(trash[i].id);
    }
    
    if (idsToDelete.length > 0 && window.VocabSync && window.VocabSync.getState().accessToken) {
      try {
        const token = window.VocabSync.getState().accessToken;
        const url = window.APP_CONFIG.SUPABASE_URL + "/rest/v1/words?id=in.(" + idsToDelete.join(",") + ")";
        await fetch(url, {
          method: "DELETE",
          headers: {
            "apikey": window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY,
            "Authorization": "Bearer " + token
          }
        });
      } catch (e) { console.error("Cloud empty trash failed:", e); }
    }

    words = words.filter(function (w) { return !w.deleted; });
    toast(t("trashEmptied"));
    render();
    backgroundSync();
  }
  function exportJson() {
    var payload = {
      app: "vocab-mini-app", version: 1,
      exported: new Date().toISOString(),
      words: words, sessions: sessions, reviews: reviews
    };
    exportBuf = { kind: "json", text: JSON.stringify(payload, null, 1) };
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
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
      markBackup();
    } catch (e) { copyExport(); }
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
      try { await restoreFromJson(JSON.parse(text), replace); }
      catch (e) { toast(t("badInput")); }
    } else {
      await importLines(text);
    }
    go("words");
    backgroundSync();
  }

  async function importLines(text) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    
    // প্রথম লাইন হেডার হলে বাদ দাও
    if (lines.length && /^(english|en|word)\b/i.test(lines[0])) lines.shift();
    
    var added = 0, skipped = 0;
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var en = "", bn = [], syn = [], ant = [], ex = "", pos = "", note = "";

      // ১. পাইপ (|) ফরম্যাট
      if (line.indexOf("|") > -1) {
        var parts = line.split("|").map(function(p){ return p.trim(); });
        en = parts[0] || "";
        bn = splitList(parts[1]);
        syn = splitList(parts[2]);
        ant = splitList(parts[3]);
        ex = parts[4] || "";
        if (parts[5]) pos = parts[5].toLowerCase(); 
      } 
      // ২. CSV কমা (,) ফরম্যাট
      else if (line.indexOf(",") > -1) {
        var csv = parseCsvLine(line);
        en = (csv[0] || "").trim();
        bn = splitList(csv[1] || "");
        syn = splitList(csv[2] || "");
        ant = splitList(csv[3] || "");
        ex = (csv[4] || "").trim();
        if (csv[5]) pos = csv[5].trim().toLowerCase();
      }
      // ৩. পুরনো ড্যাশ (-) ফরম্যাট
      else {
        var m = line.match(/^(.+?)\s*[-–—]\s*(.+)$/);
        if (m) { en = m[1].trim(); bn = splitList(m[2]); }
      }

      // Part of Speech ভ্যালিডেশন
      var validPos = ["noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "interjection", "other"];
      if (pos && validPos.indexOf(pos) === -1) pos = "";

      // ডুপ্লিকেট চেক এবং ডাটাবেসে সেভ
      if (!en || !bn.length || findDuplicate(en)) { skipped++; continue; }
      
      var w = {
        id: uid(), no: await getNextNo(),
        en: en, bn: bn, pos: pos, syn: syn, ant: ant, ex: ex, note: note,
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
        if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }

  async function restoreFromJson(obj, replace) {
    if (!obj || !Array.isArray(obj.words)) return toast(t("badInput"));
    var incoming = obj.words.filter(function (w) { return w && w.id && w.en && Array.isArray(w.bn); })
      .map(function (w) {
        return Object.assign({
          syn: [], ant: [], pos: "", ex: "", note: "",
          created: Date.now(), updated: 0, deleted: null,
          practiced: false, correctCount: 0, wrongCount: 0
        }, w);
      });
    if (replace) {
      if (!(await confirmDialog(t("confirmReplace1")))) return;
      if (!(await confirmDialog(t("confirmReplace2")))) return;
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

  function go(v) {
    view = v;
    editingId = null;
    query = "";
    if (v === "words") renderWords();
    else if (v === "practice") {
      if (window.Practice && window.Practice.open) window.Practice.open();
      else {
        $("app").innerHTML = '<section class="view"><div class="empty"><p class="title">' + t("practiceComingSoon") + '</p></div></section>';
        setTitle(t("practice")); setActiveNav("practice"); showFab(false); showBack(false);
      }
    }
    else if (v === "stats") {
      if (window.Stats && window.Stats.open) window.Stats.open();
      else {
        $("app").innerHTML = '<section class="view"><div class="empty"><p class="title">' + t("statsTitle") + '</p></div></section>';
        setTitle(t("statsTitle")); setActiveNav("stats"); showFab(false); showBack(false);
      }
    }
    else if (v === "trash") renderTrash();
    else if (v === "tools") renderTools();
    else if (v === "add") renderForm();
    else if (v === "history") {
      if (window.History && window.History.open) window.History.open();
      else {
        $("app").innerHTML = '<section class="view"><div class="empty"><p class="title">' + t("historyEmpty") + '</p></div></section>';
        setTitle(t("historyTitle")); setActiveNav("tools"); showFab(false); showBack(true);
      }
    }
  }

  function render() {
    if (view === "words") renderWords();
    else if (view === "practice") go("practice");
    else if (view === "stats") go("stats");
    else if (view === "trash") renderTrash();
    else if (view === "tools") renderTools();
    else if (view === "add") renderForm();
    else if (view === "history") go("history");
  }

  /* ---------- Background sync ---------- */
  var syncDebounce = null;
  function backgroundSync() {
    if (!window.VocabSync) return;
    var st = window.VocabSync.getState();
    if (!st.userId || !st.accessToken) return;
    if (syncDebounce) clearTimeout(syncDebounce);
    syncDebounce = setTimeout(async function () {
      try {
        var local = await collectLocalData();
        var result = await window.VocabSync.fullSync(local);
        if (!result.error && result.words) {
          await applyPulledData(result);
          if (view === "words" || view === "stats") render();
        }
      } catch (e) { console.error("bg sync", e); }
    }, 1500);
  }

  document.addEventListener("click", async function (e) {
    var nav = e.target.closest("[data-nav]");
    if (nav) return go(nav.dataset.nav);

    var filt = e.target.closest("[data-filter]");
    if (filt) { filterPos = filt.dataset.filter; renderWords(); return; }

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
    else if (act === "form-cancel") go("words");    else if (act === "form-askai") askAI();
    else if (act === "export-json") exportJson();
    else if (act === "export-csv") exportCsv();
    else if (act === "copy-export") copyExport();
    else if (act === "download-export") downloadExport();
    else if (act === "import-do") doImport();
    else if (act === "backup-now") go("tools");
    else if (act === "open-history") go("history");
    else if (act === "sync-login") {
      if (window.VocabSync) {
        var ok = await window.VocabSync.login();
        if (ok) {
          toast(t("syncLoginSuccess"));
          renderTools();
          backgroundSync();
        } else {
          toast(t("syncLoginFail"));
        }
      }
    }
    else if (act === "sync-now") {
      if (window.VocabSync) {
        var local2 = await collectLocalData();
        var res = await window.VocabSync.fullSync(local2);
        if (res.error) toast(t("syncStatusError"));
        else {
          await applyPulledData(res);
          toast(t("syncSuccess", { p: res.pushed.words, g: (res.words || []).length }));
          renderTools();
        }
      }
    }
    else if (act === "sync-logout") {
      if (await confirmDialog(t("syncLogoutConfirm"))) {
        window.VocabSync.logout();
        toast(t("syncLoggedOut"));
        renderTools();
      }
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target.id === "search") {
      query = e.target.value;
      var focus = document.activeElement === e.target;
      var pos = e.target.selectionStart;
      var list = activeWords().filter(matches).sort(function (a, b) { return a.no - b.no; });
      var container = e.target.parentElement.parentElement;
      var cardsHtml = list.length ? list.map(renderWordCard).join("") : emptyState("noMatch", "");
      var oldCards = container.querySelectorAll(".card, .empty");
      oldCards.forEach(function (el) { el.remove(); });
      container.insertAdjacentHTML("beforeend", cardsHtml);
      if (focus) { e.target.focus(); try { e.target.setSelectionRange(pos, pos); } catch (x) {} }
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
    if (e.target.closest("#sync-chip")) {
      go("tools");
    }
  });

  async function init() {
    try {
      await openDB();
      var allWords = await dbGetAllWords();
      words = allWords || [];
      var allSessions = await dbGetAllSessions();
      sessions = (allSessions || []).sort(function (a, b) { return b.date - a.date; });
      var allReviews = await dbGetAllReviews();
      reviews = {};
      (allReviews || []).forEach(function (r) { if (r && r.wordId) reviews[r.wordId] = r; });
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

      // Auto-init sync if VocabSync available
      if (window.VocabSync) {
        window.VocabSync.subscribe(function () { renderSyncChip(); });
        var loggedIn = await window.VocabSync.init();
        if (loggedIn) backgroundSync();
      }

    } catch (err) {
      console.error(err);
      $("app").innerHTML = '<section class="view"><div class="empty"><p class="title">Storage error</p><p>IndexedDB is not available in this browser.</p></div></section>';
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
