# Auth API Docs (Frontend)

## Base

- Prefix: `/api/v1/auth`

## Required Endpoints

- `POST /api/v1/auth/login`
	- Body: `{ email, password }`
	- Returns: `data.user`, `data.accessToken`

- `POST /api/v1/auth/register`
	- Body: `{ username, email, password }`
	- Returns: `data.user`

- `GET /api/v1/auth/me`
	- Auth: Bearer token or auth cookie
	- Returns: `data.user`

- `GET /api/v1/auth/google`
	- Starts Google OAuth redirect flow

- `GET /api/v1/auth/github`
	- Starts GitHub OAuth redirect flow

## Related

- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/google/callback`
- `GET /api/v1/auth/github/callback`

