import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import {login,logout,register,getMe,forgotPassword,resetPassword} from '../services/auth.api.js'

export const useAuth = () => {
    const context = useContext(AuthContext);
    const {user, setUser, loading, setLoading} = context;

    const handleLogin = async ({email,password}) => {
        setLoading(true);
        try {

            const data = await login({email,password});
            console.log("Login successful:", data);
            setUser(data.data.user);
        } 
        catch (error) 
        {
            console.error("Login failed:", error);
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const handleRegister = async ({username,email,password}) => {
        setLoading(true);
        try {
            const data = await register({username,email,password});
            setUser(data.data.user);
        } 
        catch (error) 
        {
            console.error("Registration failed:", error);
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } 
        catch (error) 
        {
            console.error("Logout failed:", error);
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const data = await getMe();
            setUser(data.data.user);
        } 
        catch (error) 
        {
            console.error("Fetch current user failed:", error);
            setUser(null); // Clear user on failure
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const sendForgotPasswordEmail = async ({email}) => {
        setLoading(true);
        try {
            await forgotPassword({email});
            return true; // Indicate success
        } 
        catch (error) 
        {
            console.error("Forgot password request failed:", error);
            return false; // Indicate failure  
        } 
        finally 
        {
            setLoading(false);
        }
    };
    const setForgotPassword = async ({token, newPassword}) => {
        setLoading(true);
        try {
            console.log(token)
            await resetPassword({token, newPassword});
            return true; // Indicate success
        }
        catch (error)
        {
            console.error("Reset password request failed:", error);
            return false; // Indicate failure
        }
        finally
        {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
        fetchCurrentUser,
        sendForgotPasswordEmail,
        setForgotPassword,
    }
}