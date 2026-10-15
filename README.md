# Vocab Mini App

A personal English vocabulary Telegram Mini App (Bengali meanings, practice, progress, offline use).

Status: Phase 1 shell. It only runs setup checks. No vocabulary features yet.

## Secret rules (this repo is public)

Never commit any of these, in any file:
- Telegram bot token
- Supabase service-role key
- Supabase database password
- Gemini API key

`config.js` may hold only public values (Supabase URL, publishable key, bot username).
Secrets go into Supabase secrets later (Phase 5 and 6), never into this repo.

## Publish with GitHub Pages

1. Upload these files to the repo root (Add file > Upload files > Commit to `main`).
2. Open Settings > Pages.
3. Under Build and deployment, choose Deploy from a branch, branch `main`, folder `/ (root)`, then Save.
4. Wait 1 to 3 minutes. The page address will be:
   `https://riyazejaz7-rgb.github.io/vocab-mini-app/`

## Connect it to your bot

1. In Telegram, open @BotFather.
2. Send `/mybots`, choose your bot, then Bot Settings > Menu Button > Configure menu button.
3. Paste the Pages address above and give the button a name, for example `Open app`.
4. Open your bot and tap the menu button. The setup check screen should appear.

## If Supabase is paused

Free projects pause after a week of inactivity.
1. Sign in at supabase.com and open your project.
2. Click Restore project and wait a few minutes.
3. Reopen the app and run the setup check again.

## Costs

Everything here is on free tiers. Do not enable any paid plan without deciding on it first.
