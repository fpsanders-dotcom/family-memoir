# Lessons — Claude (Implementation)

Technical gotchas, things that broke, workarounds we found.

---

### Framer code components cannot import from other code files
Framer code components are sandboxed — you cannot use relative imports like `import X from './OtherComponent'`. Each component must be self-contained. If you need to reuse logic across components, inline it within the same file. Only `npm` packages (like `@supabase/supabase-js` and `framer`) can be imported.

### Photos table has no created_at column
The `photos` table uses `sort_order` for ordering, not `created_at`. Always verify column names before writing queries.

### WhatsApp strips EXIF metadata from photos
WhatsApp compresses and re-encodes images before sending, removing EXIF data (date taken, GPS coordinates). The EXIF extraction code works correctly but will never receive usable data from WhatsApp photos. Workaround: use follow-up questions to ask for location, and fall back to message timestamp for date.

### zsh interprets `!` in double-quoted strings
When giving terminal commands to Freek, avoid `!` inside double quotes — zsh treats it as history expansion. Use single quotes around the entire command, or omit `!` from generated strings (passwords, etc.).

### npm requires `cd` into project folder first
Freek's terminal defaults to `~`. Always include `cd ~/Documents/family-memoir &&` before npm commands.

### Twilio WhatsApp sandbox requires join code
Users must send a join message (e.g. "join something-something") to the Twilio sandbox number from their WhatsApp before they can receive replies. Sandbox membership expires every 72 hours.

### Twilio WhatsApp number must use sandbox number for replies
The `TWILIO_WHATSAPP_NUMBER` in .env must be `whatsapp:+14155238886` (the standard Twilio sandbox number), not the phone number shown in the Twilio console. Using the wrong number causes "Could not find a Channel" errors.

### ngrok free tier changes URL on restart
Every time ngrok restarts, it generates a new public URL. The Twilio webhook URL must be updated manually each time. For production, deploy to a permanent cloud host.

### Node ESM does not expose `crypto` as a global
Even though `globalThis.crypto` exists in Node 19+ for the WebCrypto API, the legacy `crypto.randomUUID()` style call we use in `server.js` is NOT a global in ESM. It crashed Railway on the first incoming WhatsApp message with `ReferenceError: crypto is not defined`. Always `import crypto from 'node:crypto'` explicitly at the top of any ESM file that uses it. CommonJS used to expose it as a global, ESM doesn't.

### Railway auto-redeploys on push to main
Railway watches the GitHub repo and rebuilds + redeploys automatically every time `main` advances. No CLI step needed for hotfixes — `git push` is the deploy command. Build typically takes ~1–2 min.

### Sandbox cannot push to GitHub (proxy 403)
Bash sandbox blocks outbound git push (HTTP 403 from proxy on CONNECT). Commits are made in-sandbox via the mounted folder, then Freek pushes from his own terminal. Workflow: Claude commits → Freek runs `git push` → Railway redeploys.

### Twilio WhatsApp sandbox webhook lives under "Try it out → Send a WhatsApp message → Sandbox settings"
The historic URL `console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox` 404s. Correct path is the "Sandbox settings" tab on `console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn`.

### Custom domain on Railway needs CNAME + TXT, then waits for Let's Encrypt
For `webhook.unusual.company`: add custom domain in Railway → Railway gives a CNAME target (`*.up.railway.app`) and a `railway-verify=...` TXT record → add both at the DNS provider (hostnet.nl in our case) → Railway provisions Let's Encrypt via DNS-01 automatically. CNAMEs only work on subdomains, not apex/root.

### Supabase anon key must be hardcoded in standalone HTML
The table-view.html runs in the browser with no build step. The Supabase anon key must be pasted directly into the JS — it can't read from .env. Remember to update it when the key changes.
