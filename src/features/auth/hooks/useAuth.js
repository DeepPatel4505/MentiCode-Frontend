import { useDispatch, useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuth,
  selectAuthLoading,
  selectAuth,
} from "@/app/store/slices/authSlice";
import { logoutUser } from "@/app/store/slices/authSlice";

/**
 * Unified auth hook used by analyze components and GlobalTopNavbar.
 * Bridges the Redux auth slice to a simple hook interface.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);
  const loading = useSelector(selectAuthLoading);
  const auth = useSelector(selectAuth);
  const accessToken = auth?.accessToken ?? null;

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  return {
    user,
    isAuth,
    loading,
    accessToken,
    handleLogout,
  };
}

export default useAuth;
