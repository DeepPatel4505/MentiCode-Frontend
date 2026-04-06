import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    theme:         "dark",
    sidebarOpen:   false,
    notifications: [],
  },
  reducers: {
    toggleTheme: (s) => {
      s.theme = s.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("light", s.theme === "light");
    },
    initTheme: (s) => {
      document.documentElement.classList.toggle("light", s.theme === "light");
    },
    toggleSidebar:  (s) => { s.sidebarOpen = !s.sidebarOpen; },
    closeSidebar:   (s) => { s.sidebarOpen = false; },
    addNotification:(s, a) => { s.notifications.unshift({ id: Date.now(), ...a.payload }); },
    removeNotification:(s, a) => { s.notifications = s.notifications.filter((n) => n.id !== a.payload); },
  },
});

export const { toggleTheme, initTheme, toggleSidebar, closeSidebar, addNotification, removeNotification } = uiSlice.actions;
export const selectTheme        = (s) => s.ui.theme;
export const selectSidebarOpen  = (s) => s.ui.sidebarOpen;
export const selectNotifications= (s) => s.ui.notifications;

export default uiSlice.reducer;
