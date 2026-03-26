import { createContext, useEffect } from "react";
import { useState } from "react";
import { getMe, refresh } from "../services/auth.api.js";
import { setApiAuthToken } from "../../../lib/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        console.log("AuthProvider mounted, checking authentication...");
        const getAndSetUser = async () => {
            try {
                const newAccessToken = await refresh();
                if (!newAccessToken) {
                    console.log("No token received, user is not authenticated.");
                    setUser(null);
                    setAccessToken(null);
                    return;
                }
                setAccessToken(newAccessToken);

                const userData = await getMe();
                setUser(userData?.data?.user ?? null);
            } catch {
                setUser(null);
                setAccessToken(null);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, []);

    useEffect(() => {
        setApiAuthToken(accessToken);
    }, [accessToken]);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                accessToken,
                setAccessToken,
                loading,
                setLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
