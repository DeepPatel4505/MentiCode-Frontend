import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router'
import GlobalTopNavbar from '../components/navbar/GlobalTopNavbar.jsx'
import { cn } from '../lib/utils.js'

const SIDEBAR_MIN_WIDTH = 220
const SIDEBAR_MAX_WIDTH = 420
const SIDEBAR_DEFAULT_WIDTH = 260

function DefaultWorkspaceSidebar() {
  return (
    <aside className="px-3.5 py-4.5 min-h-full" aria-label="Workspace navigation">
      <div className="mb-4.5">
        <p className="m-0 text-text-muted uppercase tracking-uppercase text-badge text-xs">Feature</p>
        <h2 className="mt-1.5 text-2xl font-bold">Courses</h2>
      </div>

      <nav className="flex flex-col gap-1.75">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'no-underline text-text-muted rounded-[9px] border border-transparent px-3 py-2.5 font-semibold transition-all duration-200 ease-out',
              isActive
                ? 'text-white3 border-yellow-700 bg-sidebar-active'
                : 'hover:text-white5 hover:border-gray-700 hover:bg-gray-900'
            )
          }
        >
          Library
        </NavLink>
        <button type="button" className="text-left bg-transparent w-full cursor-default font-inherit p-0 text-text-muted rounded-[9px] border border-transparent px-3 py-2.5 font-semibold transition-all duration-200 ease-out hover:text-white5 hover:border-gray-700 hover:bg-gray-900">
          Quest
        </button>
        <button type="button" className="text-left bg-transparent w-full cursor-default font-inherit p-0 text-text-muted rounded-[9px] border border-transparent px-3 py-2.5 font-semibold transition-all duration-200 ease-out hover:text-white5 hover:border-gray-700 hover:bg-gray-900">
          Study Plan
        </button>
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
    <div 
      className="
        h-screen 
        grid 
        grid-rows-[56px_minmax(0,1fr)] 
        bg-bg-page 
        text-text-primary 
        font-manrope 
        overflow-hidden
      "
    >
      <GlobalTopNavbar />

      <div
        className={cn(
          'grid min-h-0 overflow-hidden relative',
          isSidebarCollapsed ? 'grid-cols-1' : 'grid-cols-[260px_minmax(0,1fr)]',
          isResizing && 'user-select-none cursor-col-resize'
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
          className="
            absolute top-10 left-[calc(var(--sidebar-width)-11px)] 
            w-5.5 h-5.5 rounded-full border border-(--ui-border-strong) 
            bg-(--bg-elevated) text-(--text-main) 
            grid place-items-center 
            font-bold text-xs 
            cursor-pointer z-7 
            leading-none 
            shadow-toggle 
            transition-all duration-150 
            ease-out
            hover:scale-106 hover:border-(--ui-border-soft) hover:shadow-toggle-hover
          "
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isSidebarCollapsed}
        >
          {isSidebarCollapsed ? '>' : '<'}
        </button>

        {/* Sidebar */}
        {!isSidebarCollapsed ? (
          <aside className="border-r border-border bg-bg-sidebar relative min-w-0">
            <div className="h-full overflow-y-auto">
              {featureSidebar ?? <DefaultWorkspaceSidebar />}
            </div>

            {/* Resize Handle */}
            <button
              type="button"
              onMouseDown={handleResizeStart}
              className="
                absolute top-0 -right-1 
                w-2 h-full 
                border-none bg-transparent 
                cursor-col-resize z-3
                hover:bg-resize-gradient
              "
              aria-label="Resize sidebar"
              tabIndex={-1}
            />
          </aside>
        ) : null}

        {/* Main Content */}
        <main className="bg-bg-content p-5.5 overflow-y-auto overflow-x-visible">
          {children}
        </main>
      </div>
    </div>
  )
}

export default GlobalLayout


