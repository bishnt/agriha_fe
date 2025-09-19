# Authentication Test Plan

## Test the Fixed Authentication System

### Test Steps:

1. **Visit the application**: Open http://localhost:3000
2. **Verify initial state**: 
   - Header should show "Sign In" button (not user avatar)
   - "Post Property" button should be visible but redirect to sign in when clicked

3. **Test Sign In Flow** (with debugging enabled):
   - Click "Sign In" button or navigate to `/auth/signin`
   - Open browser console to see debug logs
   - Use test credentials:
     - Phone: `9813522044` or `9800000000`
     - Password: `Bishrant`
   - **Look for console logs:**
     - `SignInClient: Login successful, response: ...`
     - `AuthContext: handleLogin called with token: ...`
     - `SignInClient: Navigating to /agent/dashboard`
   - After successful login:
     - Should redirect to `/agent/dashboard`
     - Session should be stored in browser (cookies + localStorage)
     - Header should now show user avatar instead of "Sign In" button

4. **Test Authenticated State** (with debugging enabled):
   - User avatar should appear in header with dropdown menu
   - Click "List Property" button (should show for agents)
   - **Look for console logs:**
     - `Header: handlePostProperty called`
     - `Header: isAuthenticated: true`
     - `Header: user: {is_agent: true, ...}`
     - `Header: User is agent, redirecting to dashboard`
   - Should redirect to `/agent/dashboard`
   - Dropdown should show user info and sign out option

5. **Test Session Persistence**:
   - Refresh the page
   - Authentication state should persist
   - User should remain logged in

6. **Test Sign Out**:
   - Click avatar dropdown → "Sign out"
   - Should redirect to home page
   - Header should show "Sign In" button again
   - Session should be cleared from browser storage

### Expected Behavior:
- ✅ Sign in redirects to `/agent/dashboard` (not `/agent/listProperty`)
- ✅ Session persists in browser storage (cookies + localStorage)  
- ✅ Header UI updates to show avatar when authenticated
- ✅ "List Property" button redirects to dashboard when user is agent
- ✅ Authentication state persists across page refreshes
- ✅ Sign out properly clears session and updates UI

### Test Environment:
- Frontend: http://localhost:3000
- Authentication uses mock GraphQL responses for test phones
- Real GraphQL backend integration ready for production