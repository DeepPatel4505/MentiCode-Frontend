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
                const userData = await getMe();
                const currentUser = userData?.data?.user ?? null;
                setUser(currentUser);
                
                const token=null;
                
                try {
                    token = await refresh();
                }
                catch (refreshError) {
                    console.log("Refresh failed:", refreshError);
                }

                if(token)
                {
                    const refreshedUserData = await getMe();
                    const refreshedUser = refreshedUserData?.data?.user ?? null;
                    setUser(refreshedUser);
                }
                
            } 
            catch (error) {
                console.error("Failed to fetch current user:", error);
                setUser(null);
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