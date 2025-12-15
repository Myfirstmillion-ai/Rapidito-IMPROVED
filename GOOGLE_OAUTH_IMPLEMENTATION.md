# 🔐 Google OAuth 2.0 Implementation Guide

## Overview

This document describes the Google OAuth 2.0 implementation for Rapidito, enabling users and captains to authenticate using their Google accounts.

---

## 📋 Table of Contents

1. [Google Cloud Console Setup](#google-cloud-console-setup)
2. [Environment Configuration](#environment-configuration)
3. [OAuth Flow Diagram](#oauth-flow-diagram)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Integration](#frontend-integration)
6. [Account Merge Strategy](#account-merge-strategy)
7. [Testing Checklist](#testing-checklist)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Rapidito")
4. Click "Create"

### Step 2: Enable Google+ API

1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in required fields:
   - **App name**: Rapidito
   - **User support email**: your-email@domain.com
   - **Developer contact**: your-email@domain.com
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (for development)
6. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: Rapidito Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - `https://your-production-domain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:4000/auth/google/callback` (development)
     - `https://your-api-domain.com/auth/google/callback` (production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

---

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# For production:
# GOOGLE_CALLBACK_URL=https://api.rapidito.com/auth/google/callback
```

### Frontend (.env)

```env
# Enable Google OAuth
VITE_ENABLE_GOOGLE_OAUTH=true
```

---

## 🔄 OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE OAUTH FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Frontend │     │ Backend  │     │  Google  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ Click "Google" │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ Redirect to    │                │
     │                │ /auth/google   │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │ Redirect to    │
     │                │                │ Google OAuth   │
     │                │                │───────────────>│
     │                │                │                │
     │<───────────────────────────────────────────────>│
     │           User authenticates with Google        │
     │                │                │                │
     │                │                │<───────────────│
     │                │                │ Callback with  │
     │                │                │ auth code      │
     │                │                │                │
     │                │                │ Exchange code  │
     │                │                │ for tokens     │
     │                │                │───────────────>│
     │                │                │<───────────────│
     │                │                │ User profile   │
     │                │                │                │
     │                │                │ Create/Update  │
     │                │                │ user in DB     │
     │                │                │                │
     │                │                │ Generate JWT   │
     │                │<───────────────│                │
     │                │ Redirect to    │                │
     │                │ /auth/callback │                │
     │                │ with token     │                │
     │                │                │                │
     │<───────────────│                │                │
     │ Store token    │                │                │
     │ Redirect home  │                │                │
     │                │                │                │
```

---

## 🏗️ Backend Architecture

### Files Created/Modified

| File | Purpose |
|------|---------|
| `Backend/config/passport.js` | Passport.js Google strategy configuration |
| `Backend/routes/auth.routes.js` | OAuth routes (/auth/google, /auth/google/callback) |
| `Backend/models/user.model.js` | Added `authProvider`, `googleId` fields |
| `Backend/models/captain.model.js` | Added `authProvider`, `googleId` fields |
| `Backend/server.js` | Passport initialization |

### User Model Changes

```javascript
// New fields added to user schema
authProvider: {
  type: String,
  enum: ['local', 'google'],
  default: 'local',
},
googleId: {
  type: String,
  sparse: true,
  unique: true,
},
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google?userType=user\|captain` | Initiates OAuth flow |
| GET | `/auth/google/callback` | Handles Google callback |
| POST | `/auth/check-email` | Check if email exists and auth provider |

---

## 🎨 Frontend Integration

### Components Created

| Component | Location | Purpose |
|-----------|----------|---------|
| `GoogleLoginButton` | `src/components/auth/GoogleLoginButton.jsx` | Tesla Matte style OAuth button |
| `AuthDivider` | `src/components/auth/GoogleLoginButton.jsx` | "or" separator |
| `OAuthCallback` | `src/screens/OAuthCallback.jsx` | Handles OAuth redirect |

### Integration Points

The Google login button is integrated into:
- `UserLogin.jsx`
- `UserSignup.jsx`
- `CaptainLogin.jsx`
- `CaptainSignup.jsx`

### Usage Example

```jsx
import GoogleLoginButton, { AuthDivider } from "../components/auth/GoogleLoginButton";

function LoginPage() {
  return (
    <div>
      <GoogleLoginButton userType="user" />
      <AuthDivider />
      {/* Email/password form */}
    </div>
  );
}
```

---

## 🔀 Account Merge Strategy

### Scenarios

| Scenario | Action |
|----------|--------|
| New Google user | Create new account with `authProvider: 'google'` |
| Existing local account (same email) | Link Google to existing account |
| Existing Google account | Login directly |

### Merge Logic

```javascript
// 1. Check by googleId first
account = await Model.findOne({ googleId });

if (!account) {
  // 2. Check by email for account linking
  account = await Model.findOne({ email });
  
  if (account) {
    // Link Google to existing account
    account.googleId = googleId;
    account.emailVerified = true;
    await account.save();
  } else {
    // 3. Create new account
    account = await Model.create({
      email,
      googleId,
      authProvider: 'google',
      emailVerified: true,
      // ... other fields from Google profile
    });
  }
}
```

---

## ✅ Testing Checklist

### OAuth Flow
- [ ] Click "Continue with Google" redirects to Google
- [ ] Google account selection works
- [ ] Callback redirects to frontend correctly
- [ ] Token is stored in localStorage
- [ ] User data is stored correctly
- [ ] Redirect to home/captain-home works

### New User Registration
- [ ] New Google user creates account
- [ ] Profile picture is saved
- [ ] Email is marked as verified
- [ ] authProvider is set to 'google'

### Account Linking
- [ ] Existing local user can link Google
- [ ] googleId is saved to existing account
- [ ] No duplicate accounts created
- [ ] Original password still works

### Error Handling
- [ ] OAuth cancelled shows error message
- [ ] Permission denied shows error message
- [ ] Network error shows retry option
- [ ] Invalid state shows error

### Captain-Specific
- [ ] Captain OAuth creates inactive account
- [ ] Vehicle info prompt shown after OAuth
- [ ] Membership check still applies

---

## 🔧 Troubleshooting

### Common Issues

#### "redirect_uri_mismatch" Error
**Cause**: Callback URL doesn't match Google Console configuration
**Solution**: 
1. Check `GOOGLE_CALLBACK_URL` in .env
2. Verify it matches exactly in Google Console
3. Include protocol (http/https) and port

#### "invalid_client" Error
**Cause**: Wrong Client ID or Secret
**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Ensure no extra spaces or quotes
3. Regenerate credentials if needed

#### User Not Created
**Cause**: Email scope not granted
**Solution**:
1. Check OAuth consent screen has email scope
2. User must grant email permission

#### Token Not Stored
**Cause**: Frontend callback not processing correctly
**Solution**:
1. Check browser console for errors
2. Verify `/auth/callback` route exists
3. Check URL parameters are being parsed

#### "Account created with Google" Error on Login
**Cause**: User trying to login with password for Google account
**Solution**: This is expected behavior. User should use Google login.

### Debug Mode

Enable debug logging in backend:
```javascript
// In passport.js
console.log("Google OAuth Profile:", profile);
console.log("User Type:", userType);
```

### Production Checklist

- [ ] Update `GOOGLE_CALLBACK_URL` to production URL
- [ ] Add production domain to Google Console
- [ ] Verify OAuth consent screen is published
- [ ] Test with real Google accounts
- [ ] Monitor error logs for OAuth failures

---

## 📚 Dependencies

```json
{
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0"
}
```

Install with:
```bash
cd Backend
npm install passport passport-google-oauth20
```

---

## 🔒 Security Considerations

1. **Never expose Client Secret** in frontend code
2. **Use httpOnly cookies** for token storage (implemented)
3. **Validate state parameter** to prevent CSRF
4. **Use HTTPS** in production
5. **Limit OAuth scopes** to minimum required (profile, email)

---

*Last updated: December 2024*
