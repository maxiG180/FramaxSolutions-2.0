# Google Calendar OAuth Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth Credentials (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if needed
6. Set **Application type** to **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://your-domain.com/api/auth/google/callback` (for production)
8. Copy the **Client ID** and **Client Secret** to your `.env.local`

## Database Migration

Run the migration to add the refresh token column:

```bash
# Apply the migration in supabase/migrations/20251212193000_add_calendar_refresh_token.sql
```

The migration adds:
- `google_calendar_refresh_token TEXT` column to the `profiles` table
