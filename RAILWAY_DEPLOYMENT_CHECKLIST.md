# 🚀 Railway Deployment Checklist

## ✅ Pre-Deployment Completed
- [x] `package.json` scripts configured
- [x] `railway.json` configuration created
- [x] GitHub repository connected to Railway

---

## 📋 Step-by-Step Deployment Guide

### 1️⃣ Configure Environment Variables (15 minutes)

Go to your Railway project dashboard → Select your service → Variables tab → Raw Editor

#### Required Variables (Must Have):

```bash
# Node Environment
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend Build Variables (needed during build)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secure-random-32-character-secret
```

#### Optional Variables (if needed):

```bash
# Application Title
VITE_APP_TITLE=Golden Moments Backoffice

# Google Maps (only if using map features)
VITE_FRONTEND_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev

# Built-in Forge API (only if using forge features)
BUILT_IN_FORGE_API_URL=your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

---

### 2️⃣ Get Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **API**
4. Copy the following:
   - **Project URL** → Use for `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **anon/public key** → Use for `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

---

### 3️⃣ Generate JWT Secret

Run this command in your terminal to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it for `JWT_SECRET`

---

### 4️⃣ Configure Railway Build Settings

In your Railway service settings, verify:

- **Build Command**: `pnpm build` (should be auto-detected)
- **Start Command**: `pnpm start` (should be auto-detected)
- **Root Directory**: `/` (default)
- **Node Version**: 18+ (auto-detected from package.json)

---

### 5️⃣ Deploy Application

#### Option A: Push to GitHub (Automatic Deployment)
```bash
git add .
git commit -m "Configure Railway deployment"
git push origin main
```

Railway will automatically detect the push and start deploying.

#### Option B: Manual Deploy from Railway Dashboard
1. Go to your Railway project
2. Click on your service
3. Click "Deploy" button
4. Select the branch to deploy (usually `main`)

---

### 6️⃣ Monitor Deployment (5-10 minutes)

1. In Railway dashboard, go to **Deployments** tab
2. Watch the build logs in real-time
3. Look for these key stages:
   - ✅ Dependencies installation (`pnpm install`)
   - ✅ Frontend build (`vite build`)
   - ✅ Backend build (`esbuild`)
   - ✅ Server start (`node dist/index.js`)
4. Deployment should complete with status: **SUCCESS**

---

### 7️⃣ Test Your Application

Once deployed, Railway provides a URL (e.g., `your-app.railway.app`):

#### Test Checklist:
- [ ] Home page loads correctly
- [ ] Login page is accessible
- [ ] Authentication works (login/logout)
- [ ] Admin dashboard loads
- [ ] Partner dashboard loads
- [ ] API endpoints respond correctly
- [ ] Database connection works (Supabase)
- [ ] No console errors

---

### 8️⃣ Monitor Resource Usage

1. Go to Railway dashboard → **Metrics** tab
2. Check:
   - CPU usage
   - Memory usage
   - Network traffic
3. Set up usage alerts:
   - Click **Settings** → **Usage Alerts**
   - Set alert at 80% of $5 budget

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Solution: Ensure all dependencies are in package.json
pnpm install
git commit -am "Update dependencies"
git push
```

**Error: "Environment variable not defined"**
```bash
# Solution: Double-check all required env vars are set in Railway
# Go to Variables tab and verify each one
```

### Application Won't Start

**Error: "Port already in use"**
```bash
# Railway automatically sets PORT environment variable
# Your server should use: process.env.PORT || 3000
```

**Error: "Supabase connection failed"**
```bash
# Solution: Verify SUPABASE_URL and keys are correct
# Test manually at: https://your-project.supabase.co
```

### Performance Issues

**Application is slow**
```bash
# Check Railway metrics for resource usage
# Consider upgrading from Hobby ($5) to Pro plan if needed
```

---

## 🎯 Post-Deployment

### Custom Domain (Optional)

1. In Railway, go to **Settings** → **Domains**
2. Click **Add Custom Domain**
3. Enter your domain name
4. Add CNAME record to your DNS:
   - Name: `www` (or subdomain)
   - Value: `your-app.railway.app`
5. SSL certificate is automatically provisioned

### Monitoring & Alerts

1. **Railway Analytics**: Built-in, check Metrics tab
2. **Uptime Monitoring**: Consider UptimeRobot (free tier available)
3. **Error Tracking**: Consider Sentry (optional)

---

## 📊 Cost Estimation

- **Hobby Plan**: $5.00/month
- **Typical Usage**: $5-8/month for this app
- **Free Trial**: $5 credit for 30 days

---

## 🔄 Continuous Deployment

Once set up, every push to `main` branch will automatically:
1. Trigger a new build
2. Run tests (if configured)
3. Deploy if build succeeds
4. Keep previous version for instant rollback

---

## 📝 Quick Reference

### Railway Commands (CLI - Optional)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to project
railway link

# View logs
railway logs

# Open dashboard
railway open
```

### Emergency Rollback
1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **⋯** → **Redeploy**
4. Previous version restored in ~1 minute

---

## ✅ Deployment Complete!

Your application is now live on Railway! 🎉

**Next Steps:**
- Share the Railway URL with your team
- Set up custom domain (optional)
- Configure monitoring and alerts
- Test all features thoroughly
- Set up staging environment (optional)

---

**Questions or Issues?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your deployment guide: `railway_guide.md`

