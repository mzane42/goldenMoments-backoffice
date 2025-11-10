# Render Deployment Guide

This guide will walk you through deploying the Golden Moments Backoffice application to Render.

## Prerequisites

- A Render account (sign up at [render.com](https://render.com))
- Your GitHub repository pushed and accessible
- Supabase credentials ready

## Step 1: Connect GitHub Repository

1. Log in to your Render dashboard
2. Click "New +" in the top right
3. Select "Web Service"
4. Connect your GitHub account if not already connected
5. Select the repository: `golden-moments-backoffice-manus`
6. Click "Connect"

## Step 2: Configure Web Service

Render should auto-detect the `render.yaml` configuration file. If not, use these settings:

- **Name**: `golden-moments-backoffice` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Plan**: Free (or choose Starter/Standard for better performance)

## Step 3: Set Environment Variables

In the Render dashboard, navigate to your service → Environment tab, and add the following environment variables:

### Required Environment Variables

```
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
```

**Important Notes:**
- `PORT` should NOT be set manually - Render automatically sets this
- `SUPABASE_SERVICE_ROLE_KEY` is sensitive - mark it as "Secret" in Render
- `JWT_SECRET` should also be marked as "Secret"
- The `VITE_` prefixed variables are used by the frontend build
- The non-prefixed `SUPABASE_*` variables are used by the server

## Step 4: Deploy

1. Click "Create Web Service" or "Save Changes"
2. Render will automatically start the build process
3. Monitor the build logs in real-time
4. Once deployed, your service will be available at: `https://your-service-name.onrender.com`

## Step 5: Verify Deployment

After deployment, verify the following:

1. **Homepage loads**: Visit your Render URL and confirm the app loads
2. **API endpoints work**: Test `/api/trpc/*` endpoints
3. **Supabase connection**: Verify authentication and database operations work
4. **Static assets**: Check that CSS, JS, and images load correctly

## Troubleshooting

### Build Fails

**Issue**: Build command fails with pnpm errors
- **Solution**: Ensure `.npmrc` file is committed to the repository
- Check that `packageManager` field in `package.json` matches your pnpm version

**Issue**: Build fails with "Cannot find module"
- **Solution**: Verify all dependencies are listed in `package.json`
- Check that patches are applied correctly (see `patches/` directory)

### Runtime Errors

**Issue**: "Cannot find build directory"
- **Solution**: Verify the build completed successfully
- Check that `dist/public` directory exists after build
- Review build logs for any errors

**Issue**: Environment variables not working
- **Solution**: Ensure all environment variables are set in Render dashboard
- Verify variable names match exactly (case-sensitive)
- Check that `VITE_` prefixed variables are set for frontend

**Issue**: Port binding errors
- **Solution**: Do NOT set `PORT` environment variable manually
- Render automatically provides the port via `process.env.PORT`
- The server code should use `process.env.PORT || 3000`

### Performance Issues

**Issue**: Slow cold starts
- **Solution**: Upgrade to Starter or Standard plan
- Free tier services spin down after 15 minutes of inactivity

**Issue**: Build timeout
- **Solution**: Free tier has 10-minute build timeout
- Consider upgrading plan or optimizing build process
- Remove unnecessary dependencies

## Manual Deploy

To trigger a manual deploy:

1. Go to your service in Render dashboard
2. Click "Manual Deploy"
3. Select the branch and commit
4. Click "Deploy"

## Auto-Deploy

By default, Render auto-deploys on every push to the main branch. To change this:

1. Go to Settings → Build & Deploy
2. Modify the "Auto-Deploy" setting
3. Choose branch and deploy conditions

## Monitoring

- **Logs**: View real-time logs in the Render dashboard
- **Metrics**: Monitor CPU, memory, and request metrics
- **Alerts**: Set up email alerts for deployment failures

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node-version)
- [Environment Variables](https://render.com/docs/environment-variables)

