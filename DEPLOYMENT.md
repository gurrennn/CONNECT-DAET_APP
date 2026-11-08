# 🚀 Deployment Guide - CONNECT-DAET

Complete guide for deploying CONNECT-DAET to production.

---

## 📋 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Build completes successfully (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] All environment variables documented

### 2. Database Setup
- [ ] Supabase project created
- [ ] Schema deployed (`supabase-schema.sql`)
- [ ] Admin user created
- [ ] RLS policies configured
- [ ] Sample data loaded (optional)

### 3. Security
- [ ] API keys regenerated (if ever exposed)
- [ ] Admin UUID configured
- [ ] `.env` not in repository
- [ ] Security audit completed
- [ ] HTTPS will be enforced

### 4. Documentation
- [ ] README updated
- [ ] API documentation ready
- [ ] User guide complete
- [ ] Deployment steps documented

---

## 🎯 Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Why Vercel:**
- Built for Next.js
- Automatic deployments
- Free tier available
- Built-in analytics
- Global CDN
- Zero configuration

**Steps:**

1. **Push to GitHub** (if not already):
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Access your site at: `https://your-project.vercel.app`

6. **Custom Domain (Optional):**
   - Go to Project Settings > Domains
   - Add your domain (e.g., `analytics.daet.gov.ph`)
   - Update DNS records as instructed
   - SSL automatic

**Continuous Deployment:**
- Every push to `main` auto-deploys
- Preview deployments for PRs
- Rollback with one click

---

### Option 2: Netlify

**Steps:**

1. **Build Settings:**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables:**
   Same as Vercel (see above)

3. **Deploy:**
   - Connect GitHub repository
   - Configure build settings
   - Deploy

---

### Option 3: AWS Amplify

**Steps:**

1. **Create Amplify App:**
   ```bash
   # Install Amplify CLI
   npm install -g @aws-amplify/cli
   
   # Configure
   amplify init
   amplify add hosting
   amplify publish
   ```

2. **Environment Variables:**
   - Add in Amplify Console
   - Same keys as Vercel

3. **Deploy:**
   - Automatic on git push

---

### Option 4: Self-Hosted (VPS/Cloud)

**Requirements:**
- Node.js 20+ installed
- PM2 or similar process manager
- Nginx or Apache
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Server Setup:**
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

2. **Clone & Build:**
```bash
# Clone repository
git clone https://github.com/jpudo05/jerold.git
cd jerold

# Install dependencies
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Build
npm run build
```

3. **Start with PM2:**
```bash
# Start app
pm2 start npm --name "connect-daet" -- start

# Save PM2 config
pm2 save

# Setup auto-restart
pm2 startup
```

4. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Setup SSL:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Post-Deployment Steps

### 1. Verify Deployment

- [ ] Home page loads (`/`)
- [ ] Auth page works (`/auth`)
- [ ] Can sign in as admin
- [ ] Analytics dashboard loads (`/analytics`)
- [ ] Charts render correctly
- [ ] Exports work (CSV, JSON)
- [ ] AI insights generate
- [ ] No console errors

### 2. Performance Check

```bash
# Use Google Lighthouse
# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 90+
```

### 3. Monitor

**Set up monitoring:**
- Vercel Analytics (free)
- Sentry for error tracking (optional)
- Supabase dashboard for database metrics
- Google Analytics (optional)

### 4. Backup

```bash
# Database backup (Supabase)
# Go to: Supabase Dashboard > Settings > Database
# Click "Backups" (automatic daily backups)

# Code backup
# GitHub already serves as backup
```

---

## 🔄 Update Process

### Deploying Updates

**On Vercel/Netlify:**
```bash
# Simply push to GitHub
git add .
git commit -m "Update: description"
git push origin main

# Automatic deployment triggers
# Check deployment status in dashboard
```

**Self-Hosted:**
```bash
# SSH to server
ssh user@yourserver.com

# Pull changes
cd /path/to/jerold
git pull origin main

# Rebuild
npm install
npm run build

# Restart
pm2 restart connect-daet
```

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** `npm run build` fails

**Solutions:**
1. Check for TypeScript errors
2. Verify all dependencies installed
3. Check environment variables
4. Review build logs

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

**Issue:** Config values not loading

**Solutions:**
1. Verify variable names match exactly
2. Check for typos in `.env`
3. Restart dev server
4. On Vercel: redeploy after adding variables

### Database Connection Fails

**Issue:** "Error connecting to database"

**Solutions:**
1. Verify Supabase URL and key
2. Check RLS policies
3. Ensure admin UUID is correct
4. Review Supabase logs

### Authentication Issues

**Issue:** Can't sign in

**Solutions:**
1. Verify admin user exists in Supabase Auth
2. Check admin UUID in `adminAccess.ts`
3. Review RLS policies
4. Check Supabase Auth logs

### 500 Internal Server Error

**Issue:** API routes return 500

**Solutions:**
1. Check server logs
2. Verify Gemini API key (for AI routes)
3. Review API route code
4. Check database connection

---

## 📊 Performance Optimization

### 1. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="Description"
  priority // for above-the-fold images
/>
```

### 2. Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

### 3. Caching

```typescript
// API route caching
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}
```

### 4. Database Query Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_transactions_date ON shop_transactions(created_at);

-- Use database functions for complex queries
-- (already implemented in supabase-schema.sql)
```

---

## 🔐 Production Security

### Security Headers (Vercel)

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Rate Limiting

Consider implementing on API routes:
```typescript
// Use upstash/ratelimit or similar
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

---

## 📞 Support

**Deployment Issues:**
- Check platform documentation first
- Review deployment logs
- Verify all checklist items
- Contact platform support

**Technical Issues:**
- Open GitHub issue
- Check existing documentation
- Review error logs
- Contact maintainers

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Web Performance Best Practices](https://web.dev/performance/)

---

**Last Updated:** November 8, 2026
**Target Platform:** Vercel (recommended), Netlify, AWS, or Self-hosted
