import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

import authReducer          from "./slices/authSlice";
import courseReducer        from "./slices/courseSlice";
import enrollReducer        from "./slices/enrollSlice";
import roadmapReducer       from "./slices/roadmapSlice";
import adminReducer         from "./slices/adminSlice";
import uiReducer            from "./slices/uiSlice";
import gamificationReducer  from "./slices/gamificationSlice";

const authPersist          = persistReducer({ key: "auth",          storage, whitelist: ["user", "accessToken", "isAuth"] }, authReducer);
const uiPersist            = persistReducer({ key: "ui",            storage, whitelist: ["theme"] }, uiReducer);
const gamificationPersist  = persistReducer({ key: "gamification",  storage, whitelist: ["onboarding", "streak", "longestStreak", "xpTotal", "level"] }, gamificationReducer);

const rootReducer = combineReducers({
  auth:          authPersist,
  courses:       courseReducer,
  enroll:        enrollReducer,
  roadmap:       roadmapReducer,
  admin:         adminReducer,
  ui:            uiPersist,
  gamification:  gamificationPersist,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);
export default store;
