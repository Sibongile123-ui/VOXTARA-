# VOXTARA starter website

**Slogan:** Every Voice. Every Idea. One Community.

This is the first visual and interactive prototype for VOXTARA. It includes:
- responsive black/gold and blue/white design
- topic filters and discussion search
- sample discussions
- a post composer, nickname field, likes, replies and a report prompt
- basic input checks and HTML escaping

## Important: current preview vs. live community

Right now, posts and replies are stored in the visitor's own browser (`localStorage`). That means they are **not shared with other people** and can disappear if browser storage is cleared. The report button is only a preview prompt; it does not send a report to a moderator. The database schema is provided separately for the next setup step.

Do not advertise this preview as a fully working public community yet. Before launch, connect Supabase, configure database policies, add anti-spam/rate limiting and CAPTCHA, create a secure moderation/admin process, and test thoroughly. No website can guarantee perfect security or absolute anonymity.

## Preview on your computer

1. Download and unzip the `voxtara-starter.zip` file.
2. Open the `voxtara-starter` folder.
3. Double-click `index.html` to open it in a browser.
4. Try the topic filters, search, likes, and “Start a discussion”.

For a local development server, if Python is installed, open a terminal in this folder and run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Next: publish it

We can publish the front end with Cloudflare Pages and then connect a Supabase database. Free plans have limits, and a custom domain usually costs money. See the official guides:
- Cloudflare Pages: https://pages.cloudflare.com/
- Supabase: https://supabase.com/

## Database starter

`supabase-schema.sql` is a starting schema for posts, comments, and reports. In Supabase, open the SQL Editor and review the file before running it. The policies allow anonymous inserts for a prototype, so **do not treat them as sufficient production anti-spam protection**. Add server-side validation, CAPTCHA/rate limiting and a trusted moderator/admin workflow before inviting the public.

Never put a Supabase service-role key, password, or other secret in `app.js` or any public repository. The browser should only use a public anon/publishable key with carefully reviewed Row Level Security policies.
