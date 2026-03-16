import React from 'react'
import { useAuth } from '../../../hooks/useAuth';
import { useParams , useNavigate} from 'react-router';

function ResetPassword() {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const {loading, setForgotPassword} = useAuth();

  const token = useParams().token;
  const navigate = useNavigate();

    // useEffect = () => {
    //     if(!token) {
    //         alert("Invalid or missing token!");
    //         return;
    //     }

    //     // await 
    // },[]}
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const success = await setForgotPassword({token,newPassword});
        if(success) {
            alert("Password reset successfully!");
        }
        else {
            alert("Failed to reset password. Please try again.");
        }
    }

    if(loading) { 
      return <main><p>Loading....</p></main>;
    }

  return (
    <main>
      <div>Reset Password</div>
      <form onSubmit={handleSubmit}>
        <div className='input-group'>
          <label >Password</label>
        <input 
          type="text"
          placeholder='Enter new password'
          value={newPassword}
          onChange={(e)=>{setNewPassword(e.target.value)}}
        />
        </div>
        <div className='input-group'>
          <label>Confirm Password</label>
        <input 
          type="text"
          placeholder='Confirm Password'
          value={confirmPassword}
          onChange={(e)=>{setConfirmPassword(e.target.value)}}
        />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </main>
  )
}

export default ResetPassword