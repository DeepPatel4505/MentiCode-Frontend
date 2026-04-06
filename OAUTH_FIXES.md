# OAuth Backend Fixes

Replace the `googleCallback` and `githubCallback` in your auth controller with these fixes:

## 1. Fix sameSite: none (Line 454)
```javascript
// ❌ WRONG
sameSite: none  // This is a variable reference, evaluates to undefined

// ✅ CORRECT  
sameSite: "none"  // String literal
```

## 2. Add secure: true when using sameSite: "none"
```javascript
// ✅ CORRECT
const options = {
  httpOnly: true,
  secure: true,  // REQUIRED with sameSite: "none"
  sameSite: "none",
  path: "/"
};
```

## 3. Redirect to /auth/callback instead of root
```javascript
// ❌ OLD
res.redirect(process.env.FRONTEND_URL);

// ✅ NEW  
res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
```

## Complete Fixed Functions

### Google OAuth Callback
```javascript
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  
  const { tokens } = await googleClient.getToken({
    code,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL
  });

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const { email, sub, picture } = payload;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username: email.split("@")[0],
        googleId: sub,
        avatarUrl: picture,
        loginProvider: "google",
        isEmailVerified: true
      }
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

  // ✅ FIX: Use "none" (string), secure: true, and redirect to callback
  const options = {
    httpOnly: true,
    secure: true,  // Required with sameSite: "none"
    sameSite: "none",
    path: "/"
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect(`${process.env.FRONTEND_URL}/auth/callback`);
});
```

### GitHub OAuth Callback
```javascript
const githubCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  const tokenResponse = await axios.post(
    githubConfig.tokenUrl,
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    { headers: { Accept: "application/json" } }
  );

  const githubAccessToken = tokenResponse.data.access_token;

  const userResponse = await axios.get(githubConfig.userUrl, {
    headers: { Authorization: `Bearer ${githubAccessToken}` }
  });

  const { id, login, avatar_url } = userResponse.data;

  const emailResponse = await axios.get(githubConfig.emailUrl, {
    headers: { Authorization: `Bearer ${githubAccessToken}` }
  });

  const email = emailResponse.data.find(e => e.primary).email;
  const githubUserId = id.toString();

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username: login,
        githubId: githubUserId,
        avatarUrl: avatar_url,
        loginProvider: "github",
        isEmailVerified: true,
        githubAccessToken
      }
    });
  } else {
    if (user.githubId && user.githubId !== githubUserId) {
      throw new ApiError(409, "GitHub account does not match existing user");
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        githubAccessToken,
        githubId: user.githubId ?? githubUserId,
        isEmailVerified: true
      }
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

  // ✅ FIX: Redirect to callback endpoint
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect(`${process.env.FRONTEND_URL}/auth/callback`);
});
```

## Environment Variables Check
Make sure your `.env` has:
```
FRONTEND_URL=http://localhost:5173        # Development
# or
FRONTEND_URL=https://yourdomain.com       # Production

GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
```

## Testing
1. Click "Sign in with Google/GitHub" → should redirect to `/auth/callback`
2. You should see a loading spinner
3. Should redirect to `/courses` (student) or `/admin` (admin)
4. If stuck on callback page → check browser Network tab for `/auth/me` failures
