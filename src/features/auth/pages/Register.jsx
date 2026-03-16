import React from 'react'
import { useState } from 'react';
import { useNavigate,Link } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';

function Register() {

    const {loading, handleRegister} = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => { 
        e.preventDefault();
        await handleRegister({username, email, password});
        navigate('/login');
    }

    if(loading) {
        return <main><div>Loading...</div></main>;
    }

  return (
    <main>
        <div>Register</div>
        <form onSubmit={handleSubmit}>
            <div className='input-group'>
                <input 
                    type="text" 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
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
            <button className='button primary-button'>Register</button>    
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
    </main>
  )
}

export default Register