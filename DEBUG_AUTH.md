# Google Sign-In Debug Guide

## Issue
Google Sign-in redirects to Firebase auth page, but then redirects back to the sign-in page instead of logging in.

## Likely Causes

### 1. **Firebase Console Configuration Missing**
The most common cause is that the OAuth redirect URI isn't authorized in Firebase Console.

**Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-6830756272-ca1a2`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Make sure it's **enabled**
6. Check **Authorized domains** section
7. Add these domains:
   - `localhost`
   - `studio-6830756272-ca1a2.firebaseapp.com`
   - Any custom domains you're using

### 2. **Auth Domain Issue**
Your current auth domain in config: `studio-6830756272-ca1a2.firebaseapp.com`

**Verify:**
```typescript
// In src/firebase/config.ts
export const firebaseConfig = {
  authDomain: "studio-6830756272-ca1a2.firebaseapp.com", // ✓ Correct format
  // ... other config
};
```

### 3. **Missing Error Handling**
The redirect result might have an error that's being silently caught.

**Add detailed logging:**
```typescript
// In src/app/page.tsx line 24
.catch(error => {
  console.error("Error processing redirect result:", error);
  console.error("Error code:", error.code);
  console.error("Error message:", error.message);

  // Show error to user
  if (error.code === 'auth/unauthorized-domain') {
    alert('This domain is not authorized. Please add it in Firebase Console.');
  }
})
```

### 4. **Browser Issues**
- **Third-party cookies blocked**: Google Sign-in requires third-party cookies
- **Popup blockers**: Redirect mode should work around this
- **Browser extensions**: Ad blockers or privacy extensions might interfere

**Test:**
- Try in incognito/private mode
- Try a different browser
- Disable browser extensions

### 5. **Local Development URL**
If running on `localhost:3000`, make sure:
- `localhost` is in authorized domains (Firebase Console)
- Port doesn't need to be specified in Firebase Console

## Quick Fix Steps

### Step 1: Add Error Display
Update `src/app/page.tsx`:

```typescript
const [authError, setAuthError] = useState<string | null>(null);

useEffect(() => {
  if (auth) {
    setIsProcessingRedirect(true);
    handleRedirectResult(auth)
      .catch(error => {
        console.error("Error processing redirect result:", error);
        setAuthError(`Auth Error: ${error.code} - ${error.message}`);
      })
      .finally(() => {
        setIsProcessingRedirect(false);
      });
  }
}, [auth]);

// In render, show error if exists
{authError && (
  <div className="text-red-500 mt-4 p-4 border border-red-500 rounded">
    {authError}
  </div>
)}
```

### Step 2: Check Firebase Console
1. Authentication → Sign-in method → Google → **Enabled?**
2. Authentication → Settings → Authorized domains → **localhost listed?**

### Step 3: Verify Browser Console
Open browser DevTools (F12) and check for:
- Red errors after redirect
- Network tab → Any failed requests?
- Console → Any Firebase auth errors?

## Testing Checklist

- [ ] Google provider enabled in Firebase Console
- [ ] `localhost` in authorized domains
- [ ] Third-party cookies enabled in browser
- [ ] No errors in browser console
- [ ] Tried in incognito mode
- [ ] `automaticDataCollectionEnabled: false` set in config

## Expected Flow

1. User clicks "Sign in with Google" → `initiateGoogleSignIn()` called
2. Browser redirects to Google OAuth page
3. User selects Google account
4. Google redirects back to your app at `authDomain`
5. `handleRedirectResult()` processes the result
6. `onAuthStateChanged` fires with user
7. `useUser()` hook updates with user data
8. Page redirects to `/dashboard`

## If Still Failing

Check the exact error code:
- `auth/unauthorized-domain` → Add domain to Firebase Console
- `auth/popup-blocked` → Shouldn't happen with redirect flow
- `auth/cancelled-popup-request` → Shouldn't happen with redirect flow
- `auth/network-request-failed` → Check internet connection
- `auth/internal-error` → Check Firebase config is correct

## Debug Output

Run this in browser console after redirect:
```javascript
firebase.auth().getRedirectResult().then(result => {
  console.log('Redirect result:', result);
}).catch(error => {
  console.error('Redirect error:', error);
});
```
