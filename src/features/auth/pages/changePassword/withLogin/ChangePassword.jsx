import React from 'react'
import { useNavigate } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';

function ChangePassword() {

    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {user, loading, changeCurrentPassword, setInitialPassword} = useAuth();
    const navigate = useNavigate();

    // OAuth users (google/github) have no password set yet
    const hasPassword = user?.loginProvider === 'local';


    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        if(hasPassword && currentPassword.length < 8) {
            setErrorMessage('Current password must be at least 8 characters.');
            return;
        }
        if(newPassword.length < 8) {
            setErrorMessage('New password must be at least 8 characters.');
            return;
        }
        if(newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match!');
            return;
        }

        setIsSubmitting(true);
        const result = hasPassword
            ? await changeCurrentPassword({oldPassword: currentPassword, newPassword})
            : await setInitialPassword({newPassword});
        setIsSubmitting(false);
        if(result.success) {
            setSuccessMessage(result.message);
            setTimeout(() => navigate('/'), 1500);
        }
        else {
            setErrorMessage(result.message);
        }
    }

    if(!user) {
        return <main><p>Please log in to change your password.</p></main>;
    }
    if(loading) { 
      return <main><p>Loading....</p></main>;
    }

  return (
    <main>
        <div>{hasPassword ? 'Change Password' : 'Set Password'}</div>
        <form onSubmit={handleSubmit}>
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
            {successMessage && <p style={{color: 'green'}}>{successMessage}</p>}
            {hasPassword && (
                <div className='input-group'>
                    <input 
                        type="password" 
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
            )}
            <div className='input-group'>
                <input 
                    type="password" 
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <div className='input-group'>
                <input 
                    type="password" 
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            <button type="submit" className='button primary-button' disabled={isSubmitting}>
                {isSubmitting ? (hasPassword ? 'Changing...' : 'Setting...') : (hasPassword ? 'Change Password' : 'Set Password')}
            </button>    
        </form> 

    </main>
  )
}

export default ChangePassword