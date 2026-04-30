import { useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import DropdownPortal from '../ui/DropdownPortal.jsx'

function GlobalTopNavbar() {
  const navigate = useNavigate()
  const { user, loading, handleLogout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const profileButtonRef = useRef(null)
  const isAuth = !!user

  const initials = (user?.username?.slice(0, 2) || 'MC').toUpperCase()

  const onOpenProfile = () => {
    setMenuOpen(false)
    navigate('/profile')
  }

  const onSignOut = async () => {
    await handleLogout()
    setMenuOpen(false)
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    cn(
      'no-underline text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-150 relative',
      isActive
        ? 'text-white after:absolute after:left-3 after:right-3 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-violet-500'
        : 'text-neutral-400 hover:text-white hover:bg-white/5'
    )

  return (
    <header
      className="sticky top-0 z-50 h-14 border-b border-white/[0.06] bg-[hsl(240_10%_5%)] flex items-center justify-between px-5 gap-4"
      aria-label="Global app navigation"
    >
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-4 min-w-0">
        <NavLink to="/" end className="no-underline text-white font-bold text-lg tracking-tight whitespace-nowrap">
          Menti<span className="text-violet-400">Code</span>
        </NavLink>

        <nav className="flex items-center gap-0.5" aria-label="Primary navigation">
          <NavLink to="/" className={navLinkClass}>Analyze</NavLink>
          <NavLink to="/courses" end className={navLinkClass}>
            Courses
          </NavLink>
        </nav>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Search */}
        <label
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] min-w-[220px] max-w-[340px] cursor-text transition-colors focus-within:border-violet-500/50"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            readOnly
            className="border-none outline-none w-full bg-transparent text-neutral-300 text-sm placeholder:text-neutral-600"
          />
        </label>

        {/* Notifications */}
        <button
          type="button"
          className="w-8 h-8 rounded-md border border-white/[0.08] bg-white/[0.04] grid place-items-center text-neutral-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-150"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Profile */}
        <button
          ref={profileButtonRef}
          type="button"
          onClick={() => {
            if (!isAuth) { navigate('/login'); return }
            setMenuOpen(prev => !prev)
          }}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-white/[0.08] bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-150 text-xs font-semibold"
          aria-label="Profile"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="w-5 h-5 rounded bg-violet-600 text-white text-[10px] font-bold grid place-items-center">
            {initials}
          </span>
          <ChevronDown className="w-3 h-3 text-neutral-500" />
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
            className="w-full text-left rounded px-3 py-2 text-sm font-medium border-none bg-transparent text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            disabled={loading}
            className="w-full text-left rounded px-3 py-2 text-sm font-medium border-none bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {loading ? 'Signing out…' : 'Sign out'}
          </button>
        </DropdownPortal>
      </div>
    </header>
  )
}

export default GlobalTopNavbar
