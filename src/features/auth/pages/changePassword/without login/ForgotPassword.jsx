import React from 'react'
import { useAuth } from '../../../hooks/useAuth';

function ForgotPassword() {

    const {loading ,sendForgotPasswordEmail} = useAuth();
    const [email, setEmail] = React.useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await sendForgotPasswordEmail({email});
        if(success) {
            alert("Reset password email sent successfully!");
        }
        else {
            alert("Failed to send reset password email. Please try again.");
        }
    }

    if(loading) {
        return <main><div>Loading...</div></main>;
    }

  return (
    <main>
        <div>Forgot Password</div>
        <form onSubmit={handleSubmit}>
            <div className='input-group'>
                <input 
                    type="email" 
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <button type="submit" className='button primary-button'>Send Reset Password Email</button>    
        </form>
    </main>
  )
}

export default ForgotPassword