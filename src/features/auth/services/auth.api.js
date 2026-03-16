import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
})
const SUPPORTED_OAUTH_PROVIDERS = new Set(['google', 'github'])

export const getOAuthSignInUrl = (provider) => {
    if (!SUPPORTED_OAUTH_PROVIDERS.has(provider)) {
        throw new Error(`Unsupported OAuth provider: ${provider}`)
    }

    return `${API_URL}/auth/${provider}`
}

export const login = async ({email,password}) => {
    try {
        const response = await api.post(`auth/login`, {email,password})
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}

export const register = async ({username,email,password}) => {
    try {
        const response = await api.post(`/auth/register`, {username,email,password})
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}   

export const logout = async () => {
    try {
        const response = await api.post(`/auth/logout`)
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}

export const getMe = async () => {
    try {
        const response = await api.get(`/auth/me`)
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}

export const refresh = async () => {
    try {
        const response = await api.post(`/auth/refresh`)
        return response.data.accessToken;
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}  

export const forgotPassword = async ({email}) => {
    try {
        const response = await api.post(`/auth/forgot-password`, {email})
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}

export const resetPassword = async ({token,newPassword}) => {
    try {
        const response = await api.post(`/auth/reset-forgot-password/${token}`, {newPassword})
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}

export const changePassword = async ({oldPassword, newPassword}) => {
    try {
        const response = await api.post(`/auth/change-password`, {oldPassword, newPassword})
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}

export const setPassword = async ({newPassword}) => {
    try {
        const response = await api.post(`/auth/set-password`, {newPassword})
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error.response.data
    }
}
