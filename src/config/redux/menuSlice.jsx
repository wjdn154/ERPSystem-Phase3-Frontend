import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FINANCIAL_API } from '../apiConstants.jsx';

// 초기 상태
const initialMenuState = {
    selectedMenu: '통합관리',
    selectedSubMenu: '기초정보관리',
    selectedSubSubMenu: { text: '대시보드', component: 'IntegrationDashboardPage', apiPath: undefined, url: '/integration', },
};

// 메뉴 관련 슬라이스
const menuSlice = createSlice({
    name: 'menu',
    initialState: initialMenuState,
    reducers: {
        setSelectedMenu: (state, action) => {
            state.selectedMenu = action.payload;  // 선택된 메뉴 상태 설정
        },
        setSelectedSubMenu: (state, action) => {
            state.selectedSubMenu = action.payload;  // 선택된 서브메뉴 상태 설정
        },
        setSelectedSubSubMenu: (state, action) => {
            state.selectedSubSubMenu = { ...action.payload };  // 선택된 서브서브메뉴 상태 설정
        },
        resetMenuState: (state) => {
            // 상태 초기화
            state.selectedMenu = initialMenuState.selectedMenu;
            state.selectedSubMenu = initialMenuState.selectedSubMenu;
            state.selectedSubSubMenu = initialMenuState.selectedSubSubMenu;
        },
    },
});

// persistConfig 설정
const persistConfig = {
    key: 'menu',  // 메뉴 상태를 저장할 키
    storage,      // 로컬 스토리지 사용
    whitelist: ['selectedMenu', 'selectedSubMenu', 'selectedSubSubMenu'],  // 저장할 상태 값들
};

// 메뉴 관련 액션과 리듀서 익스포트
export const { setSelectedMenu, setSelectedSubMenu, setSelectedSubSubMenu, resetMenuState } = menuSlice.actions;
export default persistReducer(persistConfig, menuSlice.reducer);