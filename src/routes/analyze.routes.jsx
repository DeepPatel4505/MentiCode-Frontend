import Protected from '../features/auth/components/Protected.jsx'
import AnalyzeHome from '../features/analyze/pages/AnalyzeHome.jsx'
import PlaygroundPage from '../features/analyze/pages/PlaygroundPage.jsx'
import JobResultPage from '../features/analyze/pages/JobResultPage.jsx'
import ProfilePage from '../features/analyze/pages/ProfilePage.jsx'
import AnalyzeSidebar from '../features/analyze/sidebar/AnalyzeSidebar.jsx'
import PlaygroundEditorPage from '../features/analyze/pages/PlaygroundEditorPage.jsx'
import GlobalLayout from '../layouts/GlobalLayout.jsx'
import CreateNewPlayground from '../features/analyze/pages/CreateNewPlayground.jsx'

const withAnalyzeLayout = (page) => (
  <Protected>
    <GlobalLayout featureSidebar={<AnalyzeSidebar />}>{page}</GlobalLayout>
  </Protected>
)

const analyzeRoutes = [
  {
    path: '/analyze',
    element: withAnalyzeLayout(<AnalyzeHome />)
  },
  {
    path: '/analyze/playground',
    element: withAnalyzeLayout(<PlaygroundPage />)
  },
  {
    path: '/analyze/playground/new',
    element: <CreateNewPlayground />
  },
  {
    path: '/analyze/playground/:id',
    element: <PlaygroundEditorPage />
  },
  {
    path: '/analyze/my-analysis',
    element: withAnalyzeLayout(<JobResultPage />)
  },
  {
    path: '/analyze/my-analysis/:jobId',
    element: withAnalyzeLayout(<JobResultPage />)
  },
  {
    path: '/analyze/profile',
    element: withAnalyzeLayout(<ProfilePage />)
  },
  {
    path: '/analyze/job-result',
    element: withAnalyzeLayout(<JobResultPage />)
  },
  {
    path: '/analyze/job-result/:jobId',
    element: withAnalyzeLayout(<JobResultPage />)
  }
]

export default analyzeRoutes