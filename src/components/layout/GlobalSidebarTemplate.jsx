import { NavLink } from 'react-router-dom'

const primaryNavigation = [
  { path: '/', label: 'Home', short: 'HM' },
  { path: '/analyze', label: 'Analyze', short: 'AN' }
]

function GlobalSidebarTemplate() {
  return (
    <nav className="global-rail" aria-label="Global navigation">
      <div className="global-rail__brand">MC</div>

      <div className="global-rail__links">
        {primaryNavigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `global-rail__link ${isActive ? 'global-rail__link--active' : ''}`
            }
            title={item.label}
          >
            <span>{item.short}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default GlobalSidebarTemplate