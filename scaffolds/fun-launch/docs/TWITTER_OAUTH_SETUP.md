# Twitter OAuth Setup Guide

This guide explains how to set up Twitter OAuth for service provider verification.

## Overview

The Twitter verification system allows service providers to verify their Twitter accounts by posting a tweet with a verification code. This adds a verified badge to their profile in the marketplace.

## Current Implementation

The current implementation uses a **manual verification flow**:

1. User clicks "Verify with X"
2. System generates a unique verification code
3. User posts a tweet with the verification code (manually or via Twitter intent)
4. User enters the tweet ID
5. System marks the account as verified

## Future: Full OAuth Integration

For full automatic verification, you'll need to:

1. **Install Twitter API library**:
   ```bash
   pnpm add twitter-api-v2
   ```

2. **Set up Twitter Developer Account**:
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create a new app
   - Get API keys and tokens

3. **Configure OAuth Flow**:
   - Set callback URL: `https://your-domain.com/api/twitter/callback`
   - Implement OAuth 2.0 flow in `/api/twitter/auth.ts`
   - Handle callback in `/api/twitter/callback.ts`

4. **Implement Tweet Verification**:
   - Use Twitter API v2 to search for tweets
   - Verify tweet contains verification code
   - Verify tweet is from authenticated user
   - Mark as verified automatically

## Environment Variables

Add these to your `.env` file:

```env
# Twitter/X API (Optional - for full OAuth integration)
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_CALLBACK_URL=https://kogaion.fun/api/twitter/callback
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Public URLs (Required)
NEXT_PUBLIC_WEBSITE_URL=https://kogaion.fun
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/kogaionpack
NEXT_PUBLIC_TWITTER_URL=https://x.com/KogaionSol
```

## Manual Verification Flow (Current)

The current implementation works without Twitter API credentials:

1. User registers as service provider
2. User clicks "Verify with X"
3. System generates verification code and tweet message
4. User posts tweet manually (or uses Twitter intent link)
5. User enters tweet ID
6. System marks as verified

**Note**: Full automatic verification requires Twitter API credentials and OAuth setup.

## Twitter API Rate Limits

If implementing full OAuth:

- **Tweet Search**: 300 requests per 15 minutes (per app)
- **User Lookup**: 300 requests per 15 minutes (per app)
- **OAuth Requests**: Varies by endpoint

Consider implementing:
- Caching for verification checks
- Rate limiting
- Queue system for bulk verifications

## Security Considerations

1. **Never expose API secrets** in client-side code
2. **Validate all inputs** server-side
3. **Use HTTPS** for all OAuth callbacks
4. **Store tokens securely** (encrypted in database if needed)
5. **Implement CSRF protection** for OAuth flows

## Testing

For development/testing:

1. Use Twitter's test environment if available
2. Create test Twitter accounts
3. Use manual verification flow (current implementation)
4. Test with real accounts before production

## Troubleshooting

**Issue**: OAuth callback fails
- Check callback URL matches Twitter app settings
- Verify HTTPS is enabled
- Check CORS settings

**Issue**: Tweet verification fails
- Verify Twitter API credentials are correct
- Check rate limits haven't been exceeded
- Ensure tweet is public and accessible

**Issue**: Verification code not found in tweet
- Verify user posted exact message
- Check for typos in verification code
- Ensure tweet hasn't been deleted
