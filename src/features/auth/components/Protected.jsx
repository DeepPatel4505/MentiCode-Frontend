import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";


function Protected({children}) {
    const {user,loading} = useAuth();

    if(loading) {
        return <main><div>Loading...</div></main>;
    }
    
    if(!user) {
        console.log(user)
        return <Navigate to="/login" />;
    }

  return children;
}

export default Protected