import { createSlice } from '@reduxjs/toolkit';

// 초기 상태 설정 (알림 관련)
const initialNotificationState = {
    notifications: [],
};

// 알림 관련 슬라이스 생성
const notificationSlice = createSlice({
    name: 'notification',
    initialState: initialNotificationState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.push(action.payload);  // 새로운 알림 추가
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(noti => noti.id !== action.payload);  // 알림 제거
        },
    },
});

// 알림 관련 액션과 리듀서 익스포트
export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;