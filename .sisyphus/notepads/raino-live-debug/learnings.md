
## Task 5 Learnings

### Supabase Auth on Raino Studio
- Project ref: `hzfwkioyahejnbabhvpr`
- Uses OTP (not traditional magic link) via `POST /auth/v1/otp`
- Includes PKCE: `code_challenge` and `code_challenge_method: S256`
- Redirect URL: `https://raino-studio.vercel.app/auth/callback`
- Rate limit: ~1 email per 60 seconds per address (Supabase default)

### Extracting Supabase Config from Next.js Client
- Scan all `<script src>` tags pointing to `_next/static/chunks/`
- Fetch each chunk and search for `https://[ref].supabase.co` pattern
- The anon key appears in the auth request headers (not easily in chunks)
- Best approach: intercept `page.on("request")` to capture real apikey header

### Chrome Profile Gmail Access
- `mail.google.com/mail/u/0/` through `/u/2/` all redirect to workspace landing if not logged in
- Chrome Profile 1 (`C:\Users\27jam\AppData\Local\Google\Chrome\User Data\Profile 1`) does not have Gmail
- Need to check which profile has Gmail before automation tasks
