# Raino Manual Configuration Guide

This guide covers every manual step you need to complete after the code is ready. None of these steps can be done through code. You will need a browser and access to your GitHub, Vercel, and Supabase accounts.

---

## Part 1: GitHub Repository Settings

### 1.1 Set the repository description

1. Open `https://github.com/tudsds/raino` in your browser
2. Click the gear icon (the ⚙️) next to the "About" heading on the right side of the repository page
3. In the **Description** text box, type:
   ```
   Agentic PCB & PCBA workflow platform. From napkin sketch to Gerber files, guided by an agent that knows when to stop.
   ```
4. Leave the **Website** box empty for now (you will set it in step 1.3 after deploying)
5. Check the checkbox labeled **Topics**
6. In the Topics field, add these one at a time (type each and press Enter):
   ```
   pcb
   pcba
   hardware-design
   kicad
   ai-agent
   nextjs
   supabase
   electronics
   eda
   vercel
   ```
7. Click the **Save changes** button

### 1.2 Protect the main branch

1. Open `https://github.com/tudsds/raino/settings/branches`
2. Click the **Add branch protection rule** button (blue button near the top)
3. In the **Branch name pattern** text box, type:
   ```
   main
   ```
4. Scroll down to the **Protect matching branches** section
5. Check the box labeled **Require a pull request before merging**
6. Under that, check **Require approvals** and in the **Required approving reviews** box, type `1`
7. Check the box labeled **Require status checks to pass before merging**
8. In the **Search for status checks** box, type and select: `ci`
9. Check the box labeled **Require branches to be up to date before merging**
10. Scroll down and check the box labeled **Do not allow force pushes**
11. Check the box labeled **Do not allow deletions**
12. Click the **Create** button (green, at the bottom of the page)

### 1.3 Set the homepage URL (after Vercel deployment)

1. Open `https://github.com/tudsds/raino` in your browser
2. Click the gear icon (⚙️) next to the "About" heading on the right side
3. In the **Website** text box, type:
   ```
   https://raino-site.vercel.app
   ```
4. Click the **Save changes** button

---

## Part 2: Vercel Project Setup

### 2.1 Create the raino-site project

1. Open `https://vercel.com/new` in your browser
2. Under **Import Git Repository**, find and select `tudsds/raino`
3. In the **Project Name** text box, type:
   ```
   raino-site
   ```
4. Under **Root Directory**, click **Edit** and select `apps/site` from the dropdown
5. The **Framework Preset** should auto-detect as **Next.js**. If it does not, select it manually from the dropdown.
6. Leave **Build Command** as the default (Vercel will use the one from `package.json`, which is `next build`)
7. Leave **Output Directory** blank (Next.js handles this automatically)
8. Leave **Install Command** blank (Vercel will detect pnpm and use it)
9. Click the **Deploy** button
10. Wait for the build to finish. It will take 1 to 3 minutes. The progress bar will turn green when done.

### 2.2 Create the raino-studio project

1. Open `https://vercel.com/new` in your browser
2. Under **Import Git Repository**, find and select `tudsds/raino`
3. In the **Project Name** text box, type:
   ```
   raino-studio
   ```
4. Under **Root Directory**, click **Edit** and select `apps/studio` from the dropdown
5. The **Framework Preset** should auto-detect as **Next.js**. If it does not, select it manually.
6. Leave **Build Command** and **Output Directory** as defaults
7. Click the **Deploy** button
8. Wait for the build to finish.

### 2.3 Set environment variables for raino-site

1. Open `https://vercel.com/tudsds/raino-site/settings/environment-variables` in your browser
   - If the URL does not work, go to `https://vercel.com/dashboard`, click on **raino-site**, click the **Settings** tab at the top, then click **Environment Variables** in the left sidebar
2. For each variable below, do the following:
   - In the **Key** text box, type the variable name
   - In the **Value** text box, paste the value from your `.env.local` or from the service provider's dashboard
   - Under **Environments**, check all three boxes: **Production**, **Preview**, and **Development**
   - Click the **Add** button
3. Add these variables (only the ones that the site needs):

   | Key                             | Where to get the value                                                         |
   | ------------------------------- | ------------------------------------------------------------------------------ |
   | `NEXT_PUBLIC_SITE_URL`          | Type: `https://raino-site.vercel.app`                                          |
   | `NEXT_PUBLIC_APP_URL`           | Type: `https://raino-studio.vercel.app`                                        |
   | `NEXT_PUBLIC_SUPABASE_URL`      | Supabase dashboard > Project Settings > API > Project URL                      |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard > Project Settings > API > Project API keys > `anon public` |

   Note: `NEXT_PUBLIC_` variables are embedded into the client-side JavaScript bundle at build time. They are not secret. Never put server-only secrets (like service role keys) in variables prefixed with `NEXT_PUBLIC_`.

### 2.4 Set environment variables for raino-studio

1. Open `https://vercel.com/tudsds/raino-studio/settings/environment-variables` in your browser
   - If the URL does not work, go to `https://vercel.com/dashboard`, click on **raino-studio**, click the **Settings** tab, then click **Environment Variables** in the left sidebar
2. Add each variable the same way as step 2.3 (key, value, check all three environment boxes, click Add)
3. Add these variables:

   **Client-side (public) variables:**

   | Key                             | Where to get the value                                      |
   | ------------------------------- | ----------------------------------------------------------- |
   | `NEXT_PUBLIC_APP_URL`           | Type: `https://raino-studio.vercel.app`                     |
   | `NEXT_PUBLIC_SITE_URL`          | Type: `https://raino-site.vercel.app`                       |
   | `NEXT_PUBLIC_SUPABASE_URL`      | Supabase dashboard > Project Settings > API > Project URL   |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard > Project Settings > API > `anon public` |

   **Server-side (secret) variables:**

   | Key                             | Where to get the value                                                                                                                                                                                                                          |
   | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `DATABASE_URL`                  | Supabase dashboard > Project Settings > Database > Connection string > URI tab. Replace `[YOUR-PASSWORD]` with your database password. The format is: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
   | `SUPABASE_SERVICE_ROLE_KEY`     | Supabase dashboard > Project Settings > API > `service_role secret`. This is a secret key with full database access. Never expose it client-side.                                                                                               |
   | `KIMI_API_KEY`                  | Moonshot AI dashboard (https://platform.moonshot.cn/console/api-keys). Create a new API key if you do not have one.                                                                                                                             |
   | `KIMI_API_BASE_URL`             | Type: `https://api.moonshot.ai/v1`                                                                                                                                                                                                              |
   | `GITHUB_ACTIONS_DISPATCH_TOKEN` | GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens. Create a token with `repo` permissions (read/write).                                                                                                       |
   | `GITHUB_REPOSITORY_OWNER`       | Type: `tudsds`                                                                                                                                                                                                                                  |
   | `GITHUB_REPOSITORY_NAME`        | Type: `raino`                                                                                                                                                                                                                                   |
   | `VERCEL_TOKEN`                  | Vercel dashboard > Settings > Tokens > Create token. Give it a name like "Raino Worker Deploy".                                                                                                                                                 |
   | `RESEND_API_KEY`                | Resend dashboard (https://resend.com/api-keys). Create an API key.                                                                                                                                                                              |
   | `DIGIKEY_CLIENT_ID`             | DigiKey API developer portal (https://developer.digikey.com). Create an OAuth app.                                                                                                                                                              |
   | `DIGIKEY_CLIENT_SECRET`         | Same DigiKey developer portal, shown after creating the OAuth app.                                                                                                                                                                              |
   | `MOUSER_API_KEY`                | Mouser API dashboard (https://api.mouser.com). Request API access and create a key.                                                                                                                                                             |
   | `JLCPCB_APP_ID`                 | JLCPCB developer portal. Apply for API access.                                                                                                                                                                                                  |
   | `JLCPCB_ACCESS_KEY`             | Same JLCPCB developer portal.                                                                                                                                                                                                                   |
   | `JLCPCB_SECRET_KEY`             | Same JLCPCB developer portal.                                                                                                                                                                                                                   |
   | `EMBEDDING_PROVIDER`            | Type `openai` if you have an OpenAI API key. Type `mock` if you do not. The default is `mock`.                                                                                                                                                  |
   | `EMBEDDING_MODEL`               | Type: `text-embedding-3-small` (this is the default, set it explicitly to be safe)                                                                                                                                                              |
   | `OPENAI_API_KEY`                | OpenAI dashboard (https://platform.openai.com/api-keys). Create a new secret key. Only needed if `EMBEDDING_PROVIDER` is `openai`.                                                                                                              |
   | `OPENAI_BASE_URL`               | Leave empty unless you use a custom OpenAI-compatible endpoint for embeddings.                                                                                                                                                                  |

### 2.5 Redeploy both projects after setting variables

After setting all environment variables, both projects need a fresh deployment so the variables are picked up at build time.

**For raino-site:**

1. Open `https://vercel.com/tudsds/raino-site/deployments`
2. Click the three-dot menu (⋯) on the most recent deployment
3. Click **Redeploy**
4. In the confirmation dialog, click **Redeploy** again

**For raino-studio:**

1. Open `https://vercel.com/tudsds/raino-studio/deployments`
2. Click the three-dot menu (⋯) on the most recent deployment
3. Click **Redeploy**
4. In the confirmation dialog, click **Redeploy** again

---

## Part 3: Supabase Configuration

### 3.1 Enable the pgvector extension

1. Open your Supabase project dashboard at `https://supabase.com/dashboard/project/[YOUR-PROJECT-REF]`
   - Replace `[YOUR-PROJECT-REF]` with your actual project reference (found in the Supabase dashboard URL after you select your project)
2. Click **Database** in the left sidebar
3. Click the **Extensions** tab
4. In the search box, type `vector`
5. Find **vector** (the extension name is `vector`, provided by `pgvector`)
6. Click the **Enable** button next to it
7. Wait for the confirmation message

### 3.2 Run Prisma migrations

1. Open a terminal on your local machine
2. Navigate to the project root:
   ```bash
   cd /path/to/raino
   ```
3. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
4. Push the schema to your Supabase database:
   ```bash
   npx prisma db push
   ```
5. If you have migration files, run:
   ```bash
   npx prisma migrate deploy
   ```

### 3.3 Configure auth redirect URLs

This is the critical step that makes Supabase magic-link authentication work with your Vercel deployments.

1. Open your Supabase project dashboard
2. Click **Authentication** in the left sidebar
3. Click **URL Configuration** under the **Configuration** section
4. In the **Site URL** text box, type:
   ```
   https://raino-studio.vercel.app
   ```
5. In the **Redirect URLs** section, click the **Add URL** button
6. Type:
   ```
   https://raino-studio.vercel.app/auth/callback
   ```
7. Press Enter to add it
8. Click the **Add URL** button again
9. Type:
   ```
   https://raino-studio.vercel.app/**
   ```
   This wildcard allows any path on the studio domain as a redirect target.
10. Press Enter to add it
11. Click the **Add URL** button again
12. Type:

```
http://localhost:3001/auth/callback
```

This is for local development. 13. Press Enter to add it 14. Click the **Save** button at the bottom of the page

### 3.4 Enable magic-link sign-in (email provider)

1. In the Supabase dashboard, click **Authentication** in the left sidebar
2. Click **Providers** under the **Configuration** section
3. Find **Email** in the list of providers
4. Click on **Email** to expand its settings
5. Make sure the **Enable Email provider** toggle is turned ON (it should be on by default)
6. Under **Auth Email Link**, make sure the **Enable email link** toggle is turned ON
7. Leave **Autoconfirm** OFF (you want users to verify their email through the magic link)
8. Scroll down and click the **Save** button

---

## Part 4: Verification Checklist

After completing all steps above, verify everything works:

1. **GitHub repo**: Open `https://github.com/tudsds/raino` and confirm the description, topics, and homepage URL are visible on the right side
2. **Branch protection**: Try pushing directly to `main` in a test. It should be rejected. You should only be able to merge through a pull request.
3. **raino-site**: Open `https://raino-site.vercel.app` and confirm the marketing site loads
4. **raino-studio**: Open `https://raino-studio.vercel.app` and confirm the product app loads
5. **Auth flow**: On the studio site, click "Sign in" and enter your email. Check your inbox for the magic link. Click it. You should be logged into the studio.
6. **Degraded mode**: If any supplier or LLM calls fail gracefully (showing fixture data or a clear "no credentials" message), that is expected behavior. The app is designed to work this way.

---

## Quick Reference: All URLs

| Service                  | URL                                                                     |
| ------------------------ | ----------------------------------------------------------------------- |
| GitHub repo              | `https://github.com/tudsds/raino`                                       |
| GitHub branch settings   | `https://github.com/tudsds/raino/settings/branches`                     |
| Vercel dashboard         | `https://vercel.com/dashboard`                                          |
| raino-site env vars      | `https://vercel.com/tudsds/raino-site/settings/environment-variables`   |
| raino-studio env vars    | `https://vercel.com/tudsds/raino-studio/settings/environment-variables` |
| Supabase dashboard       | `https://supabase.com/dashboard`                                        |
| Moonshot API keys        | `https://platform.moonshot.cn/console/api-keys`                         |
| OpenAI API keys          | `https://platform.openai.com/api-keys`                                  |
| Resend API keys          | `https://resend.com/api-keys`                                           |
| DigiKey developer portal | `https://developer.digikey.com`                                         |
| Mouser API               | `https://api.mouser.com`                                                |
| GitHub PAT tokens        | `https://github.com/settings/personal-access-tokens/new`                |
| Vercel tokens            | `https://vercel.com/account/tokens`                                     |
