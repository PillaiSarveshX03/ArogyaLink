# Deploying ArogyaLink to Vercel

This guide explains how to deploy **ArogyaLink** with zero friction.

The project consists of:
1. **Frontend**: Next.js 14 (in `client/`)
2. **Backend**: Express + Supabase + Reminder Scheduler (in `server/`)

---

## 🚀 Recommended Deployment Architecture

Because the backend features a **24/7 background medicine reminder email scheduler** (`setInterval` every 60s), the recommended architecture is:

| Component | Platform | Free Tier Available? | Why? |
| :--- | :--- | :--- | :--- |
| **Frontend (`client/`)** | **Vercel** | ✅ Yes | Instant global edge CDN, automatic SSL, preview deployments |
| **Backend (`server/`)** | **Render / Railway / Fly.io** | ✅ Yes | Keeps the Node.js background reminder scheduler active 24/7 |

---

## Step 1: Deploy Backend (`server/`) to Render (2 Minutes)

1. Go to [render.com](https://render.com) and create an account.
2. Click **New +** ➡️ **Web Service**.
3. Connect your GitHub repository (`ENIGMA`).
4. Configure the service:
   - **Name**: `arogyalink-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add the variables from `server/.env`:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-app-name.vercel.app` (or `*`)
   - `SUPABASE_URL`: Your Supabase URL (e.g. `https://eofqzapaauvvhsfypgbw.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - *(Optional for real emails)*:
     - `SMTP_HOST`: e.g. `smtp.gmail.com`
     - `SMTP_PORT`: `587`
     - `SMTP_USER`: your email
     - `SMTP_PASS`: your Google App Password
     - `EMAIL_FROM`: `ArogyaLink <your-email@gmail.com>`
6. Click **Deploy Web Service**.
7. Copy your backend URL (e.g. `https://arogyalink-api.onrender.com`).

---

## Step 2: Deploy Frontend (`client/`) to Vercel

### Method A: Via Vercel Web Dashboard (Simplest)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** ➡️ **Project**.
3. Import your GitHub repository (`ENIGMA`).
4. In the **Configure Project** screen:
   - **Project Name**: `arogyalink`
   - **Framework Preset**: `Next.js` (detected automatically)
   - **Root Directory**: Click **Edit** and select **`client`** (or leave root since `vercel.json` is configured).
5. In the **Environment Variables** section, add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://arogyalink-api.onrender.com/api` (your backend URL from Step 1 with `/api`)
   - *(Optional)* **Name**: `BACKEND_URL`
   - **Value**: `https://arogyalink-api.onrender.com`
6. Click **Deploy**.

Within 60 seconds, your site will be live at `https://arogyalink.vercel.app`! 🎉

---

### Method B: Via Vercel CLI

If you have Vercel CLI installed:
```bash
# In the client directory:
cd client
vercel
```
Follow the terminal prompts:
- Link to existing project? `No`
- What's your project name? `arogyalink`
- In which directory is your code located? `./`
- Want to modify these settings? `No`

Once deployed, set the environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://arogyalink-api.onrender.com/api
vercel --prod
```

---

## ⚙️ Configuration Files Added to the Project

The following files have been pre-configured in your codebase:

1. **[`vercel.json`](file:///c:/Users/Gaurav/Desktop/SIH93/ENIGMA/vercel.json)**:
   Points Vercel's build command to `cd client && npm run build` and output to `client/.next`.
2. **[`client/vercel.json`](file:///c:/Users/Gaurav/Desktop/SIH93/ENIGMA/client/vercel.json)**:
   Pre-configures Next.js preset if Vercel root is set to `client/`.
3. **[`client/next.config.js`](file:///c:/Users/Gaurav/Desktop/SIH93/ENIGMA/client/next.config.js)**:
   Configured with Next.js rewrites:
   ```javascript
   async rewrites() {
     const rawBackend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
     const backendUrl = rawBackend.replace(/\/api\/?$/, '');
     return [{ source: '/api/:path*', destination: `${backendUrl}/api/:path*` }];
   }
   ```
4. **[`client/src/lib/api.ts`](file:///c:/Users/Gaurav/Desktop/SIH93/ENIGMA/client/src/lib/api.ts)**:
   Dynamically determines API URL: uses `NEXT_PUBLIC_API_URL` if set, otherwise relative `/api` on Vercel edge without hardcoded `localhost`.
5. **[`server/src/app.js`](file:///c:/Users/Gaurav/Desktop/SIH93/ENIGMA/server/src/app.js)**:
   CORS middleware updated to accept all `*.vercel.app` origins and preview deployments.
