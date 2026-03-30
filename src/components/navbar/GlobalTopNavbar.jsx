import { useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils.js'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import DropdownPortal from '../ui/DropdownPortal.jsx'

function GlobalTopNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, handleLogout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const profileButtonRef = useRef(null)
  const isAuth = !!user

  const profileHref = '/profile'
  const initials = (user?.username?.slice(0, 2) || 'MC').toUpperCase()

  const onOpenProfile = () => {
    setMenuOpen(false)
    navigate(profileHref)
  }

  const onSignOut = async () => {
    await handleLogout()
    setMenuOpen(false)
    navigate('/login')
  }

  return (
    <header 
      className="
        sticky top-0 z-nav 
        h-navbar border-b border-border 
        bg-navbar-gradient 
        flex justify-between items-center 
        px-4 gap-3.5
      " 
      aria-label="Global app navigation"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <NavLink 
          to="/" 
          end 
          className="no-underline text-white font-bold text-2xl tracking-tight whitespace-nowrap"
        >
          MentiC<span className="text-accent-amber">o</span>de
        </NavLink>

        <nav className="flex items-center gap-1" aria-label="Primary tabs">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'no-underline text-text-muted rounded-xs px-2.5 py-2 text-sm font-semibold transition-colors duration-200 relative overflow-visible',
                isActive
                  ? 'text-white after:absolute after:-bottom-2.25 after:left-2.5 after:right-2.5 after:h-0.5 after:rounded-full after:bg-active'
                  : 'hover:text-white hover:bg-hover-subtle'
              )
            }
          >
            Courses
          </NavLink>
          <NavLink
            to="/analyze"
            className={({ isActive }) =>
              cn(
                'no-underline text-text-muted rounded-xs px-2.5 py-2 text-sm font-semibold transition-colors duration-200 relative overflow-visible',
                isActive
                  ? 'text-white after:absolute after:-bottom-2.25 after:left-2.5 after:right-2.5 after:h-0.5 after:rounded-full after:bg-active'
                  : 'hover:text-white hover:bg-hover-subtle'
              )
            }
          >
            Analyze
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-3.5 min-w-0">
        <label 
          className="
            min-w-[min(280px,45vw)] h-8.5 
            border border-nav rounded-full 
            bg-(--ui-bg-neutral) 
            flex items-center px-3
          " 
          aria-label="Search"
        >
          <input 
            type="text" 
            placeholder="Search" 
            readOnly 
            className="
              border-none outline-none 
              w-full bg-transparent 
              text-(--ui-text-neutral) text-sm
              placeholder:text-(--ui-text-dim)
            "
          />
        </label>

        <button 
          type="button" 
          className="
            border border-lighter bg-elevated 
            text-white rounded-full 
            w-8.5 h-8.5 
            grid place-items-center
          " 
          aria-label="Notifications"
        >
          <span className="w-2 h-2 rounded-full bg-active" />
        </button>

        <button 
          ref={profileButtonRef}
          type="button"
          onClick={() => {
            if (!isAuth) {
              navigate('/login')
              return
            }
            setMenuOpen((prev) => !prev)
          }}
          className="
            border border-lighter bg-elevated 
            text-white rounded-full 
            w-8.5 h-8.5 
            grid place-items-center 
            text-xs font-bold
          " 
          aria-label="Profile"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          {initials}
        </button>

        <DropdownPortal
          anchorRef={profileButtonRef}
          isOpen={menuOpen && isAuth}
          onClose={() => setMenuOpen(false)}
        >
          <button
            type="button"
            role="menuitem"
            onClick={onOpenProfile}
            className="w-full text-left rounded-xs px-3 py-2 text-sm font-medium border-none bg-transparent text-text-muted hover:text-text-light hover:bg-white/5"
          >
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            disabled={loading}
            className="w-full text-left rounded-xs px-3 py-2 text-sm font-medium border-none bg-transparent text-text-muted hover:text-text-light hover:bg-white/5"
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </DropdownPortal>
      </div>
    </header>
  )
}

export default GlobalTopNavbar

