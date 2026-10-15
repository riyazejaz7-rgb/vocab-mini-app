// PUBLIC values only. This file is served to every visitor and lives in a public repo.
// NEVER put these here: bot token, Supabase service-role key, database password, Gemini key.
window.APP_CONFIG = {
  SUPABASE_URL: "https://epvwmkjncqjvebladnrj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Cle1rYq-otRVOiJnZ7rKHw_NvsbGuQ4",
  BOT_USERNAME: "RiyazVocabLearningBot",
  TIME_ZONE: "Asia/Dhaka",
  // Mastery rule: at least MIN_CORRECT correct answers on at least MIN_DAYS different Dhaka calendar days.
  MASTERY: { MIN_CORRECT: 5, MIN_DAYS: 3 }
};
