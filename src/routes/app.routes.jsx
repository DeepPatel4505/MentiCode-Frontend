import {createBrowserRouter} from 'react-router'
import Protected from '../features/auth/components/Protected.jsx'
import authRoutes from './auth.routes.jsx'
import analyzeRoutes from './analyze.routes.jsx'
import courseRoutes from './course.routes.jsx'
import OnboardRoute from './guards/OnboardRoute.jsx'
import GlobalTopNavbar from '../components/navbar/GlobalTopNavbar.jsx'

import ProfilePage from '../features/analyze/pages/ProfilePage.jsx'
import TestTailwindCss from '../features/analyze/pages/TestTailwindCss.jsx'

const withTopbarOnlyLayout = (page) => (
  <Protected>
    <OnboardRoute>
      <div className="h-screen grid grid-rows-[56px_minmax(0,1fr)] bg-bg-page text-text-primary font-manrope overflow-hidden">
        <GlobalTopNavbar />
        <main className="bg-bg-content p-5.5 overflow-y-auto overflow-x-visible">{page}</main>
      </div>
    </OnboardRoute>
  </Protected>
)

const router = createBrowserRouter([
  ...authRoutes,
  ...analyzeRoutes,
  ...courseRoutes,
  {
    path: '/profile',
    element: withTopbarOnlyLayout(<ProfilePage />),
  },
  {
    path: '/profile/:userId',
    element: withTopbarOnlyLayout(<ProfilePage />),
  },
  {
    path: '/testtailwindcss',
    element: <TestTailwindCss />,
  },
  
  
])

export default router
