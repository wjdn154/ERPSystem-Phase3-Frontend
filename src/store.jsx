import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import menuReducer from './config/redux/menuSlice';
import authReducer from './config/redux/authSlice';
import notificationReducer from './config/redux/notificationSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        menu: menuReducer,
        notification: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // redux-persist 관련 경고 무시
        }),
});

export const persistor = persistStore(store);

export default store;