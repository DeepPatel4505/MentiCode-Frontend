import {createBrowserRouter} from 'react-router'
import Protected from '../features/auth/components/Protected.jsx'
import authRoutes from './auth.routes.jsx'
import analyzeRoutes from './analyze.routes.jsx'
import GlobalLayout from '../layouts/GlobalLayout.jsx'

import HomePage from '../features/auth/pages/HomePage.jsx'
import TestTailwindCss from '../features/analyze/pages/TestTailwindCss.jsx'
const router = createBrowserRouter([
  ...authRoutes,
  ...analyzeRoutes,
  {
    path: '/',
    element: <Protected><GlobalLayout><HomePage /></GlobalLayout></Protected>,
  },
  {
    path: '/testtailwindcss',
    element: <TestTailwindCss />,
  },
  
  
])

export default router
