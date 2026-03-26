import { useAuth } from '../../auth/hooks/useAuth.js'

function ProfilePage() {
  const { user, handleLogout } = useAuth()

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
          <strong>{user?.githubAccessToken ? 'Connected' : 'Not connected'}</strong>
        </div>
      </div>

      <button type="button" onClick={handleLogout} className="analyze-profile__logout">
        Logout
      </button>
    </section>
  )
}

export default ProfilePage