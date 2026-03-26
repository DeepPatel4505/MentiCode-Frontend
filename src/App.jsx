import {RouterProvider} from 'react-router'
import router from './routes/app.routes.jsx'
import { AuthProvider } from './features/auth/context/auth.context.jsx'

function App() {


  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
