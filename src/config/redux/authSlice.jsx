import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const initialAuthState = {
    token: null,
    userNickname: null,
    isAdmin: false,
    permission: {},
    companyId: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    reducers: {
        setAuth: (state, action) => {
            const { token, permission, isAdmin } = action.payload;

            if (permission !== undefined) state.permission = permission;
            if (isAdmin !== undefined) state.isAdmin = isAdmin;


            if (token && typeof token === 'string') {
                state.token = token;

                try {
                    const decodedToken = jwtDecode(token);
                    state.userNickname = decodedToken.userNickname;
                    state.companyId = decodedToken.companyId;
                } catch (error) {
                    state.token = null;
                    state.userNickname = null;
                    state.companyId = null;
                }
            }
        },
        logout: (state) => {
            state.token = null;
            state.userNickname = null;
            state.isAdmin = false;
            state.permission = null;
            state.companyId = null;
        },
    },
});

const persistConfig = {
    key: 'auth',
    storage,
    whitelist: ['token', 'userNickname', 'isAdmin', 'permission', 'companyId'],
};

export const { setAuth, logout } = authSlice.actions;
export default persistReducer(persistConfig, authSlice.reducer);