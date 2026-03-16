import React,{useState} from 'react'
import { useNavigate,Link } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';
import { getOAuthSignInUrl } from '../services/auth.api.js';

function Login() {

    const {loading, handleLogin} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const googleOAuthUrl = getOAuthSignInUrl('google');
    const githubOAuthUrl = getOAuthSignInUrl('github');

    const navigate = useNavigate();

    const handleSubmit = async (e) => { 
        e.preventDefault();
        await handleLogin({email, password});
        navigate('/');
    }

    if(loading) {
        return <main><div>Loading...</div></main>;
    }
  return (
    <main>
        <div>Login</div>
                <a href={googleOAuthUrl}>Google Sign In</a>
                <a href={githubOAuthUrl}>Github Sign In</a>
        <form onSubmit={handleSubmit}>
            <div className='input-group'>
                <input 
                    type="email" 
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className='input-group'>
                <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button className='button primary-button'>Login</button>    
        </form>
        <p><Link to="/forgot-password">Forgot Password?</Link></p>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
    </main>
  )
}

export default Login