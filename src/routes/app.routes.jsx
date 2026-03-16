import {createBrowserRouter} from 'react-router'
import Login from '../features/auth/pages/Login.jsx'
import Register from '../features/auth/pages/Register.jsx'
import Protected from '../features/auth/components/Protected.jsx'
import ForgotPassword from '../features/auth/pages/changePassword/without login/ForgotPassword.jsx'
import ResetPassword from '../features/auth/pages/changePassword/without login/ResetPassword.jsx'


const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    withCredentials: true
  },
  { 
    path: '/register',
    element: <Register />,
    withCredentials: true
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />
  },
  {
    path: '/',
    element: <Protected><div>Home Page</div></Protected>,
  },
  
  
])

export default router
