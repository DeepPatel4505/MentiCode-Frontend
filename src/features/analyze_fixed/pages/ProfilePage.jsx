import { useAuth } from '../../auth/hooks/useAuth.js'
import { getOAuthSignInUrl } from '../../auth/services/auth.api.js'

function ProfilePage() {
  const { user, handleLogout } = useAuth()
  const isGithubConnected = Boolean(user?.githubId) || (user?.loginProvider || '').toLowerCase() === 'github'
  const githubOAuthUrl = getOAuthSignInUrl('github')

  return (
    <section className="analyze-profile">
      <p className="analyze-profile__eyebrow">Account</p>
      <h1>Profile Settings</h1>
      <p className="analyze-profile__description">
        Manage your connected account details and session preferences for analysis workflows.
      </p>

      <div className="analyze-profile__card">
        <div className="analyze-profile__row">
          <span>Name</span>
          <strong>{user?.name ?? 'Not available'}</strong>
        </div>
        <div className="analyze-profile__row">
          <span>Email</span>
          <strong>{user?.email ?? 'Not available'}</strong>
        </div>
        <div className="analyze-profile__row">
          <span>GitHub</span>
          <strong>{isGithubConnected ? 'Connected' : 'Not connected'}</strong>
        </div>
      </div>

      {!isGithubConnected && (
        <a href={githubOAuthUrl} >
          Connect GitHub for Repo Analysis
        </a>
      )}

      <button type="button" onClick={handleLogout} >
        Logout
      </button>
    </section>
  )
}

export default ProfilePage