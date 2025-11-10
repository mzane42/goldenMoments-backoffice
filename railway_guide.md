 Deployment Plan: Railway Hobby ($5/month)

     Goal: Deploy React + Express + tRPC app to Railway with minimal code changes

     ---
     Phase 1: Prepare Application (15 minutes)

     1.1 Update package.json scripts
     - Add "vercel-build": "vite build" (Railway uses this)
     - Ensure "start": "NODE_ENV=production node dist/index.js" exists
     - Verify "build" script creates both frontend and backend

     1.2 Create railway.json (optional, for advanced config)
     - Configure build/start commands
     - Set health check endpoint

     1.3 Verify environment variables
     - Document all required env vars
     - Prepare values for Railway dashboard

     ---
     Phase 2: Railway Setup (10 minutes)

     2.1 Create Railway account
     - Sign up at railway.com
     - Connect GitHub account
     - Verify email

     2.2 Create new project
     - Select "Deploy from GitHub repo"
     - Choose your repository
     - Railway auto-detects Node.js

     2.3 Configure build settings
     - Build Command: pnpm build (auto-detected)
     - Start Command: pnpm start (auto-detected)
     - Root Directory: / (default)
     - Watch Paths: leave default

     ---
     Phase 3: Environment Configuration (10 minutes)

     3.1 Add environment variables in Railway dashboard
     - NODE_ENV=production
     - SUPABASE_URL
     - SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
     - VITE_SUPABASE_URL (for frontend build)
     - VITE_SUPABASE_ANON_KEY (for frontend build)

     3.2 Configure auto-deployment
     - Enable automatic deploys on push to main
     - Set up preview environments (optional)

     ---
     Phase 4: Deploy & Test (15 minutes)

     4.1 Trigger first deployment
     - Push to main branch OR click "Deploy" in Railway
     - Monitor build logs
     - Wait for deployment to complete (~2-5 minutes)

     4.2 Test application
     - Open Railway-provided URL
     - Test authentication flow
     - Verify API endpoints work
     - Test long-running operations
     - Check admin/partner dashboards

     4.3 Monitor resource usage
     - Check Railway dashboard metrics
     - Verify staying within $5 credit
     - Set usage alerts at 80%

     ---
     Phase 5: Production Configuration (20 minutes)

     5.1 Custom domain (optional)
     - Add CNAME record to DNS
     - Configure in Railway settings
     - SSL auto-provisioned

     5.2 Add monitoring
     - Enable Railway analytics
     - Optional: Add Sentry for error tracking
     - Set up uptime monitoring (UptimeRobot)

     5.3 Create deployment checklist
     - Document deployment process
     - Note environment variables
     - Record Railway project settings

     ---
     Estimated Costs:

     - First Month: $5.00 (Hobby plan)
     - Ongoing: $5-8/month (based on actual usage)
     - Free Trial: $5 credit for 30 days

     Estimated Time:

     - Total Setup: 1-1.5 hours
     - First Deployment: 10-15 minutes

     Code Changes Required:

     - ✅ Minimal (just package.json scripts if needed)
     - ✅ No architecture changes
     - ✅ Keep existing Express server as-is

     Rollback Plan:

     - Railway keeps previous deployments
     - One-click rollback available
     - Can redeploy from any commit