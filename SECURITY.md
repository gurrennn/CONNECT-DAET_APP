# 🔐 Security Guidelines - CONNECT-DAET

## ⚠️ CRITICAL: If You Cloned This Repository

**The API keys in the committed `.env` file were exposed and are now INVALID.**

### Immediate Actions Required:

1. **Regenerate Supabase Keys:**
   - Go to your Supabase project dashboard
   - Navigate to: Settings > API
   - Click "Generate new anon key"
   - Update your local `.env` file

2. **Regenerate Gemini API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Update your local `.env` file

3. **Never Commit `.env` Again:**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep ".env"
   
   # If you accidentally staged it:
   git reset .env
   ```

4. **Update Admin UUID:**
   - Create your admin user in Supabase Auth
   - Copy the user UUID
   - Update `app/lib/adminAccess.ts`
   - Update RLS policies in `supabase-schema.sql`

---

## 🛡️ Security Features

### 1. Row Level Security (RLS)

All database tables have RLS enabled with admin-only read access:

```sql
-- Example: Only the configured admin can read analytics data
CREATE POLICY "Admin read access for analytics" 
ON shop_transactions FOR SELECT 
USING (auth.uid() = 'YOUR_ADMIN_UUID_HERE'::uuid);
```

### 2. Authentication

- **Provider:** Supabase Auth
- **Method:** Email + Password
- **Session:** JWT tokens (automatic)
- **Admin Check:** Hardcoded UUID validation

### 3. Environment Variables

Never expose:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (despite "public" in name, regenerate if exposed)
- `GEMINI_API_KEY` (server-side only)
- `NEXT_PUBLIC_SUPABASE_URL` (less critical but avoid exposure)

### 4. API Route Protection

All API routes should validate:
```typescript
import { supabase } from '@/app/lib/supabaseClient'

export async function POST(request: Request) {
  // Get user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Your API logic here
}
```

---

## 🚨 Security Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] `.env` not in git history
- [ ] Admin UUID updated in code and database
- [ ] API keys regenerated
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] RLS policies tested
- [ ] Input validation on all forms
- [ ] Error messages don't leak sensitive info

### Monthly Security Tasks

- [ ] Review Supabase logs for anomalies
- [ ] Check for unused API keys
- [ ] Update dependencies (`npm audit`)
- [ ] Review RLS policies
- [ ] Test authentication flows
- [ ] Backup database

### If Compromised

1. **Immediately:**
   - Regenerate all API keys
   - Change admin password
   - Review Supabase logs
   - Check for unauthorized data access

2. **Within 24 Hours:**
   - Audit all database queries
   - Review git history for exposed secrets
   - Notify affected users (if any)
   - Update security documentation

3. **Within 1 Week:**
   - Implement additional security measures
   - Conduct security audit
   - Update incident response plan
   - Train team on security best practices

---

## 📊 Recommended Tools

### Development
- **git-secrets** - Prevents committing secrets
- **dotenv-vault** - Encrypted .env file management
- **npm audit** - Dependency vulnerability scanning

### Production
- **Supabase RLS** - Database access control (already enabled)
- **Vercel Security Headers** - HTTP security headers
- **Sentry** - Error tracking (optional)
- **Cloudflare** - DDoS protection (optional)

---

## 🔍 Security Audit Log

| Date | Action | Performed By | Notes |
|------|--------|--------------|-------|
| 2026-11-08 | Initial security setup | System | RLS enabled, admin-only access |
| 2026-11-08 | API keys exposed in git | System | Keys invalidated, new keys required |
| 2026-11-08 | Security documentation created | System | This document |

---

## 📞 Reporting Security Issues

**Do NOT open public GitHub issues for security vulnerabilities.**

Instead:
1. Email: security@connect-daet.gov.ph
2. Use GitHub Security Advisory (private)
3. Contact project maintainers directly

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Last Updated:** November 8, 2026
**Security Level:** High
**Compliance:** GDPR-ready, data privacy compliant
