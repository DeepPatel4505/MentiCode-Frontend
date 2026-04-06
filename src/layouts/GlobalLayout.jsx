import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Library, Map, BookOpen, Trophy, Sparkles } from 'lucide-react'
import GlobalTopNavbar from '../components/navbar/GlobalTopNavbar.jsx'
import { cn } from '../lib/utils.js'

const SIDEBAR_MIN_WIDTH = 220
const SIDEBAR_MAX_WIDTH = 420
const SIDEBAR_DEFAULT_WIDTH = 260

function DefaultWorkspaceSidebar() {
  const links = [
    { path: "/",            label: "Library",     end: true, icon: Library },
    { path: "/roadmaps",    label: "Roadmaps",              icon: Map },
    { path: "/my-learning", label: "My Learning",           icon: BookOpen },
    { path: "/leaderboard", label: "Leaderboard",           icon: Trophy },
    { path: "/pricing",     label: "Pricing",               icon: Sparkles },
  ]
  return (
    <aside className="px-3 py-5 min-h-full" aria-label="Workspace navigation">
      <div className="mb-5 px-2">
        <p className="m-0 text-[10px] uppercase tracking-[0.1em] text-neutral-600 font-semibold">Learning</p>
        <h2 className="mt-1 text-base font-semibold text-white">Courses</h2>
      </div>
      <nav className="flex flex-col gap-0.5">
        {links.map(({ path, label, end, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                'no-underline flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'text-violet-300 bg-violet-500/10'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.05]'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function GlobalLayout({ children, featureSidebar }) {
  const layoutRef = useRef(null)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (!isResizing) {
      return undefined
    }

    const onMouseMove = (event) => {
      const layoutBounds = layoutRef.current?.getBoundingClientRect()
      if (!layoutBounds) {
        return
      }

      const nextWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, event.clientX - layoutBounds.left)
      )

      setSidebarWidth(nextWidth)
    }

    const onMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing])

  useEffect(() => {
    if (isSidebarCollapsed && isResizing) {
      setIsResizing(false)
    }
  }, [isSidebarCollapsed, isResizing])

  const handleResizeStart = (event) => {
    event.preventDefault()
    if (isSidebarCollapsed) {
      return
    }

    setIsResizing(true)
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((previousValue) => !previousValue)
  }

  return (
    <div className="h-screen grid grid-rows-[56px_minmax(0,1fr)] bg-[hsl(240_10%_4%)] text-neutral-100 overflow-hidden">
      <GlobalTopNavbar />

      <div
        className={cn(
          'grid min-h-0 overflow-hidden relative',
          isSidebarCollapsed ? 'grid-cols-1' : 'grid-cols-[240px_minmax(0,1fr)]',
          isResizing && 'select-none cursor-col-resize'
        )}
        ref={layoutRef}
        style={{
          '--sidebar-width': `${isSidebarCollapsed ? 0 : sidebarWidth}px`,
          gridTemplateColumns: isSidebarCollapsed ? '1fr' : `${sidebarWidth}px minmax(0, 1fr)`
        }}
      >
        {/* Sidebar Toggle Button */}
        <button
          type="button"
          onClick={handleSidebarToggle}
          className="absolute top-10 left-[calc(var(--sidebar-width)-11px)] w-[22px] h-[22px] rounded-full border border-white/10 bg-[hsl(240_8%_10%)] text-neutral-400 grid place-items-center cursor-pointer z-[7] shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-150 hover:scale-105 hover:border-violet-500/50 hover:text-violet-300"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isSidebarCollapsed}
        >
          {isSidebarCollapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3 h-3" />
          }
        </button>

        {/* Sidebar */}
        {!isSidebarCollapsed ? (
          <aside className="border-r border-white/[0.06] bg-[hsl(240_8%_6%)] relative min-w-0">
            <div className="h-full overflow-y-auto">
              {featureSidebar ?? <DefaultWorkspaceSidebar />}
            </div>
            <button
              type="button"
              onMouseDown={handleResizeStart}
              className="absolute top-0 -right-1 w-2 h-full border-none bg-transparent cursor-col-resize z-[3] hover:bg-violet-500/10"
              aria-label="Resize sidebar"
              tabIndex={-1}
            />
          </aside>
        ) : null}

        {/* Main Content */}
        <main className="bg-[hsl(240_10%_4%)] p-6 overflow-y-auto overflow-x-visible">
          {children}
        </main>
      </div>
    </div>
  )
}

export default GlobalLayout


