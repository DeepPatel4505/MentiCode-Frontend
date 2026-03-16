import {createBrowserRouter} from 'react-router'
import Login from '../features/auth/pages/Login.jsx'
import Register from '../features/auth/pages/Register.jsx'
import Protected from '../features/auth/components/Protected.jsx'
import ForgotPassword from '../features/auth/pages/changePassword/withoutLogin/ForgotPassword.jsx'
import ResetPassword from '../features/auth/pages/changePassword/withoutLogin/ResetPassword.jsx'
import ChangePassword from '../features/auth/pages/changePassword/withLogin/ChangePassword.jsx'

import HomePage from '../features/auth/pages/HomePage.jsx'
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
    path: '/change-password/',
    element: <Protected><ChangePassword /></Protected>
  },
  {
    path: '/',
    element: <Protected><HomePage /></Protected>,
  },
  
  
])

export default router
