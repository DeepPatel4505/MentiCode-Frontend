import { createContext, useEffect } from "react";
import { useState } from "react";
import { getMe, refresh } from "../services/auth.api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    useEffect(() => {
            const getAndSetUser = async () => {
            try {
                // Try with the current access token first
                const userData = await getMe();
                setUser(userData?.data?.user ?? null);

                // Rotate tokens on app refresh without breaking a valid session.
                try {
                    await refresh();
                }
                catch (refreshError) {
                    console.warn("Background refresh failed:", refreshError);
                }
            } 
            catch {
                // Access token expired or missing — try to refresh
                try {
                    await refresh();
                    const userData = await getMe();
                    setUser(userData?.data?.user ?? null);
                }
                catch {
                    // Refresh token also invalid/expired — force login
                    setUser(null);
                }
            } 
            finally {
                setLoading(false);
            }
        }

        getAndSetUser();
    }, []);

    return(
        <AuthContext.Provider value={{user, setUser, loading, setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}