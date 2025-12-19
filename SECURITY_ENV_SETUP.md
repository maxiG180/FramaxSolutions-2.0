# Environment Variables - Security Configuration

## Required Environment Variables

Add these environment variables to your `.env.local` file:

### Vercel Cron Secret (NEW - CRITICAL)
```env
CRON_SECRET=your-random-secret-key-here
```

**How to generate:**
```bash
# Generate a random secret (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Purpose:** Protects the `/api/cron/send-discord-alerts` endpoint from unauthorized access. Only Vercel Cron jobs with this secret can trigger the endpoint.

**Vercel Cron Configuration:**
Add to your `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/send-discord-alerts",
    "schedule": "0 */6 * * *",
    "headers": {
      "Authorization": "Bearer YOUR_CRON_SECRET"
    }
  }]
}
```

### Make.com Webhooks (OPTIONAL)
```env
# Optional: Override default webhook URLs
MAKE_AVAILABILITY_WEBHOOK=https://hook.eu1.make.com/zum9fcvc124vwh6iwa0q2jjr6nx5cg0i
MAKE_BOOKING_WEBHOOK=https://hook.eu1.make.com/acq3mral3fprrpfnqolsrgtr89t2cyah
```

**Note:** These are optional. The webhooks have fallback defaults in the code. Only add these if you want to use different webhook URLs.

### Existing Environment Variables (verify these exist)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend Email
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=Framax Solutions <contact@framaxsolutions.com>

# App URL
NEXT_PUBLIC_APP_URL=https://framax.pt
```

## Security Notes

1. **Never commit `.env.local`** - it's already in `.gitignore`
2. **Regenerate CRON_SECRET if exposed** - treat it like a password
3. **Use different secrets for different environments** (development, staging, production)
4. **Store production secrets in Vercel Environment Variables** - don't rely on `.env.local` in production
5. **Webhook URLs are now hidden from frontend** - they're only in server-side API routes

## Deployment Checklist

- [ ] Add `CRON_SECRET` to Vercel Environment Variables
- [ ] Update `vercel.json` with cron configuration
- [ ] Verify all other environment variables are set in Vercel
- [ ] Test cron endpoint with secret authorization
- [ ] Verify rate limiting works in production
- [ ] Check CORS headers for production domains only
- [ ] Test availability checking with new proxy endpoint
