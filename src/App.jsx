import {RouterProvider} from 'react-router'
import router from './routes/app.routes.jsx'
import { AuthProvider } from './features/auth/context/auth.context.jsx'
import { CourseProvider } from './features/course/context/course.context.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'

function App() {


  return (
    <AuthProvider>
      <ToastProvider>
        <CourseProvider>
          <RouterProvider router={router} />
        </CourseProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
