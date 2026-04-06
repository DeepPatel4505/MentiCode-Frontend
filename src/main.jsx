import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store, persistor } from "@/app/store/index";
import { ToastProvider } from "@/components/ui/Toast";
import LevelUpModal from "@/components/ui/LevelUpModal";
import { router } from "@/routes/index";
import { initTheme } from "@/app/store/slices/uiSlice";
import { fetchMyCourses } from "@/app/store/slices/courseSlice";
import { selectIsAuth } from "@/app/store/slices/authSlice";
import "./styles/index.css";
import "@/features/analyze/analyze.css";
import "@/layouts/GlobalLayout.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function Root() {
  const dispatch = useDispatch();
  const isAuth   = useSelector(selectIsAuth);

  useEffect(() => { dispatch(initTheme()); }, [dispatch]);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchMyCourses());
    }
  }, [dispatch, isAuth]);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <LevelUpModal />
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <Root />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
